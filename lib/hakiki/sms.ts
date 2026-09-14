import { normalizePhone, phoneLast4, hashPhone } from "./crypto"
import { parseMobishastraResponse } from "./mobishastra-codes"
import { serviceClient } from "./supabase"

/**
 * SMS is deliberately behind a narrow interface. Mobishastra is what we use
 * today; swapping to Beem or Africa's Talking later must not require touching
 * the verification engine.
 */
export interface SmsProvider {
  readonly name: string
  send(to: string, body: string): Promise<SmsSendResult>
}

export interface SmsSendResult {
  ok: boolean
  providerMessageId?: string
  raw: string
  error?: string
}

class MobishastraAdapter implements SmsProvider {
  readonly name = "MOBISHASTRA"

  async send(to: string, body: string): Promise<SmsSendResult> {
    const user = process.env.MOBISHASTRA_USER
    const pwd = process.env.MOBISHASTRA_PASSWORD
    const senderid = process.env.MOBISHASTRA_SENDER_ID
    const base = process.env.MOBISHASTRA_BASE_URL ?? "https://mshastra.com"
    if (!user || !pwd || !senderid) {
      return { ok: false, raw: "", error: "Mobishastra credentials are not configured" }
    }

    /**
     * Mobishastra enforces an IP allowlist and Vercel functions have no
     * stable egress IP, so in production the request hops through a small
     * relay running on the whitelisted host. The relay takes only a
     * destination and a message — never a target URL — so it cannot be
     * abused as an open proxy, and the gateway password lives on that box
     * rather than travelling in a query string.
     */
    const proxy = process.env.MOBISHASTRA_PROXY_URL
    const request: RequestInit = { signal: AbortSignal.timeout(15_000), headers: { Accept: "text/plain" } }
    let target: string

    if (proxy) {
      target = proxy
      request.method = "POST"
      request.headers = {
        ...request.headers,
        "Content-Type": "application/json",
        "x-hakiki-key": process.env.MOBISHASTRA_PROXY_SECRET ?? "",
      }
      request.body = JSON.stringify({ to: normalizePhone(to), text: body })
    } else {
      const url = new URL("/sendurl.aspx", base)
      url.searchParams.set("user", user)
      url.searchParams.set("pwd", pwd)
      url.searchParams.set("senderid", senderid)
      url.searchParams.set("mobileno", normalizePhone(to))
      url.searchParams.set("msgtext", body)
      url.searchParams.set("priority", "High")
      url.searchParams.set("CountryCode", "ALL")
      // Numeric response codes instead of free text — see mobishastra-codes.ts.
      url.searchParams.set("ShowError", "C")
      target = url.toString()
      request.method = "GET"
    }

    try {
      const res = await fetch(target, request)
      const raw = (await res.text()).trim()
      if (!res.ok) return { ok: false, raw, error: `HTTP ${res.status}: ${raw.slice(0, 160)}` }

      // The gateway returns HTTP 200 even when it refuses to send, so the
      // body is the only thing that tells us what actually happened.
      const parsed = parseMobishastraResponse(raw)
      return parsed.ok
        ? { ok: true, raw }
        : { ok: false, raw, error: parsed.reason }
    } catch (err) {
      return { ok: false, raw: "", error: err instanceof Error ? err.message : "SMS request failed" }
    }
  }
}

/** No-op provider for the pilot, so we can test flows without spending credits. */
class LoggingAdapter implements SmsProvider {
  readonly name = "MOBISHASTRA"
  async send(to: string, body: string): Promise<SmsSendResult> {
    console.log(`[HAKIKI SMS · disabled] -> ${normalizePhone(to)}\n${body}`)
    return { ok: true, raw: "SMS_DISABLED", providerMessageId: undefined }
  }
}

export function smsProvider(): SmsProvider {
  return process.env.HAKIKI_SMS_ENABLED === "false" ? new LoggingAdapter() : new MobishastraAdapter()
}

/**
 * Sends an SMS and records it. Never throws: a customer who successfully
 * verified a real product must still see their result if the SMS leg fails.
 */
export async function sendSms(opts: {
  to: string
  body: string
  companyId?: string | null
}): Promise<SmsSendResult> {
  const provider = smsProvider()
  const db = serviceClient()
  let result: SmsSendResult

  try {
    result = await provider.send(opts.to, opts.body)
  } catch (err) {
    result = { ok: false, raw: "", error: err instanceof Error ? err.message : "unknown" }
  }

  try {
    await db.from("sms_events").insert({
      company_id: opts.companyId ?? null,
      direction: "OUTBOUND",
      phone_hash: hashPhone(opts.to),
      phone_last4: phoneLast4(opts.to),
      destination: normalizePhone(opts.to),
      body: opts.body,
      provider: provider.name,
      provider_message_id: result.providerMessageId ?? null,
      provider_response: result.raw?.slice(0, 1000) ?? null,
      status: result.raw === "SMS_DISABLED" ? "SKIPPED" : result.ok ? "SENT" : "FAILED",
      error: result.error?.slice(0, 500) ?? null,
    })
  } catch (err) {
    console.error("[HAKIKI] failed to log SMS event", err)
  }

  return result
}

/**
 * Remaining SMS credit.
 *
 * "No More Credits" is a documented gateway response and a silent killer:
 * verifications keep succeeding on screen while every SMS receipt quietly
 * fails. Surfacing the balance in the console makes that visible before a
 * 50,000 unit batch reaches customers.
 */
export async function checkSmsBalance(): Promise<{ ok: boolean; balance: number | null; raw: string }> {
  const user = process.env.MOBISHASTRA_USER
  const pwd = process.env.MOBISHASTRA_PASSWORD
  const base = process.env.MOBISHASTRA_BASE_URL ?? "https://mshastra.com"
  if (!user || !pwd) return { ok: false, balance: null, raw: "Credentials not configured" }

  const proxy = process.env.MOBISHASTRA_PROXY_URL
  try {
    const res = proxy
      ? await fetch(proxy, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-hakiki-key": process.env.MOBISHASTRA_PROXY_SECRET ?? "",
          },
          body: JSON.stringify({ action: "balance" }),
          signal: AbortSignal.timeout(15_000),
        })
      : await fetch(`${base}/balance.aspx?user=${encodeURIComponent(user)}&pwd=${encodeURIComponent(pwd)}`, {
          signal: AbortSignal.timeout(15_000),
        })

    const raw = (await res.text()).trim()
    const looksBlocked = /not allowed|invalid|error|denied/i.test(raw)
    const balance = parseBalance(raw)

    return { ok: res.ok && !looksBlocked && balance !== null, balance, raw: raw.slice(0, 200) }
  } catch (err) {
    return { ok: false, balance: null, raw: err instanceof Error ? err.message : "Balance check failed" }
  }
}

/**
 * Pulls the credit figure out of Mobishastra's balance response.
 *
 * The live account answers `Tanzania (+255) = 10628,` — so taking the first
 * number in the string yields 255, the dialling code, and a healthy account
 * reads as nearly out of credit. Prefer the value after "=", and otherwise
 * take the largest number present rather than the first.
 */
export function parseBalance(raw: string): number | null {
  const afterEquals = raw.match(/=\s*([\d,]+(?:\.\d+)?)/)
  if (afterEquals) {
    const n = Number(afterEquals[1].replace(/,/g, ""))
    if (Number.isFinite(n)) return n
  }

  // Ignore anything that looks like a country code in parentheses or after a +.
  const cleaned = raw.replace(/\(\s*\+?\d+\s*\)|\+\d+/g, " ")
  const numbers = [...cleaned.matchAll(/\d[\d,]*(?:\.\d+)?/g)]
    .map((m) => Number(m[0].replace(/,/g, "")))
    .filter(Number.isFinite)

  return numbers.length ? Math.max(...numbers) : null
}

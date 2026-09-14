import { serviceClient } from "./supabase"
import { hmacCode, hashPhone, hashIp, phoneLast4, normalizeCode, normalizePhone } from "./crypto"
import { sendSms } from "./sms"
import { smsBody, webCopy, VERDICT, type EngineResult, type VerificationResult } from "./messages"

export type Channel = "QR_WEB" | "WEB" | "SMS" | "ADMIN"

export interface VerifyInput {
  code: string
  publicToken?: string | null
  channel: Channel
  phone?: string | null
  ip?: string | null
  userAgent?: string | null
  region?: string | null
  latitude?: number | null
  longitude?: number | null
  providerMessageId?: string | null
  /** Send the customer an SMS receipt with the outcome. */
  notifyBySms?: boolean
}

export interface VerifyOutput extends EngineResult {
  verdict: ReturnType<typeof webCopy>["verdict"]
  copy: ReturnType<typeof webCopy>
  smsSent: boolean
}

const SUPPORT_FALLBACK = process.env.NEXT_PUBLIC_HAKIKI_SUPPORT_PHONE ?? "+255623821175"

/**
 * The single entry point for every channel. QR, SMS and the manual web form
 * all land here, so the rules cannot drift apart between surfaces.
 */
export async function verifyUnit(input: VerifyInput): Promise<VerifyOutput> {
  const db = serviceClient()
  const code = normalizeCode(input.code)
  const ipHash = hashIp(input.ip)
  const phoneHash = input.phone ? hashPhone(input.phone) : null

  // ---- rate limiting -------------------------------------------------
  // Cheap insurance. At a 10-digit keyspace an attacker needs millions of
  // guesses to land one hit; throttling makes that take geological time.
  const limits: Array<[string, number, number]> = []
  if (ipHash) limits.push([`ip:${ipHash}`, 30, 600])
  if (phoneHash) limits.push([`phone:${phoneHash}`, 20, 3600])

  for (const [bucket, max, windowSeconds] of limits) {
    const { data: allowed, error } = await db.rpc("hakiki_rate_limit", {
      p_bucket: bucket,
      p_limit: max,
      p_window_seconds: windowSeconds,
    })
    // Fail open on limiter errors — never block a genuine customer because
    // the throttle table hiccuped.
    if (!error && allowed === false) {
      return decorate({ result: "RATE_LIMITED" }, false)
    }
  }

  if (!code) return decorate({ result: "INVALID_CODE" }, false)

  // ---- the engine ----------------------------------------------------
  const { data, error } = await db.rpc("hakiki_verify", {
    p_secret_hmac: hmacCode(code),
    p_public_token: input.publicToken ?? null,
    p_channel: input.channel,
    p_phone_hash: phoneHash,
    p_phone_last4: input.phone ? phoneLast4(input.phone) : null,
    p_ip_hash: ipHash,
    p_user_agent: input.userAgent?.slice(0, 400) ?? null,
    p_region: input.region ?? null,
    p_latitude: input.latitude ?? null,
    p_longitude: input.longitude ?? null,
    p_provider_message_id: input.providerMessageId ?? null,
  })

  if (error) {
    // A duplicate provider_message_id means the SMS gateway retried a
    // callback we already handled. That is success, not failure.
    if (error.code === "23505" && input.providerMessageId) {
      return decorate({ result: "GENUINE_REPEAT" }, false)
    }
    console.error("[HAKIKI] verification engine error", error)
    throw new Error("Verification failed")
  }

  const engineResult = data as EngineResult

  // ---- SMS receipt ---------------------------------------------------
  let smsSent = false
  if (input.notifyBySms && input.phone) {
    const support = engineResult.support_phone || SUPPORT_FALLBACK
    const res = await sendSms({
      to: input.phone,
      body: smsBody(engineResult, support),
      companyId: null,
    })
    smsSent = res.ok
  }

  return decorate(engineResult, smsSent)
}

function decorate(r: EngineResult, smsSent: boolean): VerifyOutput {
  const copy = webCopy(r)
  return { ...r, verdict: VERDICT[r.result as VerificationResult] ?? "INVALID", copy, smsSent }
}

/** Best-effort client IP behind Vercel's proxy. */
export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return headers.get("x-real-ip") ?? null
}

export { normalizePhone }

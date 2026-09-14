import crypto from "node:crypto"
import { NextResponse } from "next/server"
import { verifyUnit, clientIp } from "@/lib/hakiki/verify"
import { serviceClient } from "@/lib/hakiki/supabase"
import { hashPhone, phoneLast4, normalizePhone, isValidTzPhone } from "@/lib/hakiki/crypto"
import { smsBody } from "@/lib/hakiki/messages"
import { sendSms } from "@/lib/hakiki/sms"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Inbound SMS webhook — the true two-way flow.
 *
 * This is live and ready, but it only does anything once a two-way shortcode
 * or long code is provisioned and pointed here. Until then the SMS leg of
 * HAKIKI runs web-initiated: the customer submits their number on /verify
 * and receives the verdict by SMS.
 *
 * Providers retry callbacks, so this must be idempotent. The provider
 * message id carries a unique index on verification_events, which makes a
 * replayed callback a no-op rather than a phantom second verification.
 */

const SUPPORT = process.env.NEXT_PUBLIC_HAKIKI_SUPPORT_PHONE ?? "+255623821175"

function firstOf(source: Record<string, string>, keys: string[]): string | null {
  for (const key of keys) {
    const hit = Object.keys(source).find((k) => k.toLowerCase() === key)
    if (hit && source[hit]) return source[hit]
  }
  return null
}

export async function POST(request: Request) {
  const url = new URL(request.url)

  // Shared-secret guard. Anyone who can POST here can forge verifications.
  const secret = process.env.HAKIKI_WEBHOOK_SECRET
  const presented = url.searchParams.get("key") ?? request.headers.get("x-hakiki-key")
  if (secret && presented !== secret) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  // Accept whatever shape the gateway sends: JSON, form-encoded, or query.
  const payload: Record<string, string> = {}
  url.searchParams.forEach((v, k) => (payload[k] = v))

  const contentType = request.headers.get("content-type") ?? ""
  try {
    if (contentType.includes("application/json")) {
      Object.assign(payload, await request.json())
    } else if (contentType.includes("form")) {
      const form = await request.formData()
      form.forEach((v, k) => (payload[k] = String(v)))
    }
  } catch {
    // Body was empty or unparseable — query parameters may still be enough.
  }

  // Mobishastra's PULL API posts shortcode / mobileno / keyword / message.
  // Other gateways use other names, so accept the common aliases too.
  const from = firstOf(payload, ["mobileno", "from", "msisdn", "sender", "phone", "source"])
  const message = firstOf(payload, ["message", "msgtext", "text", "body", "content", "sms"])
  const keyword = firstOf(payload, ["keyword"])
  const shortcode = firstOf(payload, ["shortcode"])

  // With a keyword shortcode the gateway splits "HAKIKI 4827193652" into
  // keyword + message, so the digits may live in either field.
  const text = [keyword, message].filter(Boolean).join(" ").trim()

  if (!from || !text) {
    return NextResponse.json({ error: "Missing sender or message body" }, { status: 400 })
  }

  /**
   * The PULL API carries no message id, so there is nothing to deduplicate
   * on if the gateway retries. Synthesise a deterministic key from the
   * content plus a 10 minute bucket: a retry of the same text from the same
   * number collapses onto one verification, while a genuine re-check later
   * still counts as its own event.
   */
  const providedId = firstOf(payload, ["msgid", "messageid", "message_id", "transactionid"])
  const messageId =
    providedId ??
    `syn_${crypto
      .createHash("sha256")
      .update(`${shortcode ?? ""}|${normalizePhone(from)}|${text}|${Math.floor(Date.now() / 600_000)}`)
      .digest("hex")
      .slice(0, 32)}`

  const db = serviceClient()
  await db.from("sms_events").insert({
    direction: "INBOUND",
    phone_hash: hashPhone(from),
    phone_last4: phoneLast4(from),
    destination: normalizePhone(from),
    body: [shortcode ? `[${shortcode}]` : null, text].filter(Boolean).join(" ").slice(0, 500),
    provider_message_id: messageId,
    status: "RECEIVED",
  })

  // Customers send all sorts of things: "HAKIKI 482719365204", the bare
  // digits, or the code with spaces. Take the digits and move on.
  const code = text.replace(/\D/g, "")

  if (!isValidTzPhone(from) || code.length < 6 || code.length > 14) {
    await sendSms({
      to: from,
      body: `HAKIKI: Tuma tu tarakimu za code yako, mfano 4827193652. Msaada: ${SUPPORT}`,
    })
    return NextResponse.json({ ok: true, handled: "INVALID_FORMAT" })
  }

  try {
    const result = await verifyUnit({
      code,
      channel: "SMS",
      phone: from,
      ip: clientIp(request.headers),
      providerMessageId: messageId,
      notifyBySms: false, // we reply below so the response body is logged once
    })

    // A replayed callback was already answered — sending again would both
    // confuse the customer and spend credit for nothing.
    if (result.deduplicated) {
      return NextResponse.json({ ok: true, result: result.result, deduplicated: true })
    }

    await sendSms({
      to: from,
      body: smsBody(result, result.support_phone || SUPPORT),
    })

    return NextResponse.json({ ok: true, result: result.result })
  } catch (err) {
    console.error("[HAKIKI] inbound SMS failed", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

// Some gateways deliver inbound messages over GET.
export async function GET(request: Request) {
  return POST(request)
}

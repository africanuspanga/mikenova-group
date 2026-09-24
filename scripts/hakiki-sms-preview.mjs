/**
 * Print every SMS a customer can receive, rendered by the real composer.
 *
 *   node scripts/hakiki-sms-preview.mjs
 *   node scripts/hakiki-sms-preview.mjs --send=0682152148    (actually texts them)
 *
 * The bodies come from lib/hakiki/messages.ts itself rather than being
 * retyped here, so this can never drift from what customers are sent. It also
 * reports the GSM-7 segment count, because one non-ASCII character silently
 * halves the per-segment limit from 160 to 70 and doubles the bill.
 */
import { smsBody } from "../lib/hakiki/messages.ts"

const arg = (n) => {
  const hit = process.argv.find((a) => a.startsWith(`--${n}=`))
  return hit ? hit.slice(n.length + 3) : null
}
const SEND_TO = arg("send")
const SUPPORT = process.env.NEXT_PUBLIC_HAKIKI_SUPPORT_PHONE ?? "+255623821175"

/** Characters the GSM-7 alphabet cannot carry — each one forces UCS-2. */
const GSM7 = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?"
  + "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà"
const GSM7_EXT = "^{}\\[~]|€"

function segments(text) {
  const bad = [...text].filter((c) => !GSM7.includes(c) && !GSM7_EXT.includes(c))
  if (bad.length) return { encoding: "UCS-2", limit: 70, count: Math.ceil(text.length / 70), bad: [...new Set(bad)] }
  const units = [...text].reduce((n, c) => n + (GSM7_EXT.includes(c) ? 2 : 1), 0)
  return { encoding: "GSM-7", limit: 160, count: units <= 160 ? 1 : Math.ceil(units / 153), bad: [] }
}

const base = {
  serial: "HK-7K9M-2PXQ",
  product: "Goddess Glow Body Cream",
  product_size: "250ml",
  company: "Goddess Glow",
  batch_code: "GG-2026-01",
}

const cases = [
  ["GENUINE_FIRST", "First ever check. The buyer scratched the panel and this is the answer they came for.",
    { ...base, result: "GENUINE_FIRST", verification_number: 1, distinct_verifiers: 1 }],
  ["CHECKED_MANY_TIMES", "Second check onwards. The credential is real, but a one-time code has been used twice.",
    { ...base, result: "CHECKED_MANY_TIMES", verification_number: 2, distinct_verifiers: 1 }],
  ["SUSPICIOUS_DUPLICATE", "One code, three or more different people. This is what a copied code looks like.",
    { ...base, result: "SUSPICIOUS_DUPLICATE", verification_number: 4, distinct_verifiers: 3 }],
  ["NOT_ACTIVATED", "A real label that was never reconciled onto a product. Stolen or leaked label stock.",
    { ...base, result: "NOT_ACTIVATED" }],
  ["RECALLED", "The manufacturer pulled this batch from the market.",
    { ...base, result: "RECALLED" }],
  ["REVOKED", "The credential was cancelled.",
    { ...base, result: "REVOKED" }],
  ["INVALID_SECRET", "Right label, wrong digits. Almost always a typo, so it must not accuse anyone.",
    { ...base, result: "INVALID_SECRET" }],
  ["INVALID_CODE", "The code is not in HAKIKI at all. Either a typo or a counterfeit.",
    { result: "INVALID_CODE" }],
  ["RATE_LIMITED", "Too many attempts from one number in an hour.",
    { result: "RATE_LIMITED" }],
  ["GENUINE_FIRST (long product name)", "Budget check: the composer drops detail lines rather than paying for a second segment.",
    { ...base, product: "Goddess Glow Intensive Brightening Body Cream Extra", product_size: "500ml",
      result: "GENUINE_FIRST", verification_number: 1 }],
]

console.log("\nHAKIKI SMS copy — every message a customer can receive")
console.log(`support number: ${SUPPORT}\n`)

const composed = []
for (const [name, why, result] of cases) {
  const body = smsBody(result, SUPPORT)
  const seg = segments(body)
  composed.push({ name, body })
  console.log(`${"─".repeat(76)}`)
  console.log(`${name}`)
  console.log(`  ${why}`)
  console.log("")
  console.log(`  "${body}"`)
  console.log("")
  console.log(`  ${body.length} chars · ${seg.encoding} · ${seg.count} segment${seg.count === 1 ? "" : "s"}`
    + (seg.bad.length ? `  !! non-GSM7: ${seg.bad.join(" ")}` : ""))
  console.log("")
}

const overLimit = composed.filter((c) => segments(c.body).count > 1)
console.log("─".repeat(76))
console.log(overLimit.length
  ? `!! ${overLimit.length} message(s) need more than one segment: ${overLimit.map((c) => c.name).join(", ")}`
  : "All messages fit one GSM-7 segment. One credit each.")

if (SEND_TO) {
  console.log(`\nSending all ${composed.length} messages to ${SEND_TO} ...`)
  const { sendSms } = await import("../lib/hakiki/sms.ts")
  for (const { name, body } of composed) {
    const res = await sendSms({ to: SEND_TO, body, companyId: null })
    console.log(`  ${res.ok ? "sent  " : "FAILED"}  ${name}${res.error ? `  (${res.error})` : ""}`)
    await new Promise((r) => setTimeout(r, 1200))
  }
}

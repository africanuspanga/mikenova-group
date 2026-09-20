/**
 * The 100-label proof of concept, run end to end against the live system.
 *
 *   70 genuine units, verified once each
 *    1 unit checked a second time (a code is good for one check)
 *   10 units whose code is verified by many different people (copied code)
 *   10 units where the QR and the scratch code do not belong together
 *    5 codes that exist nowhere in the system
 *    5 units from a batch that was never activated
 *
 * Everything goes through the real HTTP API, so this exercises the engine,
 * the rate limiter, the fraud rules and the response copy exactly as a
 * customer's phone would.
 */
import { createClient } from "@supabase/supabase-js"
import crypto from "node:crypto"

const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const decryptCode = (payload) => {
  const [, ivHex, tagHex, ctHex] = payload.split(":")
  const key = Buffer.from(process.env.HAKIKI_ENCRYPTION_KEY, "hex")
  const d = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"))
  d.setAuthTag(Buffer.from(tagHex, "hex"))
  return Buffer.concat([d.update(Buffer.from(ctHex, "hex")), d.final()]).toString("utf8")
}

// Distinct IPs so the engine sees distinct verifier identities.
let ipCounter = 0
const nextIp = () => `10.${Math.floor(++ipCounter / 256) % 256}.${ipCounter % 256}.7`

async function verify({ code, publicToken, ip }) {
  const res = await fetch(`${BASE}/api/hakiki/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip ?? nextIp() },
    body: JSON.stringify({ code, publicToken: publicToken ?? null }),
  })
  return res.json()
}

let pass = 0, fail = 0
function expect(label, actual, wanted) {
  const ok = actual === wanted
  ok ? pass++ : fail++
  console.log(`${ok ? "  PASS" : "  FAIL"}  ${label.padEnd(52)} ${actual}${ok ? "" : `  (expected ${wanted})`}`)
}

// ---------- set up two batches ----------
const { data: company } = await db.from("companies").select("id").eq("slug", "goddess-glow").single()
const { data: product } = await db.from("products").select("id").eq("sku", "GG-CREAM-250").single()

const stamp = Date.now().toString().slice(-6)
const mkBatch = async (code, qty) => {
  const { data, error } = await db.from("batches").insert({
    company_id: company.id, product_id: product.id, batch_code: code,
    planned_quantity: qty, code_length: 10, notes: "Automated pilot test",
  }).select().single()
  if (error) throw error
  return data
}

const liveBatch = await mkBatch(`PILOT-${stamp}-A`, 95)
const deadBatch = await mkBatch(`PILOT-${stamp}-B`, 5)

// ---------- generate codes through the real endpoint logic ----------
const { generateSerial, generatePublicToken, generateScratchCode } = await import("../lib/hakiki/codes.ts")
  .catch(async () => {
    // codes.ts is TypeScript; replicate generation inline for the harness.
    return {}
  })

function genUnitRows(batch, count) {
  const A = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
  const T = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const pick = (al) => al[crypto.randomBytes(1)[0] % al.length]
  const rnd = (al, n) => Array.from({ length: n }, () => pick(al)).join("")
  const enc = (code) => {
    const key = Buffer.from(process.env.HAKIKI_ENCRYPTION_KEY, "hex")
    const iv = crypto.randomBytes(12)
    const c = crypto.createCipheriv("aes-256-gcm", key, iv)
    const ct = Buffer.concat([c.update(code, "utf8"), c.final()])
    return `v1:${iv.toString("hex")}:${c.getAuthTag().toString("hex")}:${ct.toString("hex")}`
  }
  const hmac = (code) => crypto.createHmac("sha256", process.env.HAKIKI_HMAC_SECRET).update(code).digest("hex")

  return Array.from({ length: count }, () => {
    const code = String(1 + (crypto.randomBytes(1)[0] % 9)) +
      Array.from({ length: 9 }, () => "0123456789"[crypto.randomBytes(1)[0] % 10]).join("")
    return {
      company_id: batch.company_id, product_id: batch.product_id, batch_id: batch.id,
      serial_number: `HK-${rnd(A, 4)}-${rnd(A, 4)}`,
      public_token: rnd(T, 12),
      secret_code_hmac: hmac(code), secret_code_encrypted: enc(code), status: "GENERATED",
    }
  })
}

await db.from("auth_units").insert(genUnitRows(liveBatch, 95))
await db.from("auth_units").insert(genUnitRows(deadBatch, 5))
await db.from("batches").update({ generated_quantity: 95, status: "CODES_GENERATED" }).eq("id", liveBatch.id)
await db.from("batches").update({ generated_quantity: 5, status: "CODES_GENERATED" }).eq("id", deadBatch.id)

// Activate ONLY the live batch — the dead one stays unreconciled on purpose.
await db.rpc("hakiki_activate_batch", { p_batch_id: liveBatch.id, p_quantity: 95 })

const load = async (batchId) => {
  const { data } = await db.from("auth_units")
    .select("serial_number, public_token, secret_code_encrypted")
    .eq("batch_id", batchId).order("serial_number")
  return data.map((u) => ({ ...u, code: decryptCode(u.secret_code_encrypted) }))
}
const live = await load(liveBatch.id)
const dead = await load(deadBatch.id)

console.log(`\nHAKIKI pilot — ${live.length} active units, ${dead.length} unactivated\n`)

// ---------- 1. genuine, first ever verification ----------
console.log("70 genuine units, first verification")
let firstOk = 0
for (const unit of live.slice(0, 70)) {
  const r = await verify({ code: unit.code, publicToken: unit.public_token })
  if (r.result === "GENUINE_FIRST" && r.verdict === "GENUINE") firstOk++
}
expect("all 70 return GENUINE_FIRST", firstOk, 70)

// ---------- 2. the code is spent after one check ----------
console.log("\nA second check of an already-verified code")
const spent = live[1] // verified once in step 1
const second = await verify({ code: spent.code, publicToken: spent.public_token })
expect("second check warns the customer", second.result, "CHECKED_MANY_TIMES")
expect("verdict turns amber", second.verdict, "WARNING")
expect("and the count is shown", second.verificationNumber, 2)
expect("support number is offered", Boolean(second.supportPhone), true)

// ---------- 2b. a double tap must not look like counterfeiting ----------
console.log("\nSame person submitting twice within the grace window")
const fresh = live[91]
const shopIp = "41.59.100.5"
const tap1 = await verify({ code: fresh.code, publicToken: fresh.public_token, ip: shopIp })
const tap2 = await verify({ code: fresh.code, publicToken: fresh.public_token, ip: shopIp })
expect("first submit is genuine", tap1.result, "GENUINE_FIRST")
expect("instant re-submit replays that answer", tap2.result, "GENUINE_FIRST")
expect("and counts nothing", tap2.verificationNumber, tap1.verificationNumber)

// ---------- 3. one code copied onto many counterfeits ----------
console.log("\n10 copied codes, each verified by many different people")
let flagged = 0
for (const unit of live.slice(70, 80)) {
  let last
  for (let person = 0; person < 6; person++) {
    last = await verify({ code: unit.code, publicToken: unit.public_token, ip: nextIp() })
  }
  if (last.result === "SUSPICIOUS_DUPLICATE") flagged++
}
expect("all 10 escalate to SUSPICIOUS_DUPLICATE", flagged, 10)

// ---------- 4. QR and scratch code from different labels ----------
console.log("\n10 mismatched QR / scratch code pairs")
let mismatched = 0
for (let i = 80; i < 90; i++) {
  const r = await verify({ code: live[i + 1].code, publicToken: live[i].public_token })
  if (r.result === "INVALID_SECRET") mismatched++
}
expect("all 10 rejected as INVALID_SECRET", mismatched, 10)

// ---------- 5. codes that simply do not exist ----------
console.log("\n5 invented codes")
let invalid = 0
for (let i = 0; i < 5; i++) {
  const r = await verify({ code: String(9000000000 + i) })
  if (r.result === "INVALID_CODE") invalid++
}
expect("all 5 rejected as INVALID_CODE", invalid, 5)

// ---------- 6. real labels from a batch nobody activated ----------
console.log("\n5 units from an unactivated batch (stolen label stock)")
let notActive = 0
for (const unit of dead) {
  const r = await verify({ code: unit.code, publicToken: unit.public_token })
  if (r.result === "NOT_ACTIVATED") notActive++
}
expect("all 5 blocked as NOT_ACTIVATED", notActive, 5)

// ---------- 7. SMS channel, no QR context ----------
console.log("\nSMS channel — code alone, no QR")
const smsUnit = live[90]
const smsRes = await fetch(`${BASE}/api/hakiki/verify`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-forwarded-for": nextIp() },
  body: JSON.stringify({ code: smsUnit.code, phone: "0754123456", notifyBySms: false }),
})
const sms = await smsRes.json()
expect("code alone identifies the unit", sms.result, "GENUINE_FIRST")
expect("returns the product name", sms.product, "Goddess Glow Body Cream")

// ---------- 8. fraud alerts actually recorded ----------
const { count: alertCount } = await db.from("fraud_alerts")
  .select("*", { count: "exact", head: true })
  .eq("batch_id", liveBatch.id).eq("status", "OPEN")
expect("fraud alerts raised for the copied codes", alertCount >= 10, true)

const { count: preActivation } = await db.from("fraud_alerts")
  .select("*", { count: "exact", head: true })
  .eq("batch_id", deadBatch.id).eq("alert_type", "PRE_ACTIVATION_USE")
expect("pre-activation alerts raised", preActivation, 5)

// ---------- 9. nothing leaks through the anon key ----------
const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const { data: leak, error: leakError } = await anon.from("auth_units").select("secret_code_hmac").limit(1)
expect("anon key cannot read auth_units", (leak?.length ?? 0) === 0 || !!leakError, true)

console.log(`\n${"=".repeat(62)}`)
console.log(`  ${pass} passed, ${fail} failed`)
console.log(`${"=".repeat(62)}\n`)
process.exit(fail === 0 ? 0 : 1)

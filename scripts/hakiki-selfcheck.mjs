/**
 * HAKIKI pre-print self check.
 *
 * Creates a throwaway batch, drives every path through the real HTTP API of a
 * running server, asserts the answers, and deletes everything it made. It
 * never touches a real pilot label, so it can be run before any production
 * run without burning credentials that are already on bottles.
 *
 *   node --env-file=.env.local scripts/hakiki-selfcheck.mjs
 *   node --env-file=.env.local scripts/hakiki-selfcheck.mjs --url=https://www.mikenovagroup.co.tz
 *   node --env-file=.env.local scripts/hakiki-selfcheck.mjs --quick   (skips the 60s grace window test)
 *
 * Different customers are simulated with different phone numbers, because the
 * verifier identity is the hashed phone when there is one and the hashed
 * client IP otherwise. Phones are used rather than spoofed X-Forwarded-For
 * headers on purpose: behind Vercel the proxy overwrites that header with the
 * real client address, so header spoofing silently collapses three "people"
 * into one and the multi-verifier rule looks broken when it is not.
 *
 * No SMS is sent — a phone number is attached to the check for identity, and
 * notifyBySms is left off, so the run costs nothing at the gateway.
 */
import crypto from "node:crypto"

const arg = (n, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${n}=`))
  return hit ? hit.slice(n.length + 3) : d
}
const QUICK = process.argv.includes("--quick")
const BASE = (arg("url", "http://localhost:3000")).replace(/\/$/, "")
const COMPANY_SLUG = arg("company", "goddess-glow")
const PRODUCT_SKU = arg("product", "GG-CREAM-300")

/**
 * The number that stands in for a real buyer.
 *
 * Only ever hashed into a verifier identity — notifyBySms is never set in
 * this script, so no message is sent and no gateway credit is spent. The two
 * other "people" below are deliberately in an unallocated range.
 */
const TEST_PHONE = arg("phone", "0682152148")

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const rnd = (a, n) => Array.from({ length: n }, () => a[crypto.randomInt(a.length)]).join("")

// ------------------------------------------------------------ assertions
let passed = 0
const failures = []

function check(name, actual, expected) {
  if (actual === expected) {
    passed++
    console.log(`  PASS  ${name}  -> ${actual}`)
  } else {
    failures.push(`${name}: expected ${expected}, got ${actual}`)
    console.log(`  FAIL  ${name}  -> expected ${expected}, got ${actual}`)
  }
}

// ------------------------------------------------------------ crypto
const secret = (n) => {
  const v = process.env[n]
  if (!v) throw new Error(`${n} is not set — run with --env-file=.env.local`)
  return v
}
const hmacCode = (c) => crypto.createHmac("sha256", secret("HAKIKI_HMAC_SECRET")).update(c).digest("hex")
function encryptCode(code) {
  const key = Buffer.from(secret("HAKIKI_ENCRYPTION_KEY"), "hex")
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const ct = Buffer.concat([cipher.update(code, "utf8"), cipher.final()])
  return `v1:${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${ct.toString("hex")}`
}

const SERIAL_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
const TOKEN_ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const makeUnit = (status) => ({
  status,
  code: String(crypto.randomInt(1, 10)) + rnd("0123456789", 9),
  token: rnd(TOKEN_ALPHABET, 12),
  serial: `HK-${rnd(SERIAL_ALPHABET, 4)}-${rnd(SERIAL_ALPHABET, 4)}`,
})

// ------------------------------------------------------------ HTTP
async function verify(body, ip = "203.0.113.10") {
  const res = await fetch(`${BASE}/api/hakiki/verify/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": ip },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, ...json }
}

// ------------------------------------------------------------ run
const { createClient } = await import("@supabase/supabase-js")
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const { data: company } = await db.from("companies").select("id").eq("slug", COMPANY_SLUG).single()
const { data: product } = await db.from("products").select("id").eq("company_id", company.id).eq("sku", PRODUCT_SKU).single()

const batchCode = `SELFCHECK-${Date.now()}`
const { data: batch, error: batchError } = await db.from("batches").insert({
  company_id: company.id, product_id: product.id, batch_code: batchCode,
  planned_quantity: 3, generated_quantity: 3, activated_quantity: 2, code_length: 10,
  status: "ACTIVE", activated_at: new Date().toISOString(),
  notes: "automated self check — deleted at the end of the run",
}).select().single()
if (batchError) throw new Error(batchError.message)

const single = makeUnit("ACTIVE")      // the one-time credential under test
const shared = makeUnit("ACTIVE")      // the same code surfacing in many hands
const inert = makeUnit("GENERATED")    // printed, never reconciled onto a product

const { error: unitError } = await db.from("auth_units").insert(
  [single, shared, inert].map((u) => ({
    company_id: company.id, product_id: product.id, batch_id: batch.id,
    serial_number: u.serial, public_token: u.token,
    secret_code_hmac: hmacCode(u.code), secret_code_encrypted: encryptCode(u.code),
    status: u.status, activated_at: u.status === "ACTIVE" ? new Date().toISOString() : null,
  })),
)
if (unitError) throw new Error(unitError.message)

console.log(`\nHAKIKI self check against ${BASE}`)
console.log(`throwaway batch ${batchCode}\n`)

try {
  console.log("A scratch code is a one-time credential")
  const first = await verify({ code: single.code, publicToken: single.token }, "203.0.113.10")
  check("first ever check is genuine", first.result, "GENUINE_FIRST")
  check("  and is counted as check 1", first.verificationNumber, 1)
  check("  and the verdict is GENUINE", first.verdict, "GENUINE")

  // Immediately: the accident the replay window exists for.
  const replay = await verify({ code: single.code, publicToken: single.token }, "203.0.113.10")
  check("instant resubmit replays", replay.result, "GENUINE_FIRST")
  check("  and counts nothing", replay.verificationNumber, 1)

  if (!QUICK) {
    // Past the window: a deliberate second check, which must be warned about
    // however soon it follows. This is the assertion that matters most before
    // a print run -- a one-time credential that says "genuine, first time"
    // twice is not a one-time credential.
    console.log("\n  waiting out the 10 second replay window...")
    await sleep(13_000)
    const second = await verify({ code: single.code, publicToken: single.token }, "203.0.113.10")
    check("13s later: code already used", second.result, "CHECKED_MANY_TIMES")
    check("  and the customer is warned", second.verdict, "WARNING")
    check("  and it is check 2", second.verificationNumber, 2)

    const third = await verify({ code: single.code, publicToken: single.token }, "203.0.113.10")
    check("  and it keeps warning", third.result, "CHECKED_MANY_TIMES")
  }

  console.log("\nOne code in many different hands")
  const buyer = await verify({ code: shared.code, phone: TEST_PHONE })
  check("first person gets genuine", buyer.result, "GENUINE_FIRST")

  const second = await verify({ code: shared.code, phone: "0689000002" })
  check("second person: code already used", second.result, "CHECKED_MANY_TIMES")
  check("  and is warned", second.verdict, "WARNING")

  const third = await verify({ code: shared.code, phone: "0689000003" })
  check("third person: likely copied", third.result, "SUSPICIOUS_DUPLICATE")
  check("  and counts three verifiers", third.distinctVerifiers, 3)

  console.log("\nEverything that is not a genuine first check")
  const wrongCode = await verify({ code: "1234567890", publicToken: single.token }, "203.0.113.20")
  check("wrong code against a real QR", wrongCode.result, "INVALID_SECRET")

  const invented = await verify({ code: "9876501234" }, "203.0.113.21")
  check("invented code, no QR", invented.result, "INVALID_CODE")

  const notActivated = await verify({ code: inert.code, publicToken: inert.token }, "203.0.113.22")
  check("label printed but never activated", notActivated.result, "NOT_ACTIVATED")

  const short = await verify({ code: "123" }, "203.0.113.23")
  check("too few digits is rejected, not judged", short.status, 400)

  console.log("\nUlinunua wapi?")
  const place = "Kariakoo, duka karibu na Msimbazi"
  const placed = makeUnit("ACTIVE")
  await db.from("auth_units").insert({
    company_id: company.id, product_id: product.id, batch_id: batch.id,
    serial_number: placed.serial, public_token: placed.token,
    secret_code_hmac: hmacCode(placed.code), secret_code_encrypted: encryptCode(placed.code),
    status: "ACTIVE", activated_at: new Date().toISOString(),
  })
  await verify({ code: placed.code, publicToken: placed.token, region: "Dar es Salaam", purchasePlace: place }, "203.0.113.30")
  const { data: withPlace } = await db.from("verification_events")
    .select("region, purchase_place").eq("batch_id", batch.id).eq("region", "Dar es Salaam").maybeSingle()
  check("free text is stored verbatim", withPlace?.purchase_place, place)
  check("  alongside the region", withPlace?.region, "Dar es Salaam")

  const long = makeUnit("ACTIVE")
  await db.from("auth_units").insert({
    company_id: company.id, product_id: product.id, batch_id: batch.id,
    serial_number: long.serial, public_token: long.token,
    secret_code_hmac: hmacCode(long.code), secret_code_encrypted: encryptCode(long.code),
    status: "ACTIVE", activated_at: new Date().toISOString(),
  })
  await verify({ code: long.code, publicToken: long.token, region: "Mwanza", purchasePlace: "M".repeat(400) }, "203.0.113.31")
  const { data: truncated } = await db.from("verification_events")
    .select("purchase_place").eq("batch_id", batch.id).eq("region", "Mwanza").maybeSingle()
  check("400 characters is truncated to 160", truncated?.purchase_place?.length, 160)

  console.log("\nThe browser cannot read the credential table")
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  })
  const { data: leaked, error: leakError } = await anon.from("auth_units").select("secret_code_hmac").limit(1)
  check("anon key cannot read auth_units", Boolean(leakError) || (leaked?.length ?? 0) === 0, true)
} finally {
  await db.from("fraud_alerts").delete().eq("batch_id", batch.id)
  await db.from("verification_events").delete().eq("batch_id", batch.id)
  await db.from("auth_units").delete().eq("batch_id", batch.id)
  await db.from("batches").delete().eq("id", batch.id)
  console.log(`\ncleaned up ${batchCode}`)
}

console.log(`\n${passed} passed, ${failures.length} failed`)
if (failures.length) {
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
console.log("HAKIKI is behaving. Safe to print.\n")

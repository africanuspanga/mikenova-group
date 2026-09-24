/**
 * Does the printed CSV actually match the database?
 *
 *   node --env-file=.env.local scripts/hakiki-verify-printfile.mjs \\
 *     --batch=Q4-2026-GG-CREAM-300 --csv="print/final print/.../file.csv"
 *
 * The press merges from this file. If a code in it does not hash to the
 * secret_code_hmac stored for that serial, that bottle can never verify --
 * and nothing downstream would notice until a customer complained.
 */
import crypto from "node:crypto"
import fs from "node:fs"

const arg = (n, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${n}=`))
  return hit ? hit.slice(n.length + 3) : d
}
const BATCH = arg("batch", null)
const CSV = arg("csv", null)
if (!BATCH || !CSV) {
  console.error("\nusage: --batch=BATCH-CODE --csv=path/to/file.csv\n")
  process.exit(1)
}
const hmac = (c) => crypto.createHmac("sha256", process.env.HAKIKI_HMAC_SECRET).update(c).digest("hex")

const rows = fs.readFileSync(CSV, "utf8").trim().split("\n").slice(1)
  .map((l) => { const [serial, code, url] = l.split(","); return { serial, code, url } })

const { createClient } = await import("@supabase/supabase-js")
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } })

const { data: batch } = await db.from("batches").select("id").eq("batch_code", BATCH).single()

const db_rows = new Map()
for (let off = 0; ; off += 1000) {
  const { data } = await db.from("auth_units")
    .select("serial_number, public_token, secret_code_hmac")
    .eq("batch_id", batch.id).order("serial_number").range(off, off + 999)
  if (!data?.length) break
  for (const r of data) db_rows.set(r.serial_number, r)
  if (data.length < 1000) break
}

let ok = 0
const bad = []
for (const r of rows) {
  const dbr = db_rows.get(r.serial)
  if (!dbr) { bad.push(`${r.serial}: not in database`); continue }
  if (hmac(r.code) !== dbr.secret_code_hmac) { bad.push(`${r.serial}: code does not match stored hash`); continue }
  if (!r.url.endsWith("/" + dbr.public_token)) { bad.push(`${r.serial}: QR token mismatch`); continue }
  ok++
}

console.log(`database rows: ${db_rows.size}`)
console.log(`csv rows:      ${rows.length}`)
console.log(`verified:      ${ok}`)
console.log(`mismatched:    ${bad.length}`)
for (const b of bad.slice(0, 10)) console.log("  " + b)
process.exit(bad.length || db_rows.size !== rows.length ? 1 : 0)

/**
 * Create a real production batch and generate its credentials.
 *
 *   node --env-file=.env.local scripts/hakiki-create-batch.mjs \
 *     --batch=Q4-2026-GG-CREAM-300 \
 *     --product=GG-CREAM-300 \
 *     --quantity=10000 \
 *     --notes="Q4 Batch 2026 Goddess Glow Body Cream"
 *
 * Top up a batch that has not been activated (production spoilage allowance):
 *
 *   node --env-file=.env.local scripts/hakiki-create-batch.mjs \
 *     --batch=Q4-2026-MELOURA-300 --add=200
 *
 * The existing units are untouched, so labels already laid out stay valid.
 * Print with --topup-since=<the time this prints> to put the new units last.
 *
 * The batch is left in CODES_GENERATED. It is NOT activated, and that is the
 * whole point: a unit that is not ACTIVE answers NOT_ACTIVATED, so a roll of
 * labels that never reached a bottle authenticates nothing. Activation happens
 * in the console after the labels are physically on product and reconciled.
 *
 * Identity generation mirrors lib/hakiki/codes.ts and lib/hakiki/crypto.ts.
 * That mirroring is proven rather than assumed: scripts/hakiki-selfcheck.mjs
 * creates units with these same functions and verifies them through the live
 * HTTPS API, so a drift between this file and the server would fail there
 * before it could ever reach a press.
 */
import crypto from "node:crypto"
import readline from "node:readline/promises"

const arg = (n, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${n}=`))
  return hit ? hit.slice(n.length + 3) : d
}

const BATCH_CODE = arg("batch", null)
const PRODUCT_SKU = arg("product", null)
let QUANTITY = Number(arg("quantity", 0))
const ADD = Number(arg("add", 0))
const NOTES = arg("notes", "")
const CODE_LENGTH = Number(arg("code-length", 10))
const COMPANY_SLUG = arg("company", "goddess-glow")
const EXPIRES = arg("expires", null)          // YYYY-MM-DD, or omitted for none
const YES = process.argv.includes("--yes")

if (!BATCH_CODE || (!ADD && (!PRODUCT_SKU || !QUANTITY))) {
  console.error("\nusage: --batch=CODE --product=SKU --quantity=N [--notes=...] [--expires=YYYY-MM-DD] [--yes]")
  console.error("       --batch=CODE --add=N [--yes]   top up a batch that is not activated\n")
  process.exit(1)
}
if (CODE_LENGTH < 6 || CODE_LENGTH > 14) throw new Error("code-length must be between 6 and 14")

const CHUNK_SIZE = 2500

// ------------------------------------------------------------- identities
const SERIAL_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
const TOKEN_ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function pick(alphabet) {
  const limit = 256 - (256 % alphabet.length)
  let byte
  do {
    byte = crypto.randomBytes(1)[0]
  } while (byte >= limit)
  return alphabet[byte % alphabet.length]
}

const randomString = (a, n) => Array.from({ length: n }, () => pick(a)).join("")
const generateSerial = () => `HK-${randomString(SERIAL_ALPHABET, 4)}-${randomString(SERIAL_ALPHABET, 4)}`
const generatePublicToken = () => randomString(TOKEN_ALPHABET, 12)

/** Numeric, first digit never 0 — people drop leading zeros when retyping. */
function generateScratchCode(length) {
  let code = String(1 + Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0x100000000) * 9))
  for (let i = 1; i < length; i++) code += pick("0123456789")
  return code
}

const requireSecret = (name) => {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is not set — run with --env-file=.env.local`)
  return v
}
const hmacCode = (code) =>
  crypto.createHmac("sha256", requireSecret("HAKIKI_HMAC_SECRET")).update(code).digest("hex")

function encryptCode(code) {
  const key = Buffer.from(requireSecret("HAKIKI_ENCRYPTION_KEY"), "hex")
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const ct = Buffer.concat([cipher.update(code, "utf8"), cipher.final()])
  return `v1:${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${ct.toString("hex")}`
}

// Every unique index (serial, public_token, secret hmac) can collide. At
// 10,000 units in a 10-digit keyspace that is unlikely but not negligible,
// and a silent duplicate secret would mean two bottles sharing one
// identity — so the whole chunk is regenerated rather than patched.
async function insertUnits(batch, product, size) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const rows = Array.from({ length: size }, () => {
      const code = generateScratchCode(batch.code_length)
      return {
        company_id: company.id,
        product_id: product.id,
        batch_id: batch.id,
        serial_number: generateSerial(),
        public_token: generatePublicToken(),
        secret_code_hmac: hmacCode(code),
        secret_code_encrypted: encryptCode(code),
        status: "GENERATED",
      }
    })

    const { error } = await db.from("auth_units").insert(rows)
    if (!error) return
    if (error.code !== "23505") throw new Error(error.message)
    console.warn(`  identity collision, regenerating chunk (attempt ${attempt + 1})`)
  }
  throw new Error("Could not generate unique identities after several attempts")
}

/**
 * Add units to an existing batch. Only before activation: once a batch is
 * live, extra codes belong in a new batch so reconciliation stays honest.
 */
async function topUp() {
  const { data: batch, error } = await db
    .from("batches").select("*, products(id, name, size, sku)")
    .eq("company_id", company.id).eq("batch_code", BATCH_CODE).single()
  if (error || !batch) throw new Error(`Batch "${BATCH_CODE}" not found`)
  if (batch.status !== "CODES_GENERATED" || batch.activated_quantity > 0) {
    throw new Error(`Batch ${BATCH_CODE} is ${batch.status} with ${batch.activated_quantity} activated. Only an unactivated batch can be topped up.`)
  }
  const before = batch.generated_quantity
  const target = before + ADD
  const since = new Date().toISOString()

  console.log(`
  Batch        ${BATCH_CODE}  ${batch.products.name} ${batch.products.size ?? ""}
  Units        ${before.toLocaleString()} -> ${target.toLocaleString()}  (+${ADD.toLocaleString()})
  Existing units and their labels are not changed.
`)
  if (!YES) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const answer = await rl.question(`  Type the batch code to confirm: `)
    rl.close()
    if (answer.trim() !== BATCH_CODE) {
      console.log("\n  Did not match. Nothing was created.\n")
      process.exit(1)
    }
  }

  let generated = before
  while (generated < target) {
    const size = Math.min(target - generated, CHUNK_SIZE)
    await insertUnits(batch, batch.products, size)
    generated += size
    await db.from("batches").update({ generated_quantity: generated, planned_quantity: Math.max(batch.planned_quantity, generated) }).eq("id", batch.id)
    console.log(`  generated ${generated.toLocaleString()} / ${target.toLocaleString()}`)
  }

  const { count } = await db.from("auth_units")
    .select("*", { count: "exact", head: true }).eq("batch_id", batch.id)
  if (count !== target) {
    console.error(`  !! expected ${target} units, found ${count}. Investigate before printing.\n`)
    process.exit(1)
  }
  console.log(`
  ${count.toLocaleString()} units in ${BATCH_CODE}, still NOT activated.

  Next: node --env-file=.env.local scripts/hakiki-print-sheet.mjs --batch=${BATCH_CODE} \\
          --topup-since=${since} --split=500 --resume --out=<folder with the existing PDFs>
`)
  process.exit(0)
}

// ------------------------------------------------------------------- run
const { createClient } = await import("@supabase/supabase-js")
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const { data: company, error: ce } = await db
  .from("companies").select("id, name").eq("slug", COMPANY_SLUG).single()
if (ce || !company) throw new Error(`Company "${COMPANY_SLUG}" not found`)

if (ADD) await topUp()

const { data: product, error: pe } = await db
  .from("products").select("id, name, sku, size").eq("company_id", company.id).eq("sku", PRODUCT_SKU).single()
if (pe || !product) throw new Error(`Product "${PRODUCT_SKU}" not found for ${company.name}`)

// A batch code is unique per company. Refuse rather than silently append to
// an existing run — two presses merging from one code is unrecoverable.
const { data: clash } = await db
  .from("batches").select("id, generated_quantity, status")
  .eq("company_id", company.id).eq("batch_code", BATCH_CODE).maybeSingle()
if (clash) {
  throw new Error(
    `Batch "${BATCH_CODE}" already exists (${clash.status}, ${clash.generated_quantity} units).`
    + ` Pick a different code, or delete that batch first.`,
  )
}

const keyspace = 9 * Math.pow(10, CODE_LENGTH - 1)
const oneIn = Math.round(keyspace / QUANTITY)

console.log(`
  Company      ${company.name}
  Product      ${product.name} ${product.size ?? ""}  (${product.sku})
  Batch code   ${BATCH_CODE}
  Title        ${NOTES || "(none)"}
  Quantity     ${QUANTITY.toLocaleString()}
  Code length  ${CODE_LENGTH} digits
  Expires      ${EXPIRES ?? "no expiry"}
  Guess risk   an invented code verifies as real about 1 in ${oneIn.toLocaleString()}

  The batch will be left NOT ACTIVATED. Every code will answer
  "haijaidhinishwa kwa mauzo rasmi" until you activate it in the console,
  after the labels are physically on product.
`)

if (!YES) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(`  Type the batch code to confirm: `)
  rl.close()
  if (answer.trim() !== BATCH_CODE) {
    console.log("\n  Did not match. Nothing was created.\n")
    process.exit(1)
  }
}

const { data: batch, error: be } = await db.from("batches").insert({
  company_id: company.id,
  product_id: product.id,
  batch_code: BATCH_CODE,
  planned_quantity: QUANTITY,
  generated_quantity: 0,
  activated_quantity: 0,
  code_length: CODE_LENGTH,
  manufactured_at: new Date().toISOString().slice(0, 10),
  expires_at: EXPIRES,
  notes: NOTES || null,
  status: "DRAFT",
}).select().single()
if (be) throw new Error(`Could not create batch: ${be.message}`)

console.log(`\n  created batch ${BATCH_CODE}\n`)

let generated = 0

try {
  while (generated < QUANTITY) {
    const size = Math.min(QUANTITY - generated, CHUNK_SIZE)
    await insertUnits(batch, product, size)
    generated += size
    await db.from("batches").update({ generated_quantity: generated }).eq("id", batch.id)
    console.log(`  generated ${generated.toLocaleString()} / ${QUANTITY.toLocaleString()}`)
  }

  await db.from("batches").update({ status: "CODES_GENERATED" }).eq("id", batch.id)
} catch (err) {
  console.error(`\n  FAILED after ${generated} units: ${err.message}`)
  console.error(`  Batch ${BATCH_CODE} is left in DRAFT with ${generated} units. Delete it and start again.\n`)
  process.exit(1)
}

// ------------------------------------------------------- prove the output
const { count: total } = await db.from("auth_units")
  .select("*", { count: "exact", head: true }).eq("batch_id", batch.id)

console.log(`
  ${total?.toLocaleString()} units in ${BATCH_CODE}, status CODES_GENERATED, NOT activated.
`)
if (total !== QUANTITY) {
  console.error(`  !! expected ${QUANTITY} units, found ${total}. Investigate before printing.\n`)
  process.exit(1)
}

console.log(`  Next: node --env-file=.env.local scripts/hakiki-print-sheet.mjs --batch=${BATCH_CODE}\n`)
process.exit(0)

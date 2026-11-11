/**
 * HAKIKI production label sheets.
 *
 * Lays labels out 4 across by 6 down — 24 to an A4 page — and renders a
 * print-ready PDF with headless Chrome. This is the file a security printer
 * receives, and the file we proof on an office printer before committing to a
 * 50,000 unit run.
 *
 *   node --env-file=.env.local scripts/hakiki-print-sheet.mjs --test
 *       ONE page, 24 real live labels in a fresh TEST batch, activated.
 *       Scratch, type, and HAKIKI answers HALISI. Print this first.
 *
 *   node scripts/hakiki-print-sheet.mjs --specimen
 *       ONE page of invented data for a print house. Nothing is registered,
 *       so every code reports "code not recognised" — correct for a trial,
 *       and the sheet says so on its face.
 *
 *   node --env-file=.env.local scripts/hakiki-print-sheet.mjs --batch=BATCH-CODE
 *       The real thing. Pulls that batch's units from the database and lays
 *       out every one of them. --pages=N proofs the first N pages only.
 *
 * Why 4 x 6: a 45 x 40 mm label is the smallest that still carries an 18 mm QR,
 * a readable serial, and a scratch panel wide enough for silver ink to sit
 * flat. 24 of them fill A4 edge to edge with a 9 mm gripper margin, which is
 * what a roll-fed press wants.
 *
 * The QR size is not a style choice. A unit URL is 51 characters, which at
 * error correction M is a 33 x 33 module symbol, so the printed module is
 * width / 33. Below about 0.5 mm a module stops surviving ink spread on
 * coated stock and the code goes from "scans every time" to "scans on the
 * third try", which on a shop floor means the customer gives up. 18 mm holds
 * the module at 0.55 mm with headroom; 15 mm would have put it at 0.45 mm.
 */
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { spawn } from "node:child_process"
import QRCode from "qrcode"

// ---------------------------------------------------------------- arguments
const has = (name) => process.argv.includes(`--${name}`)
const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}

const MODE = has("batch") || arg("batch", null) ? "batch" : has("test") ? "test" : "specimen"
const BATCH_CODE = arg("batch", null)
const PAGES = Number(arg("pages", MODE === "batch" ? Infinity : 1))
const COUNT = Number(arg("count", 24))
const CODE_LENGTH = Number(arg("code-length", 10))
const COMPANY_SLUG = arg("company", "goddess-glow")
const PRODUCT_SKU = arg("product", "GG-CREAM-300")
const NO_PDF = has("no-pdf")

/**
 * Labels per PDF file. 0 means one file for everything.
 *
 * A 10,000 unit run is 417 A4 pages. Rendering that as a single document is
 * both slow and fragile: one Chrome hiccup costs the whole job, the file is
 * too large to email, and reprinting units 3,200-3,300 means sending the
 * printer a 100 MB document to find them in. Splitting at 500 gives ~21 page
 * files named by the range they contain, so a reprint is one small file.
 */
const SPLIT = Number(arg("split", 0))

/** Where the files land. Defaults to print/, overridden for real runs. */
const OUT_DIR = arg("out", null)

/**
 * Units created at or after this time go last, after the rest of the batch.
 *
 * Units are laid out in serial order, and a top-up's random serials would
 * otherwise land all through the run, shifting every label after the first
 * one and making PDFs already sent to a printer wrong. With this, the first
 * files come out identical and the top-up is only the tail.
 *
 * A batch topped up more than once takes a comma-separated list, one time per
 * top-up, so every earlier tier keeps its place: --topup-since=T1,T2
 */
const TOPUP_SINCE = arg("topup-since", null)

/**
 * Lay out only units after this position. For a top-up whose earlier labels
 * are already printed: slices start here, so the new files never repeat a
 * label from the old last file. The CSV still covers the whole batch.
 */
const FROM = Number(arg("from", 0))

/** Keep PDFs already on disk whose page count checks out. */
const RESUME = has("resume")

const BASE = process.env.NEXT_PUBLIC_HAKIKI_BASE_URL ?? "https://www.mikenovagroup.co.tz"

/**
 * +255623821175 -> +255 623 821 175.
 *
 * The environment stores the number unspaced because that is what the SMS
 * gateway wants. On a label it has to be read off a bottle and dialled by
 * someone who is already worried, so it gets grouped.
 */
function phone(raw) {
  const digits = (raw ?? "").replace(/\D/g, "")
  return digits.length === 12 && digits.startsWith("255")
    ? `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
    : (raw ?? "")
}

const SUPPORT = phone(process.env.NEXT_PUBLIC_HAKIKI_SUPPORT_PHONE ?? "+255623821175")
const COMPANY = "MIKENOVA GROUP"
const OUT = path.join(process.cwd(), "print")
const PER_PAGE = 24

// ------------------------------------------------------------- identities
// Same Crockford-style alphabet the production generator uses: no I, L, O or
// U, so nothing on a printed label reads as a 1 or a 0. Kept in step with
// lib/hakiki/codes.ts — a label that disagrees with the generator is a bug.
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
const serial = () => `HK-${randomString(SERIAL_ALPHABET, 4)}-${randomString(SERIAL_ALPHABET, 4)}`
const publicToken = () => randomString(TOKEN_ALPHABET, 12)

/** Numeric, never starting with 0 — matches generateScratchCode(). */
function scratchCode(length = CODE_LENGTH) {
  let code = String(1 + Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0x100000000) * 9))
  for (let i = 1; i < length; i++) code += pick("0123456789")
  return code
}

/** Groups of four, exactly as lib/hakiki/format.ts renders it on screen. */
const group = (code) => String(code).replace(/(\d{4})(?=\d)/g, "$1 ")

// -------------------------------------------------- crypto (mirrors lib/)
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

function decryptCode(payload) {
  const [version, ivHex, tagHex, ctHex] = payload.split(":")
  if (version !== "v1") throw new Error("Unsupported ciphertext version")
  const key = Buffer.from(requireSecret("HAKIKI_ENCRYPTION_KEY"), "hex")
  const d = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"))
  d.setAuthTag(Buffer.from(tagHex, "hex"))
  return Buffer.concat([d.update(Buffer.from(ctHex, "hex")), d.final()]).toString("utf8")
}

async function database() {
  const { createClient } = await import("@supabase/supabase-js")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase credentials missing — run with --env-file=.env.local")
  return createClient(url, key, { auth: { persistSession: false } })
}

// ------------------------------------------------------------ data sources

/** Read an existing batch's units. This is what a real production run prints. */
async function fromBatch(code) {
  const db = await database()
  const { data: batch, error } = await db
    .from("batches")
    .select("id, batch_code, status, code_length, generated_quantity, products(name, size), companies(name)")
    .eq("batch_code", code)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!batch) throw new Error(`Batch "${code}" not found`)

  // Paged, because 50,000 rows will not come back in one request.
  const units = []
  const PAGE = 1000
  for (let offset = 0; ; offset += PAGE) {
    const { data, error: unitError } = await db
      .from("auth_units")
      .select("serial_number, public_token, secret_code_encrypted, status, created_at")
      .eq("batch_id", batch.id)
      .order("serial_number")
      .range(offset, offset + PAGE - 1)
    if (unitError) throw new Error(unitError.message)
    if (!data?.length) break
    units.push(...data)
    if (data.length < PAGE) break
  }

  if (!units.length) throw new Error(`Batch ${code} has no generated units yet`)

  if (TOPUP_SINCE) {
    const sinces = TOPUP_SINCE.split(",").map((t) => {
      const ms = new Date(t).getTime()
      if (Number.isNaN(ms)) throw new Error(`--topup-since is not a date: ${t}`)
      return ms
    }).sort((a, b) => a - b)
    // Tier 0 is the original run, tier n the nth top-up. Serial order within a tier.
    const tier = (u) => sinces.filter((ms) => new Date(u.created_at).getTime() >= ms).length
    const tiers = Array.from({ length: sinces.length + 1 }, () => [])
    for (const u of units) tiers[tier(u)].push(u)
    units.splice(0, units.length, ...tiers.flat())
    console.log(`  top-up tiers: ${tiers.map((t) => t.length.toLocaleString()).join(" + ")}`)
  }

  const inactive = units.filter((u) => u.status !== "ACTIVE").length

  return {
    label: batch.batch_code,
    live: true,
    batchCode: batch.batch_code,
    product: `${batch.products?.name ?? ""}${batch.products?.size ? ` ${batch.products.size}` : ""}`.trim(),
    codeLength: batch.code_length,
    inactive,
    units: units.map((u) => ({
      serial: u.serial_number,
      token: u.public_token,
      code: u.secret_code_encrypted ? decryptCode(u.secret_code_encrypted) : "",
      url: `${BASE}/verify/${u.public_token}`,
    })),
  }
}

/**
 * Register N brand-new units in their own batch and activate them.
 *
 * Activation is deliberate: a unit sits in GENERATED until someone confirms
 * the label reached a real product, and the engine answers NOT_ACTIVATED for
 * anything else. A test sheet has to be activated or every code on it reports
 * "not approved for sale", which looks exactly like a broken system.
 */
async function fromNewTestBatch(count) {
  const db = await database()

  const { data: company, error: ce } = await db
    .from("companies").select("id, name").eq("slug", COMPANY_SLUG).single()
  if (ce || !company) throw new Error(`Company "${COMPANY_SLUG}" not found — run scripts/hakiki-seed.mjs first`)

  const { data: product, error: pe } = await db
    .from("products").select("id, name, size").eq("company_id", company.id).eq("sku", PRODUCT_SKU).single()
  if (pe || !product) throw new Error(`Product "${PRODUCT_SKU}" not found for ${company.name}`)

  const units = []
  const seen = new Set()
  while (units.length < count) {
    const s = serial()
    if (seen.has(s)) continue
    seen.add(s)
    const code = scratchCode()
    units.push({ serial: s, token: publicToken(), code, url: "" })
  }

  const batchCode = `TEST-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomString("0123456789", 3)}`
  const { data: batch, error: be } = await db.from("batches").insert({
    company_id: company.id,
    product_id: product.id,
    batch_code: batchCode,
    planned_quantity: count,
    generated_quantity: count,
    activated_quantity: count,
    code_length: CODE_LENGTH,
    status: "ACTIVE",
    activated_at: new Date().toISOString(),
    notes: "Print test sheet — live credentials, 24 up",
  }).select().single()
  if (be) throw new Error(`Could not create test batch: ${be.message}`)

  const { error: ue } = await db.from("auth_units").insert(
    units.map((u) => ({
      company_id: company.id,
      product_id: product.id,
      batch_id: batch.id,
      serial_number: u.serial,
      public_token: u.token,
      secret_code_hmac: hmacCode(u.code),
      secret_code_encrypted: encryptCode(u.code),
      status: "ACTIVE",
      activated_at: new Date().toISOString(),
    })),
  )
  if (ue) {
    await db.from("batches").delete().eq("id", batch.id)
    throw new Error(`Could not register units: ${ue.message}`)
  }

  for (const u of units) u.url = `${BASE}/verify/${u.token}`

  return {
    label: batchCode,
    live: true,
    batchCode,
    product: `${product.name}${product.size ? ` ${product.size}` : ""}`,
    codeLength: CODE_LENGTH,
    inactive: 0,
    units,
  }
}

/**
 * Invented data that exists nowhere.
 *
 * The QR points at the plain /verify page rather than a unit page, because a
 * printer scanning a sample must never be shown a 404, and specimen artwork
 * must not carry credentials that exist in the database.
 */
function fromSpecimen(count) {
  const units = []
  const seen = new Set()
  while (units.length < count) {
    const s = serial()
    if (seen.has(s)) continue
    seen.add(s)
    units.push({ serial: s, token: publicToken(), code: scratchCode(), url: `${BASE}/verify` })
  }
  return {
    label: "SPECIMEN",
    live: false,
    batchCode: null,
    product: "Goddess Glow Body Cream 250ml",
    codeLength: CODE_LENGTH,
    inactive: 0,
    units,
  }
}

// ----------------------------------------------------------------- artwork
/**
 * The quiet zone is part of the symbol, not part of the layout.
 *
 * `margin: 0` puts the finder patterns hard against the edge of the box and
 * leaves the white border to whatever happens to sit next to it — which works
 * on screen and fails on a bottle, where a die-cut edge or a neighbouring
 * rule lands 1 mm away. Baking two modules in means the printer cannot crop
 * it away and the label's own padding adds to it rather than standing in for
 * it, giving roughly 2.3 mm of clean white on every side.
 *
 * The dark is pure #000000 and not the brand near-black. #1B1A17 separates
 * into a four colour CMYK build, so every module is printed by four plates
 * that have to register perfectly; a tenth of a millimetre of drift fattens
 * the modules with coloured fringes and the symbol stops decoding. 100% K
 * prints from one plate and cannot mis-register with itself.
 */
const qr = (text) =>
  QRCode.toString(text, {
    type: "svg",
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#FFFFFF" },
  })

const SHIELD = `<svg viewBox="0 0 24 24" fill="none" stroke="#1B1A17" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`

/** Downward chevron that points from the instruction into the panel below it. */
const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`

/**
 * One label.
 *
 * The instruction sits ABOVE the dashed box, never inside it. The dashed box
 * is exactly the area silver scratch ink covers, so anything printed in there
 * disappears under the coating — including, on the first artwork, the words
 * telling the customer to scratch. The caption has to survive the coating or
 * it is not an instruction, it is a secret.
 */
const label = (u, index) => `
  <div class="cell">
    <div class="tick tl"></div><div class="tick tr"></div>
    <div class="tick bl"></div><div class="tick br"></div>
    <div class="label">
      <div class="head">
        <span class="mark">${SHIELD}</span>
        <span class="word">HAKIKI</span>
        <span class="tag">Scan. Scratch. Hakiki.</span>
      </div>

      <div class="body">
        <div class="qr">${u.svg}</div>
        <div class="meta">
          <div class="cap">SERIAL</div>
          <div class="serial">${u.serial}</div>
          <div class="rule"></div>
          <div class="cap">MSAADA</div>
          <div class="support">${SUPPORT}</div>
        </div>
      </div>

      <div class="instruct">
        <span class="arrow">${ARROW}</span>
        <span class="instruct-sw">KWANGUA HAPA</span>
        <span class="instruct-en">SCRATCH HERE</span>
        <span class="arrow">${ARROW}</span>
      </div>

      <div class="panel"><div class="code">${group(u.code)}</div></div>

      <div class="foot"><span>${COMPANY}</span><span><b>${BASE.replace(/^https?:\/\//, "")}/verify</b></span></div>
    </div>
    <div class="cellno">${String(index + 1).padStart(3, "0")}</div>
  </div>`

/**
 * The stamp has to state what these codes ACTUALLY do today.
 *
 * "LIVE - these codes verify as genuine" was printed on every page of a batch
 * whose 10,000 units were all still GENERATED, which was simply untrue: until
 * the batch is activated they answer "haijaidhinishwa kwa mauzo rasmi". A
 * sheet that misdescribes its own codes is how the specimen pilot got printed
 * and tested as if it were live, so the stamp now reads the unit status
 * rather than assuming that a real batch means a working one.
 */
function stampFor(source) {
  if (!source.live) {
    return { cls: "warn", text: "SPECIMEN &middot; invented data &middot; these codes will NOT verify" }
  }
  if (source.inactive === 0) {
    return { cls: "ok", text: "ACTIVATED &middot; these codes verify as genuine" }
  }
  if (source.inactive === source.units.length) {
    return { cls: "hold", text: "NOT YET ACTIVATED &middot; activate after labelling" }
  }
  return { cls: "warn", text: `PARTLY ACTIVATED &middot; ${source.inactive.toLocaleString()} of ${source.units.length.toLocaleString()} not active` }
}

function page(labels, pageNo, pageCount, source) {
  const stamp = stampFor(source)

  return `
<div class="page">
  <div class="masthead">
    <div class="left">
      <h1>HAKIKI &mdash; ${source.label}</h1>
      <div class="sub">${COMPANY} &middot; ${source.product} &middot; 45 &times; 40 mm die-cut &middot; 4 across &times; 6 down &middot; 24 up</div>
    </div>
    <div class="right">
      <div class="stamp ${stamp.cls}">${stamp.text}</div>
      <div class="sub">page ${pageNo} of ${pageCount}</div>
    </div>
  </div>

  <div class="grid">${labels.join("")}</div>

  <div class="slug">
    <span>ARTWORK 100% &middot; DO NOT SCALE &middot; TICKS ARE TRIM MARKS, NON-PRINTING</span>
    <span>QR 20 MM &middot; 0.54 MM MODULE &middot; EC M &middot; QUIET ZONE IN &middot; 100% K</span>
    <span>SILVER INK COVERS THE DASHED BOX ONLY</span>
  </div>
</div>`
}

const STYLE = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html { color-scheme: light; }
  body { margin: 0; background: #fff; color: #1B1A17;
         font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }

  .page { width: 210mm; height: 297mm; padding: 8mm 9mm 7mm; background: #fff;
          display: flex; flex-direction: column; page-break-after: always; overflow: hidden; }
  .page:last-child { page-break-after: auto; }

  /* ---------------------------------------------------- page furniture */
  .masthead { display: flex; align-items: flex-end; justify-content: space-between; gap: 6mm;
              border-bottom: .4mm solid #1B1A17; padding-bottom: 2mm; }
  /* The batch code can be long, and a masthead that wraps onto two lines
     pushes the grid down on all 417 pages. It stays on one line and the
     subtitle carries the detail. */
  .masthead .left { min-width: 0; }
  .masthead h1 { margin: 0; font-size: 9pt; letter-spacing: .12em; font-weight: 700; white-space: nowrap; }
  .masthead .sub { font-size: 5.8pt; color: #6B6862; letter-spacing: .04em; white-space: nowrap;
                   overflow: hidden; text-overflow: ellipsis; }
  .masthead .right { text-align: right; flex: none; }
  .stamp { display: inline-block; padding: 1.2mm 2.4mm; margin-bottom: 1mm; white-space: nowrap;
           font-size: 5.8pt; letter-spacing: .08em; font-weight: 700; }
  .stamp.ok   { border: .25mm solid #1FA463; color: #12683F; background: #F1FAF5; }
  .stamp.warn { border: .25mm solid #E53935; color: #B3261E; background: #FEF2F2; }
  /* Not an error — a batch waiting for activation is the correct state for
     artwork that has not been applied to product yet. */
  .stamp.hold { border: .25mm solid #F0A500; color: #8A6000; background: #FFF8E8; }
  .slug { margin-top: auto; padding-top: 2.2mm; border-top: .25mm solid #D9D6D0;
          display: flex; justify-content: space-between; gap: 3mm; white-space: nowrap;
          font-size: 4.9pt; color: #8C8A85; letter-spacing: .04em; }

  /* ------------------------------------------------------- 4 x 6 grid */
  .grid { display: grid; grid-template-columns: repeat(4, 45mm); grid-template-rows: repeat(6, 40mm);
          justify-content: space-between; align-content: space-between;
          margin-top: 4mm; height: 257.5mm; }
  .cell { position: relative; width: 45mm; height: 40mm; }
  .cellno { position: absolute; bottom: -3.4mm; right: 0; font-size: 4.6pt;
            letter-spacing: .1em; color: #C4C1BB; }
  .tick { position: absolute; width: 2mm; height: 2mm; }
  .tick.tl { top: -1.8mm; left: -1.8mm; border-top: .2mm solid #C4C1BB; border-left: .2mm solid #C4C1BB; }
  .tick.tr { top: -1.8mm; right: -1.8mm; border-top: .2mm solid #C4C1BB; border-right: .2mm solid #C4C1BB; }
  .tick.bl { bottom: -1.8mm; left: -1.8mm; border-bottom: .2mm solid #C4C1BB; border-left: .2mm solid #C4C1BB; }
  .tick.br { bottom: -1.8mm; right: -1.8mm; border-bottom: .2mm solid #C4C1BB; border-right: .2mm solid #C4C1BB; }

  /* ----------------------------------------------------------- label */
  .label { width: 100%; height: 100%; border: .25mm solid #1B1A17; border-radius: 2mm;
           overflow: hidden; background: #fff; display: flex; flex-direction: column; }

  .head { height: 5mm; flex: none; background: #F0A500; display: flex; align-items: center;
          gap: 1.1mm; padding: 0 1.8mm; }
  .head .mark { width: 3mm; height: 3mm; display: block; flex: none; }
  .head .mark svg { width: 100%; height: 100%; display: block; }
  .head .word { font-size: 7pt; font-weight: 700; letter-spacing: .13em; color: #1B1A17; }
  .head .tag { margin-left: auto; font-size: 4.3pt; font-weight: 600; letter-spacing: .04em;
               color: #1B1A17; opacity: .78; }

  .body { display: flex; gap: 1.4mm; padding: .6mm 1.2mm .4mm; align-items: flex-start; flex: none; }
  /* 20 mm box = 37 modules (33 data + 2 quiet each side) = 0.54 mm per
     module. Do not shrink it: below 0.5 mm the symbol stops surviving ink
     spread on coated stock. */
  .qr { width: 20mm; height: 20mm; flex: none; padding: 0; background: #fff; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .meta { flex: 1; min-width: 0; padding-top: 2.4mm; }
  .cap { font-size: 4pt; letter-spacing: .14em; color: #8C8A85; font-weight: 700; }
  .serial { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 7pt; font-weight: 700;
            letter-spacing: 0; margin-top: .3mm; white-space: nowrap; }
  .rule { height: .2mm; background: #E7E5E1; margin: 1.6mm 0; }
  .support { font-size: 6pt; font-weight: 600; color: #1B1A17; margin-top: .3mm; white-space: nowrap; }

  /* The instruction lives OUTSIDE the coated area. Silver ink covers the
     dashed box below it and nothing else, so this line stays readable on a
     bottle sitting on a shelf. */
  .instruct { flex: none; display: flex; align-items: center; justify-content: center; gap: .8mm;
              margin: 0 1.6mm .5mm; color: #8A6000; }
  .instruct .arrow { width: 1.9mm; height: 1.9mm; display: block; flex: none; }
  .instruct .arrow svg { width: 100%; height: 100%; display: block; }
  .instruct-sw { font-size: 4.8pt; font-weight: 700; letter-spacing: .09em; }
  .instruct-en { font-size: 4.1pt; font-weight: 600; letter-spacing: .07em; color: #A08246; }

  /* SCRATCH AREA — silver ink footprint. Nothing but the code goes in here. */
  .panel { flex: 1; min-height: 6.4mm; margin: 0 1.6mm 1mm; border: .3mm dashed #8C8A85;
           border-radius: .8mm; background: #F7F6F4;
           display: flex; align-items: center; justify-content: center; }
  .code { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 9.5pt; font-weight: 700;
          letter-spacing: .06em; }

  .foot { height: 3.2mm; flex: none; border-top: .2mm solid #E7E5E1; display: flex;
          align-items: center; justify-content: space-between; padding: 0 1.6mm;
          font-size: 4.1pt; letter-spacing: .03em; color: #6B6862; }
  .foot b { color: #1B1A17; font-weight: 700; }
`

// --------------------------------------------------------------- assembly
async function build() {
  const source =
    MODE === "batch" ? await fromBatch(BATCH_CODE)
    : MODE === "test" ? await fromNewTestBatch(COUNT)
    : fromSpecimen(COUNT)

  const outRoot = OUT_DIR ? path.resolve(OUT_DIR) : OUT
  fs.mkdirSync(outRoot, { recursive: true })

  const stemBase = `hakiki-${(source.batchCode ?? "specimen").toLowerCase()}`
  const totalPages = Math.ceil(source.units.length / PER_PAGE)

  // The CSV always covers the WHOLE batch, even when only a proof page is
  // laid out, because it is the variable-data file the press merges from and
  // the PDF is only how a human checks the artwork.
  const csvPath = path.join(outRoot, `${source.batchCode ?? "specimen"}.csv`)
  fs.writeFileSync(
    csvPath,
    "serial,scratch_code,qr_url\n" + source.units.map((u) => `${u.serial},${u.code},${u.url}`).join("\n") + "\n",
  )

  console.log(`\n${source.label} — ${source.units.length.toLocaleString()} labels, ${totalPages.toLocaleString()} pages at 24 up`)
  if (source.inactive > 0) {
    console.log(
      `\n  !! ${source.inactive.toLocaleString()} of these units are NOT ACTIVE. Until the batch is`
      + `\n     reconciled and activated they answer "haijaidhinishwa kwa mauzo rasmi".`
      + `\n     For a batch that has not shipped yet, that is correct.\n`,
    )
  }
  console.log(`  csv  ${csvPath}   (all ${source.units.length.toLocaleString()} units)`)

  // Which slices of the batch get laid out as PDFs.
  const limit = Math.min(source.units.length, PAGES === Infinity ? source.units.length : PAGES * PER_PAGE)
  const chunkSize = SPLIT > 0 ? SPLIT : limit
  const slices = []
  if (FROM >= limit) throw new Error(`--from=${FROM} leaves nothing to lay out (${limit} units)`)
  for (let start = FROM; start < limit; start += chunkSize) {
    slices.push([start, Math.min(start + chunkSize, limit)])
  }

  const pad = String(source.units.length).length
  for (const [start, end] of slices) {
    const name = SPLIT > 0
      ? `${String(start + 1).padStart(pad, "0")}-${String(end).padStart(pad, "0")}`
      : (limit < source.units.length ? `${stemBase}-proof-${Math.ceil(limit / PER_PAGE)}p` : stemBase)

    const units = source.units.slice(start, end)
    const pageCount = Math.ceil(units.length / PER_PAGE)
    const pdfPath = path.join(outRoot, `${name}.pdf`)

    // Resume: a 20,000 unit run is 40 files and a quarter of an hour. If it
    // is interrupted, redoing the files that already came out whole is pure
    // waste — but "already exists" is not good enough as a test, because the
    // failure this guards against writes a valid PDF with pages missing. So
    // an existing file is kept only if its page count is right.
    //
    // Checked BEFORE the QR symbols are drawn: each skipped slice would
    // otherwise cost 500 QR generations and a multi-megabyte HTML write for
    // a file we are about to leave alone.
    if (RESUME && !NO_PDF && fs.existsSync(pdfPath)) {
      const have = pdfPageCount(fs.readFileSync(pdfPath))
      if (have === pageCount) {
        console.log(`  skip ${path.basename(pdfPath)}  ${have} pages already correct`)
        continue
      }
      console.log(`  redo ${path.basename(pdfPath)}  had ${have} pages, expected ${pageCount}`)
    }

    const rendered = await Promise.all(units.map(async (u) => ({ ...u, svg: await qr(u.url) })))
    const pages = []
    for (let p = 0; p < pageCount; p++) {
      const slice = rendered.slice(p * PER_PAGE, (p + 1) * PER_PAGE)
      pages.push(page(slice.map((u, i) => label(u, start + p * PER_PAGE + i)), p + 1, pageCount, source))
    }

    const html = `<meta charset="utf-8" />
<title>HAKIKI ${source.batchCode ?? "specimen"} ${name}</title>
<style>${STYLE}</style>
${pages.join("\n")}`

    const htmlPath = path.join(outRoot, `${name}.html`)
    fs.writeFileSync(htmlPath, html)

    if (!NO_PDF) {
      const written = await toPdf(htmlPath, pdfPath, pageCount)
      // The HTML is scaffolding for Chrome, not a deliverable, and at this
      // scale it is the bulk of the folder. Once the PDF exists it goes.
      fs.rmSync(htmlPath, { force: true })
      const mb = (fs.statSync(pdfPath).size / 1048576).toFixed(1)
      // The count printed here is read back out of the finished file, not the
      // number of pages we meant to write.
      console.log(`  pdf  ${path.basename(pdfPath)}  ${written} pages verified, ${mb} MB`)
    } else {
      console.log(`  html ${path.basename(htmlPath)}  ${pageCount} pages`)
    }
  }

  if (source.units.length <= 24) {
    console.log("")
    for (const u of source.units) console.log(`  ${u.serial}  ${group(u.code)}  ${u.url}`)
  }
  if (!source.live) console.log("\nThese codes are invented and will report \"code not recognised\".")
}

/**
 * Render with headless Chrome, over the DevTools protocol.
 *
 * Chrome is the only renderer whose page box we can trust here — the CSS is
 * written in millimetres against A4, and a PDF that silently scales to fit
 * would move the QR below the 0.5 mm module floor and break every scan.
 *
 * One browser is started for the whole run and reused. The obvious
 * alternative, spawning `--print-to-pdf` per file, cost about three minutes
 * PER INVOCATION on a cold profile: almost none of it rendering, nearly all
 * of it Chrome reaching for safe browsing lists, component updates and sync
 * endpoints before it will draw anything. Twenty files would have been an
 * hour of waiting. The --disable-* flags below turn that off, and holding one
 * browser open pays the startup once instead of once per file.
 */
const CHROME_FLAGS = [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-extensions",
  "--disable-background-networking",
  "--disable-component-update",
  "--disable-client-side-phishing-detection",
  "--disable-sync",
  "--disable-default-apps",
  "--safebrowsing-disable-auto-update",
  "--metrics-recording-only",
  "--mute-audio",
]

let browser = null

async function startBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean)

  const bin = candidates.find((c) => fs.existsSync(c))
  if (!bin) return null

  const port = 9300 + Math.floor(Math.random() * 600)
  const profile = fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "hakiki-chrome-"))
  const proc = spawn(bin, [...CHROME_FLAGS, `--user-data-dir=${profile}`,
    `--remote-debugging-port=${port}`, "about:blank"], { stdio: "ignore" })

  let wsUrl = null
  for (let i = 0; i < 100 && !wsUrl; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`)
      wsUrl = (await res.json()).find((t) => t.type === "page")?.webSocketDebuggerUrl ?? null
    } catch {}
    if (!wsUrl) await new Promise((r) => setTimeout(r, 200))
  }
  if (!wsUrl) {
    proc.kill()
    fs.rmSync(profile, { recursive: true, force: true })
    return null
  }

  const ws = new WebSocket(wsUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = () => reject(new Error("could not attach to Chrome"))
  })

  let nextId = 1
  const pending = new Map()
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data)
    const slot = msg.id && pending.get(msg.id)
    if (!slot) return
    pending.delete(msg.id)
    msg.error ? slot.reject(new Error(JSON.stringify(msg.error))) : slot.resolve(msg.result)
  }
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
    })

  await send("Page.enable")
  await send("Runtime.enable")
  return {
    send,
    /**
     * Tearing down must never throw.
     *
     * Chrome keeps writing to its profile directory for a moment after the
     * kill signal, so removing it immediately raced and threw ENOTEMPTY —
     * which, from inside the recycle path, aborted a 20 file run five files
     * in. The temp directory is disposable; losing the render is not.
     */
    close: () => {
      try { ws.close() } catch {}
      try { proc.kill() } catch {}
      try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }) } catch {}
    },
  }
}

const PRINT_OPTIONS = {
  // A4 in inches, because printToPDF takes no other unit. The CSS @page is
  // already A4; these must agree or Chrome scales and the QR shrinks.
  paperWidth: 8.2677,
  paperHeight: 11.6929,
  marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
  printBackground: true,
  preferCSSPageSize: true,
}

/** Files rendered by the current browser, so it can be recycled before it dies. */
let rendered = 0
const RECYCLE_AFTER = 5

/**
 * How many pages the written PDF actually contains.
 *
 * The page tree root carries /Count for the whole document and each child
 * node carries its own smaller count, so the largest value is the total.
 *
 * This exists because a tired Chrome does not fail loudly. On one run it
 * returned a perfectly valid PDF for a 21 page document that contained only
 * 17 pages — 96 labels quietly absent from a file whose name promised a range
 * of 500, with the CSV still listing all of them. Nothing downstream would
 * have caught that until a production line ran out of stickers.
 */
function pdfPageCount(buffer) {
  const counts = [...buffer.toString("latin1").matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]))
  return counts.length ? Math.max(...counts) : 0
}

/**
 * Render one document, surviving a tired renderer.
 *
 * Each file is 21 A4 pages carrying about 500 inline QR symbols, every one of
 * them a few hundred SVG paths. Held in a single long-lived browser that
 * accumulated to "Printing failed" partway through a 20 file run, and a
 * half-written folder is worse than a slow one: nothing downstream would have
 * told us which ranges were missing. So the browser is recycled every few
 * files, a failed print retries on a fresh one, and the caller only ever sees
 * a complete PDF or a thrown error.
 */
async function toPdf(htmlPath, pdfPath, expectedPages) {
  if (browser === null) browser = (await startBrowser()) ?? false
  if (browser === false) {
    console.warn("  Chrome not found — HTML kept, PDF skipped. Set CHROME_PATH, or print the HTML at 100%.")
    return 0
  }

  if (rendered >= RECYCLE_AFTER) {
    browser.close()
    browser = await startBrowser()
    rendered = 0
  }

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await browser.send("Page.navigate", { url: `file://${htmlPath}` })

      // Wait for the document to actually exist, rather than guessing.
      //
      // A fixed sleep here printed whatever Chrome had parsed so far, which
      // on a 4 MB file holding 500 inline QR symbols meant PDFs of 12, 13, 16
      // and 19 pages where 21 were expected — varying run to run, because it
      // was a race. Counting the laid-out .page elements is exact: the
      // document is ready when the DOM holds every page we wrote into it.
      let ready = false
      for (let i = 0; i < 150 && !ready; i++) {
        const probe = await browser.send("Runtime.evaluate", {
          returnByValue: true,
          expression: `({ state: document.readyState,
                          pages: document.querySelectorAll('.page').length,
                          fonts: document.fonts ? document.fonts.status : 'loaded' })`,
        })
        const v = probe.result.value ?? {}
        ready = v.state === "complete" && v.pages === expectedPages && v.fonts === "loaded"
        if (!ready) await new Promise((r) => setTimeout(r, 200))
      }
      if (!ready) throw new Error("document never finished laying out")

      const { data } = await browser.send("Page.printToPDF", PRINT_OPTIONS)
      const buffer = Buffer.from(data, "base64")

      // A short PDF is not an error Chrome reports. Count the pages and treat
      // a shortfall exactly like a thrown exception.
      const pages = pdfPageCount(buffer)
      if (pages !== expectedPages) {
        throw new Error(`wrote ${pages} pages, expected ${expectedPages}`)
      }

      fs.writeFileSync(pdfPath, buffer)

      // Drop the document before the next one loads, so 20 files do not
      // accumulate 10,000 symbols worth of retained DOM.
      await browser.send("Page.navigate", { url: "about:blank" }).catch(() => {})
      rendered++
      return pages
    } catch (err) {
      if (attempt === 4) throw new Error(`${path.basename(pdfPath)} failed after 4 attempts: ${err.message}`)
      console.warn(`  ${path.basename(pdfPath)}: ${err.message} — restarting Chrome and retrying`)
      try { browser.close() } catch {}
      browser = await startBrowser()
      rendered = 0
      if (!browser) throw new Error("Chrome could not be restarted")
    }
  }
}

build()
  // The Supabase client and the Chrome socket both hold the event loop open
  // after the work is done, so without this the script sits there looking
  // like it has hung on a job that actually finished.
  .then(() => { if (browser) browser.close(); process.exit(0) })
  .catch((err) => {
    if (browser) browser.close()
    console.error(`\n${err.message}\n`)
    process.exit(1)
  })

/**
 * HAKIKI pilot label artwork.
 *
 * Builds a two page, print-ready sheet:
 *   page 1 — 9 die-cut labels, each with a UNIQUE QR, serial and scratch code
 *   page 2 — the print specification and a quality-check strip
 *
 * Two modes, and the difference matters:
 *
 *   node --env-file=.env.local scripts/hakiki-pilot-labels.mjs --live
 *       Registers 9 real units in a pilot batch, activates them, and prints
 *       labels carrying those real identities. Scan one, scratch it, type the
 *       code, and HAKIKI answers HALISI. This is the sheet to print when you
 *       want to show the system working.
 *
 *   node scripts/hakiki-pilot-labels.mjs
 *       Specimen sheet. Random data that exists nowhere, for sending to a
 *       print house that only needs to prove it can do variable data, a
 *       scratch panel and a legible QR. Every code on it WILL report
 *       "code not recognised", because there is nothing behind it. The sheet
 *       says so on its face so nobody mistakes that for a broken system.
 *
 * The pilot is how you find a printer who can do three things: variable data
 * (every label different), a scratch-off panel that hides the code and comes
 * off cleanly, and a QR that still scans at 17 mm. The quality strip on page 2
 * is how you compare the samples they send back.
 */
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import QRCode from "qrcode"

const LIVE = process.argv.includes("--live")
const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}

const BASE = process.env.NEXT_PUBLIC_HAKIKI_BASE_URL ?? "https://www.mikenovagroup.co.tz"
const SUPPORT = process.env.NEXT_PUBLIC_HAKIKI_SUPPORT_PHONE ?? "+255 623 821 175"
const COMPANY = "MIKENOVA GROUP"
const COUNT = Number(arg("count", 9))
const COMPANY_SLUG = arg("company", "goddess-glow")
const PRODUCT_SKU = arg("product", "GG-CREAM-250")
const CODE_LENGTH = Number(arg("code-length", 10))
const OUT = path.join(process.cwd(), "print")

// Same Crockford-style alphabet the production generator uses: no I, L, O or U,
// so nothing on a printed label reads as 1 or 0. Kept in step with
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
const group = (code) => code.replace(/(\d{4})(?=\d)/g, "$1 ")

// ---- server-side crypto, mirroring lib/hakiki/crypto.ts ----------------
const requireSecret = (name) => {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is not set. --live cannot register units without it`)
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

/**
 * Register the nine labels as real, activated units.
 *
 * Activation is deliberate. A unit sits in GENERATED until someone confirms
 * the label reached a real product, and the engine answers NOT_ACTIVATED for
 * anything else — which is exactly the "has not been approved by the system"
 * message you get from a sheet that was printed but never registered.
 */
async function registerLive(units) {
  const { createClient } = await import("@supabase/supabase-js")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase credentials missing. Run with --env-file=.env.local")

  const db = createClient(url, key, { auth: { persistSession: false } })

  const { data: company, error: companyError } = await db
    .from("companies").select("id, name").eq("slug", COMPANY_SLUG).single()
  if (companyError || !company) {
    throw new Error(`Company "${COMPANY_SLUG}" not found. Run scripts/hakiki-seed.mjs first`)
  }

  const { data: product, error: productError } = await db
    .from("products").select("id, name, size").eq("company_id", company.id).eq("sku", PRODUCT_SKU).single()
  if (productError || !product) {
    throw new Error(`Product "${PRODUCT_SKU}" not found for ${company.name}`)
  }

  const batchCode = `PILOT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomString("0123456789", 3)}`
  const { data: batch, error: batchError } = await db.from("batches").insert({
    company_id: company.id,
    product_id: product.id,
    batch_code: batchCode,
    planned_quantity: units.length,
    generated_quantity: units.length,
    activated_quantity: units.length,
    code_length: CODE_LENGTH,
    status: "ACTIVE",
    activated_at: new Date().toISOString(),
    notes: "Pilot label sheet — printed samples, live credentials",
  }).select().single()
  if (batchError) throw new Error(`Could not create pilot batch: ${batchError.message}`)

  const { error: unitError } = await db.from("auth_units").insert(
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
  if (unitError) {
    await db.from("batches").delete().eq("id", batch.id)
    throw new Error(`Could not register units: ${unitError.message}`)
  }

  return { batchCode, company: company.name, product: `${product.name}${product.size ? ` ${product.size}` : ""}` }
}

const qr = (text, ec = "M") =>
  QRCode.toString(text, { type: "svg", margin: 0, errorCorrectionLevel: ec, color: { dark: "#1B1A17", light: "#FFFFFF" } })

const MARK = `<svg viewBox="0 0 24 24" fill="none" stroke="#1B1A17" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`

async function build() {
  const units = []
  const seen = new Set()
  while (units.length < COUNT) {
    const s = serial()
    if (seen.has(s)) continue
    seen.add(s)
    units.push({ serial: s, token: publicToken(), code: scratchCode() })
  }

  // In live mode the QR carries the unit's real public token, so a scan lands
  // on that bottle's page and names the product before a code is typed. In
  // specimen mode there is no unit to point at, so it goes to the plain
  // verify page — a printer scanning a sample must never be shown a 404, and
  // specimen artwork must not carry credentials that exist in the database.
  let registered = null
  if (LIVE) {
    registered = await registerLive(units)
    for (const u of units) u.url = `${BASE}/verify/${u.token}`
  } else {
    for (const u of units) u.url = `${BASE}/verify`
  }

  const labels = await Promise.all(units.map(async (u) => ({ ...u, svg: await qr(u.url) })))

  // Quality strip: the same payload rendered at three sizes, so a sample tells
  // you exactly how small this printer can go before a phone stops reading it.
  const strip = await qr(units[0].url)

  const stamp = LIVE
    ? `LIVE &middot; batch ${registered.batchCode} &middot; these nine codes verify as genuine`
    : `SPECIMEN &middot; dummy data &middot; these codes will NOT verify`

  const label = (u, i) => `
    <div class="cell">
      <div class="cellno">${String(i + 1).padStart(2, "0")}</div>
      <div class="tick tl"></div><div class="tick tr"></div>
      <div class="tick bl"></div><div class="tick br"></div>
      <div class="label">
        <div class="head">
          <span class="mark">${MARK}</span>
          <span class="word">HAKIKI</span>
          <span class="tag">Scan. Scratch. Hakiki.</span>
        </div>
        <div class="body">
          <div class="qr">${u.svg}</div>
          <div class="meta">
            <div class="cap">SERIAL</div>
            <div class="serial">${u.serial}</div>
            <div class="rule"></div>
            <div class="how">Scan QR au tembelea<br /><b>${BASE.replace(/^https?:\/\//, "")}/verify</b></div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-cap">KWANGUA HAPA &middot; SCRATCH HERE</div>
          <div class="code">${group(u.code)}</div>
        </div>
        <div class="foot"><span>${COMPANY}</span><span>Msaada ${SUPPORT}</span></div>
      </div>
    </div>`

  const html = `<meta charset="utf-8" />
<title>HAKIKI Pilot Labels</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html { color-scheme: light; }
  body {
    margin: 0; background: #fff; color: #1B1A17;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
  .page {
    width: 210mm; height: 297mm; padding: 14mm 16mm; background: #fff;
    display: flex; flex-direction: column; page-break-after: always; overflow: hidden;
  }
  .page:last-child { page-break-after: auto; }

  /* ---------- page furniture ---------- */
  .masthead { display: flex; align-items: flex-end; justify-content: space-between;
              border-bottom: 0.4mm solid #1B1A17; padding-bottom: 3mm; }
  .masthead h1 { margin: 0; font-size: 11pt; letter-spacing: .22em; font-weight: 700; }
  .masthead .sub { font-size: 7pt; color: #6B6862; letter-spacing: .06em; }
  .stamp { margin-top: 3mm; padding: 2mm 3mm; font-size: 6.5pt; letter-spacing: .1em; font-weight: 700;
           border: .25mm solid ${LIVE ? "#1FA463" : "#E53935"}; color: ${LIVE ? "#12683F" : "#B3261E"};
           background: ${LIVE ? "#F1FAF5" : "#FEF2F2"}; }
  .slug { padding-top: 4mm; margin-top: 6mm; border-top: 0.25mm solid #D9D6D0;
          display: flex; justify-content: space-between; font-size: 6pt; color: #8C8A85; letter-spacing: .08em; }

  /* ---------- label grid ---------- */
  .grid { display: grid; grid-template-columns: repeat(3, 50mm); grid-auto-rows: 40mm;
          justify-content: space-between; row-gap: 24mm; margin-top: 12mm; }
  .cell { position: relative; width: 50mm; height: 40mm; }
  .cellno { position: absolute; top: -4.6mm; left: 0; font-size: 5pt; letter-spacing: .12em; color: #B9B6B0; }
  .tick { position: absolute; width: 2.5mm; height: 2.5mm; border: 0; }
  .tick.tl { top: -2.2mm; left: -2.2mm; border-top: .2mm solid #B9B6B0; border-left: .2mm solid #B9B6B0; }
  .tick.tr { top: -2.2mm; right: -2.2mm; border-top: .2mm solid #B9B6B0; border-right: .2mm solid #B9B6B0; }
  .tick.bl { bottom: -2.2mm; left: -2.2mm; border-bottom: .2mm solid #B9B6B0; border-left: .2mm solid #B9B6B0; }
  .tick.br { bottom: -2.2mm; right: -2.2mm; border-bottom: .2mm solid #B9B6B0; border-right: .2mm solid #B9B6B0; }

  .label { width: 100%; height: 100%; border: .25mm solid #1B1A17; border-radius: 2mm;
           overflow: hidden; background: #fff; display: flex; flex-direction: column; }

  .head { height: 5.5mm; background: #F0A500; display: flex; align-items: center; gap: 1.2mm; padding: 0 2mm; }
  .head .mark { width: 3.2mm; height: 3.2mm; display: block; }
  .head .mark svg { width: 100%; height: 100%; display: block; }
  .head .word { font-size: 7.5pt; font-weight: 700; letter-spacing: .14em; color: #1B1A17; }
  .head .tag { margin-left: auto; font-size: 4.6pt; font-weight: 600; letter-spacing: .05em; color: #1B1A17; opacity: .75; }

  .body { display: flex; flex: 1; gap: 2mm; padding: 2mm; align-items: flex-start; }
  .qr { width: 17mm; height: 17mm; flex: none; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .meta { flex: 1; min-width: 0; padding-top: .3mm; }
  .cap { font-size: 4.4pt; letter-spacing: .16em; color: #8C8A85; font-weight: 700; }
  .serial { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 8pt; font-weight: 700;
            letter-spacing: .02em; margin-top: .4mm; }
  .rule { height: .2mm; background: #E7E5E1; margin: 1.6mm 0; }
  .how { font-size: 4.8pt; line-height: 1.45; color: #55534E; }
  .how b { color: #1B1A17; }

  .panel { margin: 0 2mm 1.2mm; height: 7.5mm; border: .25mm dashed #8C8A85; border-radius: .8mm;
           background: #F7F6F4; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .panel-cap { font-size: 4.2pt; letter-spacing: .14em; font-weight: 700; color: #8C8A85; }
  .code { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 10pt; font-weight: 700;
          letter-spacing: .08em; margin-top: .4mm; }

  .foot { height: 3.5mm; border-top: .2mm solid #E7E5E1; display: flex;
          align-items: center; justify-content: space-between; padding: 0 2mm;
          font-size: 4.4pt; letter-spacing: .06em; color: #6B6862; }

  .brief { margin-top: auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6mm;
           border: .25mm solid #E7E5E1; border-radius: 1.5mm; padding: 4mm 5mm; }
  .brief h3 { margin: 0 0 1.5mm; font-size: 6pt; letter-spacing: .14em; font-weight: 700; color: #8C8A85; }
  .brief p { margin: 0; font-size: 7pt; line-height: 1.5; }

  /* ---------- spec page ---------- */
  .spec { margin-top: 8mm; display: grid; grid-template-columns: 1fr 1fr; gap: 7mm 9mm; }
  .spec section { break-inside: avoid; }
  .spec h2 { margin: 0 0 2.5mm; font-size: 7pt; letter-spacing: .18em; font-weight: 700;
             border-bottom: .25mm solid #E7E5E1; padding-bottom: 1.5mm; }
  .spec dl { margin: 0; font-size: 7.5pt; line-height: 1.5; }
  .spec dt { color: #8C8A85; font-size: 6.2pt; letter-spacing: .1em; font-weight: 700; margin-top: 2mm; }
  .spec dt:first-child { margin-top: 0; }
  .spec dd { margin: .3mm 0 0; }
  .spec ol, .spec ul { margin: 0; padding-left: 4mm; font-size: 7.5pt; line-height: 1.6; }
  .spec li { margin-bottom: 1mm; }
  .must { background: #FFF8E8; border-left: 1mm solid #F0A500; padding: 3mm 3.5mm; }
  .must p { margin: 0 0 1.5mm; font-size: 7.5pt; line-height: 1.5; }
  .must p:last-child { margin-bottom: 0; }
  .swatches { display: flex; gap: 2mm; margin-top: 2mm; }
  .sw { flex: 1; height: 9mm; border-radius: .8mm; display: flex; align-items: flex-end;
        justify-content: center; padding-bottom: .8mm; font-size: 4.6pt; letter-spacing: .06em; }

  .strip { margin-top: 7mm; border: .25mm solid #E7E5E1; border-radius: 1.5mm; padding: 4mm; }
  .strip .row { display: flex; align-items: flex-end; gap: 7mm; }
  .qtest { text-align: center; }
  .qtest .box svg { display: block; }
  .qtest .lbl { font-size: 5pt; color: #8C8A85; margin-top: 1.2mm; letter-spacing: .08em; }
  .ttest { font-family: "SF Mono", Menlo, Consolas, monospace; line-height: 1.7; }
  .ttest div span { color: #8C8A85; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 5pt; }
  .reg { width: 12mm; height: 12mm; position: relative; }
  .reg:before, .reg:after { content: ""; position: absolute; background: #1B1A17; }
  .reg:before { left: 50%; top: 0; bottom: 0; width: .2mm; margin-left: -.1mm; }
  .reg:after { top: 50%; left: 0; right: 0; height: .2mm; margin-top: -.1mm; }
  .reg i { position: absolute; inset: 2.5mm; border: .2mm solid #1B1A17; border-radius: 50%; }
</style>

<div class="page">
  <div class="masthead">
    <div>
      <h1>HAKIKI &mdash; PILOT LABELS</h1>
      <div class="sub">${COMPANY} &middot; ${COUNT} labels &middot; every label carries different data</div>
    </div>
    <div class="sub">50 &times; 40 mm &middot; die-cut &middot; page 1 of 2</div>
  </div>

  <div class="stamp">${stamp}</div>

  <div class="grid">${labels.map(label).join("")}</div>

  <div class="brief">
    <section><h3>1 / EVERY LABEL DIFFERS</h3><p>All ${COUNT} carry a different QR, serial and code. Production runs reach 50,000 units, all unique. <b>Variable data is the whole job.</b></p></section>
    <section><h3>2 / SCRATCH PANEL</h3><p>The dashed box is where silver scratch-off ink goes, over release varnish. It must hide the code, then come off cleanly.</p></section>
    <section><h3>3 / THE QR</h3><p>17 mm, 100% black on white, 2 mm quiet zone. It has to scan first time from an ordinary phone.</p></section>
    <section><h3>4 / ${LIVE ? "THESE CODES ARE REAL" : "THIS IS A TRIAL"}</h3><p>${
      LIVE
        ? `Registered to batch ${registered.batchCode} and activated. Scan, scratch, type the ${CODE_LENGTH} digits and HAKIKI answers HALISI.`
        : "Print these, apply the scratch panel, send the samples back. Full specification and pricing questions on page 2."
    }</p></section>
  </div>

  <div class="slug">
    <span>ARTWORK 100% &middot; DO NOT SCALE &middot; CORNER TICKS ARE TRIM MARKS, NON-PRINTING</span>
    <span>HAKIKI PILOT</span>
  </div>
</div>

<div class="page">
  <div class="masthead">
    <div>
      <h1>PRINT SPECIFICATION</h1>
      <div class="sub">What we need quoted, and what a good sample looks like</div>
    </div>
    <div class="sub">page 2 of 2</div>
  </div>

  <div class="spec">
    <section class="must">
      <h2>THE THREE THINGS THAT DECIDE THIS</h2>
      <p><b>1. Variable data.</b> Every single label must carry a different QR, serial and code &mdash; merged from our CSV. Runs reach 50,000 units. If you cannot do this in-house, tell us now.</p>
      <p><b>2. The scratch panel.</b> Silver scratch-off ink over release varnish. It must hide the code completely under strong light, and come off with a coin without damaging the code underneath.</p>
      <p><b>3. The QR.</b> It must scan first time from an ordinary phone at 15 cm, straight off the shelf.</p>
    </section>

    <section>
      <h2>LABEL</h2>
      <dl>
        <dt>SIZE</dt><dd>50 &times; 40 mm, die-cut, 2 mm corner radius</dd>
        <dt>BLEED / SAFE AREA</dt><dd>2 mm bleed, 2 mm safe margin inside trim</dd>
        <dt>MATERIAL &mdash; QUOTE ALL THREE</dt>
        <dd>a. White semi-gloss paper, permanent adhesive<br />
            b. White BOPP / synthetic, permanent (moisture resistant)<br />
            c. Destructible vinyl, tamper-evident (tears if peeled)</dd>
        <dt>FINISH</dt><dd>Matt or gloss lamination on the printed area only &mdash; the scratch panel must stay unlaminated</dd>
        <dt>SUPPLY</dt><dd>On roll, 3 inch core, quote also for sheets</dd>
      </dl>
    </section>

    <section>
      <h2>COLOUR &amp; INK</h2>
      <dl>
        <dt>GOLD</dt><dd>#F0A500 &middot; CMYK 0 / 33 / 100 / 6 &middot; nearest Pantone 137 C</dd>
        <dt>DARK</dt><dd>#1B1A17 &middot; CMYK 0 / 5 / 15 / 95</dd>
        <dt>QR CODE</dt><dd>100% black on white only. No screen, no gradient, no lamination distortion.</dd>
        <dt>ARTWORK</dt><dd>Supplied RGB with fonts embedded. Convert to CMYK your side and send a proof before running.</dd>
      </dl>
      <div class="swatches">
        <div class="sw" style="background:#F0A500;color:#1B1A17">GOLD 100%</div>
        <div class="sw" style="background:#F4BB40;color:#1B1A17">75%</div>
        <div class="sw" style="background:#F7D280;color:#1B1A17">50%</div>
        <div class="sw" style="background:#1B1A17;color:#fff">DARK 100%</div>
      </div>
    </section>

    <section>
      <h2>QR TOLERANCES</h2>
      <ul>
        <li>Printed at 17 mm on this sheet. Minimum module (smallest square) <b>0.5 mm</b>.</li>
        <li>Quiet zone of at least 2 mm of clean white on all four sides.</li>
        <li>Error correction M. Ink spread that fattens the modules will break it &mdash; check a sample with a phone, not with a scanner gun.</li>
        <li>No varnish, foil or lamination that lifts gloss over the QR.</li>
      </ul>
    </section>

    <section>
      <h2>WHAT TO SEND BACK</h2>
      <ol>
        <li>Two printed samples on each of the three materials.</li>
        <li>At least one sample with the scratch panel applied, so we can scratch it.</li>
        <li>Price per 1,000 / 10,000 / 50,000 labels, stating which price includes variable data and the scratch panel.</li>
        <li>Lead time for 50,000, and whether variable data and scratch coating are done in-house or subcontracted.</li>
        <li>Minimum order quantity.</li>
      </ol>
    </section>

    <section>
      <h2>NOTES</h2>
      <ul>
        ${
          LIVE
            ? `<li>The codes on page 1 are <b>live credentials</b> in batch ${registered.batchCode}, registered to ${registered.product}. They verify as genuine. Do not send this sheet to a printer &mdash; use the specimen sheet for that.</li>
               <li>Each code is ${CODE_LENGTH} digits, shown in groups of four, exactly as the verify page asks for them.</li>
               <li>A code checked a second time reports CODE IMESHATUMIKA. Each code is a one-time credential, so that is the guard working, not a failure.</li>`
            : `<li>The codes on page 1 are <b>specimen data</b>. They exist nowhere in the system and will report "code not recognised" if anyone tries to verify them. That is correct behaviour for a print trial.</li>
               <li>Each code is ${CODE_LENGTH} digits, shown in groups of four, exactly as the verify page asks for them.</li>
               <li>Real codes arrive as a CSV at production time and must never be reused, reprinted or stored.</li>`
        }
        <li>Trim marks are the grey corner ticks. Do not scale the artwork.</li>
        <li>Print the sheet at 100% / actual size to test. Any "fit to page" ruins the QR test.</li>
      </ul>
    </section>
  </div>

  <div class="strip">
    <h2 style="margin:0 0 3mm;font-size:7pt;letter-spacing:.18em;font-weight:700">QUALITY CHECK STRIP &mdash; PRINT THIS, THEN JUDGE THE SAMPLE</h2>
    <div class="row">
      <div class="qtest"><div class="box" style="width:17mm;height:17mm">${strip}</div><div class="lbl">17 mm &middot; 0.52 mm module &middot; TARGET</div></div>
      <div class="qtest"><div class="box" style="width:13mm;height:13mm">${strip}</div><div class="lbl">13 mm &middot; 0.39 mm</div></div>
      <div class="qtest"><div class="box" style="width:10mm;height:10mm">${strip}</div><div class="lbl">10 mm &middot; 0.30 mm &middot; SHOULD FAIL</div></div>
      <div class="ttest">
        <div style="font-size:4pt">HK-7K9M-2PXQ 4827 1936 52 <span>4 pt</span></div>
        <div style="font-size:5pt">HK-7K9M-2PXQ 4827 1936 52 <span>5 pt</span></div>
        <div style="font-size:6pt">HK-7K9M-2PXQ 4827 1936 52 <span>6 pt</span></div>
        <div style="font-size:8pt">HK-7K9M-2PXQ 4827 1936 52 <span>8 pt</span></div>
      </div>
      <div class="qtest"><div class="reg"><i></i></div><div class="lbl">REGISTRATION</div></div>
    </div>
  </div>

  <div class="slug">
    <span>${COMPANY} &middot; Msaada ${SUPPORT} &middot; ${BASE.replace(/^https?:\/\//, "")}</span>
    <span>HAKIKI PILOT &middot; PAGE 2 OF 2</span>
  </div>
</div>`

  const suffix = LIVE ? "-live" : ""
  fs.mkdirSync(OUT, { recursive: true })
  fs.writeFileSync(path.join(OUT, `hakiki-pilot-labels${suffix}.html`), html)
  fs.writeFileSync(
    path.join(OUT, `hakiki-pilot-labels${suffix}.csv`),
    "serial,scratch_code,qr_url\n" + units.map((u) => `${u.serial},${u.code},${u.url}`).join("\n") + "\n",
  )

  console.log(
    LIVE
      ? `${COUNT} LIVE labels written to ${OUT} — batch ${registered.batchCode}, ${registered.product}`
      : `${COUNT} SPECIMEN labels written to ${OUT} — these codes will not verify`,
  )
  for (const u of units) console.log(`  ${u.serial}  ${group(u.code)}  ${u.url}`)
  if (!LIVE) console.log("\nRun with --live to register these as real, verifiable units.")
}

build().catch((err) => {
  console.error(`\n${err.message}\n`)
  process.exit(1)
})

import QRCode from "qrcode"
import { redirect, notFound } from "next/navigation"
import { getAdmin } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { decryptCode } from "@/lib/hakiki/crypto"
import { formatScratchCode } from "@/lib/hakiki/codes"
import { DemoSheetControls } from "./controls"

export const dynamic = "force-dynamic"
export const metadata = { robots: { index: false, follow: false } }

/**
 * One-page client demonstration sheet.
 *
 * Hands a prospect ten real, working products plus two deliberate failures, so
 * they can watch HAKIKI answer GENUINE, WARNING and INVALID on their own phone
 * in about a minute. Every QR here resolves to a live unit — this is the
 * product, not a mockup.
 */
export default async function DemoSheetPage({
  params,
  searchParams,
}: {
  params: Promise<{ batchId: string }>
  searchParams: Promise<{ count?: string }>
}) {
  const admin = await getAdmin()
  if (!admin) redirect("/verify-admin")
  if (admin.role !== "ADMIN") {
    return <main style={{ padding: 40, fontFamily: "system-ui", color: "#b91c1c" }}>
      Only an ADMIN can open the demo sheet — it contains live scratch codes.
    </main>
  }

  const { batchId } = await params
  const count = Math.min(12, Math.max(4, Number((await searchParams).count ?? 10) || 10))

  const db = serviceClient()
  const { data: batch } = await db
    .from("batches")
    .select("id, batch_code, company_id, products(name, size), companies(name, support_phone)")
    .eq("id", batchId).eq("company_id", admin.companyId).maybeSingle()
  if (!batch) notFound()

  // Fresh units make the strongest demo: the prospect sees "this is the FIRST
  // time this code has ever been verified", which is the whole pitch.
  const { data: fresh } = await db
    .from("auth_units")
    .select("serial_number, public_token, secret_code_encrypted")
    .eq("batch_id", batchId).eq("status", "ACTIVE").eq("verification_count", 0)
    .order("serial_number").limit(count)

  // A unit already verified by several different people — shows the warning.
  const { data: copied } = await db
    .from("auth_units")
    .select("serial_number, public_token, secret_code_encrypted, verification_count, distinct_verifiers")
    .eq("batch_id", batchId).gte("distinct_verifiers", 3)
    .order("distinct_verifiers", { ascending: false }).limit(1)

  const base = process.env.NEXT_PUBLIC_HAKIKI_BASE_URL ?? "https://www.mikenovagroup.co.tz"
  const product = (batch as any).products
  const company = (batch as any).companies

  const qr = (text: string) =>
    QRCode.toString(text, { type: "svg", margin: 0, errorCorrectionLevel: "M" })

  const labels = await Promise.all(
    (fresh ?? []).map(async (u, i) => ({
      n: i + 1,
      serial: u.serial_number,
      code: u.secret_code_encrypted ? decryptCode(u.secret_code_encrypted) : "",
      qr: await qr(`${base}/verify/${u.public_token}`),
    })),
  )

  const dupe = copied?.[0]
  const dupeCode = dupe?.secret_code_encrypted ? decryptCode(dupe.secret_code_encrypted) : null
  const dupeQr = dupe ? await qr(`${base}/verify/${dupe.public_token}`) : null
  const entryQr = await qr(`${base}/verify`)

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        * { box-sizing: border-box; }
        html { color-scheme: light; }
        body { margin: 0; background: #eceae6; color: #14130f;
               font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }

        .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff;
                display: flex; flex-direction: column; }

        .masthead { background: #0F0E0C; color: #fff; padding: 7mm 10mm 6mm;
                    display: flex; align-items: center; justify-content: space-between; gap: 6mm; }
        .logo { height: 11mm; width: auto; }
        .hk { display: flex; align-items: center; gap: 2.5mm; }
        .hk-tile { width: 8mm; height: 8mm; border-radius: 2mm; background: #F0A500;
                   display: grid; place-items: center; color: #0F0E0C; font-weight: 800; font-size: 4.6mm; }
        .hk-name { font-size: 4.6mm; font-weight: 700; letter-spacing: .04em; line-height: 1; }
        .hk-tag { font-size: 2.5mm; color: #F0A500; letter-spacing: .1em; margin-top: 1mm; }

        .intro { padding: 6mm 10mm 0; }
        h1 { font-size: 6.2mm; margin: 0 0 1.5mm; letter-spacing: -.02em; }
        .sub { font-size: 3.3mm; color: #5d5b56; margin: 0; line-height: 1.5; }

        .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm;
                 padding: 5mm 10mm 0; }
        .step { border: .3mm solid #e2e0db; border-radius: 2.5mm; padding: 3mm 3.5mm; background: #fcfcfb; }
        .step b { display: block; font-size: 3.1mm; margin-bottom: 1mm; }
        .step-n { display: inline-grid; place-items: center; width: 4.5mm; height: 4.5mm;
                  border-radius: 50%; background: #F0A500; color: #0F0E0C;
                  font-size: 2.7mm; font-weight: 800; margin-right: 1.5mm; }
        .step p { margin: 0; font-size: 2.8mm; color: #5d5b56; line-height: 1.45; }

        .band { padding: 5mm 10mm 0; }
        .band-title { font-size: 3mm; font-weight: 700; letter-spacing: .1em;
                      text-transform: uppercase; color: #8a8781; margin: 0 0 2.5mm; }

        .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2.5mm; }
        .card { border: .3mm solid #d9d7d2; border-radius: 2.5mm; padding: 2.5mm 2mm;
                text-align: center; background: #fff; }
        .card .idx { font-size: 2.4mm; color: #a5a29b; font-weight: 700; }
        .card .qr { width: 17mm; height: 17mm; margin: 1mm auto .5mm; }
        .card .qr svg { width: 100%; height: 100%; display: block; }
        .card .sn { font-size: 2.3mm; font-family: ui-monospace, monospace; color: #6f6c66; }
        .card .cd { font-size: 3.2mm; font-weight: 700; font-family: ui-monospace, monospace;
                    letter-spacing: .02em; margin-top: .8mm; }

        .tests { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; padding: 5mm 10mm 0; }
        .test { border-radius: 2.5mm; padding: 3.5mm 4mm; display: flex; gap: 3.5mm; align-items: flex-start; }
        .test.warn { background: #fffbeb; border: .3mm solid #fcd34d; }
        .test.bad  { background: #fef2f2; border: .3mm solid #fca5a5; }
        .test .qr { width: 15mm; height: 15mm; flex: 0 0 15mm; }
        .test .qr svg { width: 100%; height: 100%; display: block; }
        .test h3 { margin: 0 0 1mm; font-size: 3.2mm; }
        .test.warn h3 { color: #92400e; }
        .test.bad h3  { color: #991b1b; }
        .test p { margin: 0; font-size: 2.7mm; line-height: 1.45; color: #5d5b56; }
        .test .cd { font-family: ui-monospace, monospace; font-weight: 700; font-size: 3.4mm;
                    margin: 1.2mm 0; letter-spacing: .04em; color: #14130f; }

        .foot { margin-top: auto; background: #0F0E0C; color: #cfccc6;
                padding: 5mm 10mm; display: flex; justify-content: space-between;
                align-items: center; gap: 5mm; font-size: 2.8mm; }
        .foot b { color: #fff; font-size: 3.2mm; }
        .foot .url { color: #F0A500; font-weight: 700; }

        @media print { .no-print { display: none !important; } body { background: #fff; }
                       .page { margin: 0; box-shadow: none; } }
        @media screen { .page { box-shadow: 0 2mm 8mm rgba(0,0,0,.12); margin: 6mm auto; } }
      `}</style>

      <DemoSheetControls batchId={batchId} count={count} batchCode={batch.batch_code} />

      <div className="page">
        <div className="masthead">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-new.png" alt="MIKENOVA GROUP" className="logo" />
          <div className="hk">
            <span className="hk-tile">✓</span>
            <span>
              <span className="hk-name">HAKIKI</span>
              <span className="hk-tag" style={{ display: "block" }}>SCAN. SCRATCH. HAKIKI.</span>
            </span>
          </div>
        </div>

        <div className="intro">
          <h1>Prove any product is real, in ten seconds</h1>
          <p className="sub">
            Every {product?.name ?? "product"} carries its own secret identity. Scan the code below,
            enter the hidden digits, and HAKIKI tells you whether that exact item is genuine —
            and warns you if the same code has been copied onto counterfeits.
          </p>
        </div>

        <div className="steps">
          {[
            ["Scan", "Point your camera at the QR code. It opens the product's HAKIKI page — but this alone proves nothing."],
            ["Scratch", "On a real product you scratch a silver panel to reveal the hidden digits. They are printed here for the demo."],
            ["Hakiki", "Enter the digits. Only the true holder of that credential gets a green result."],
          ].map(([t, d], i) => (
            <div className="step" key={t}>
              <b><span className="step-n">{i + 1}</span>{t}</b>
              <p>{d}</p>
            </div>
          ))}
        </div>

        <div className="band">
          <p className="band-title">Try these — {labels.length} genuine products, never verified before</p>
          <div className="grid">
            {labels.map((l) => (
              <div className="card" key={l.serial}>
                <div className="idx">{l.n}</div>
                <div className="qr" dangerouslySetInnerHTML={{ __html: l.qr }} />
                <div className="sn">{l.serial}</div>
                <div className="cd">{formatScratchCode(l.code)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="tests">
          <div className="test bad">
            <div className="qr" dangerouslySetInnerHTML={{ __html: entryQr }} />
            <div>
              <h3>Now try a fake</h3>
              <p>Scan this, then type any invented number:</p>
              <div className="cd">4821 9037 55</div>
              <p>HAKIKI refuses it — the code does not exist. This is what a counterfeit looks like.</p>
            </div>
          </div>

          {dupe && dupeCode ? (
            <div className="test warn">
              <div className="qr" dangerouslySetInnerHTML={{ __html: dupeQr! }} />
              <div>
                <h3>Now try a copied code</h3>
                <p>A real code, but already used on {dupe.distinct_verifiers} products:</p>
                <div className="cd">{formatScratchCode(dupeCode)}</div>
                <p>HAKIKI warns that it has been duplicated — catching counterfeits that clone a real label.</p>
              </div>
            </div>
          ) : (
            <div className="test warn">
              <div className="qr" dangerouslySetInnerHTML={{ __html: entryQr }} />
              <div>
                <h3>Copied-code warning</h3>
                <p>
                  Verify any code above from several different phones. On the third, HAKIKI stops
                  saying “genuine” and warns that the code has been duplicated.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="foot">
          <div>
            <b>Verify online</b><br />
            <span className="url">{base.replace(/^https?:\/\//, "")}/verify</span>
          </div>
          <div>
            <b>No internet?</b><br />
            Text your code — HAKIKI replies by SMS.
          </div>
          <div style={{ textAlign: "right" }}>
            <b>{company?.name ?? "MIKENOVA GROUP"}</b><br />
            {company?.support_phone ?? ""} · Batch {batch.batch_code}
          </div>
        </div>
      </div>
    </>
  )
}

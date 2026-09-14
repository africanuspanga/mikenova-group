import QRCode from "qrcode"
import { redirect, notFound } from "next/navigation"
import { getAdmin } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { decryptCode } from "@/lib/hakiki/crypto"
import { formatScratchCode } from "@/lib/hakiki/codes"
import { LabelSheetControls } from "./controls"

export const dynamic = "force-dynamic"
export const metadata = { robots: { index: false, follow: false } }

const MAX_PER_SHEET = 500

/**
 * Printable label sheet.
 *
 * A security printer normally generates the QR itself from the URL column in the
 * CSV. This page exists for the pilot: it renders finished labels — QR, serial and
 * code — so 100 units can be produced on an ordinary printer today, without waiting
 * on a variable-data press.
 *
 * The scratch code is printed in the clear here, so the sheet is ADMIN-only and
 * carries a visible warning. For real production the code goes under a scratch panel.
 */
export default async function LabelSheetPage({
  params,
  searchParams,
}: {
  params: Promise<{ batchId: string }>
  searchParams: Promise<{ from?: string; to?: string; hideCodes?: string }>
}) {
  const admin = await getAdmin()
  if (!admin) redirect("/verify-admin")
  if (admin.role !== "ADMIN") {
    return (
      <main style={{ padding: 40, fontFamily: "system-ui", color: "#E53935" }}>
        Only an ADMIN can view printable labels — they contain the scratch codes.
      </main>
    )
  }

  const { batchId } = await params
  const sp = await searchParams
  const from = Math.max(0, Number(sp.from ?? 0) || 0)
  const to = Math.min(from + MAX_PER_SHEET, from + (Number(sp.to ?? MAX_PER_SHEET) || MAX_PER_SHEET))
  const hideCodes = sp.hideCodes === "1"

  const db = serviceClient()
  const { data: batch } = await db
    .from("batches")
    .select("id, batch_code, company_id, products(name, size), companies(name)")
    .eq("id", batchId)
    .eq("company_id", admin.companyId)
    .maybeSingle()
  if (!batch) notFound()

  const { data: units } = await db
    .from("auth_units")
    .select("serial_number, public_token, secret_code_encrypted")
    .eq("batch_id", batchId)
    .order("serial_number")
    .range(from, to - 1)

  const base = process.env.NEXT_PUBLIC_HAKIKI_BASE_URL ?? "https://www.mikenovagroup.co.tz"
  const product = (batch as any).products
  const company = (batch as any).companies

  // Generate every QR server-side as SVG — vector stays crisp at any label size,
  // and it keeps the page far smaller than 500 embedded PNGs would.
  const labels = await Promise.all(
    (units ?? []).map(async (u) => ({
      serial: u.serial_number,
      code: u.secret_code_encrypted ? decryptCode(u.secret_code_encrypted) : "",
      qr: await QRCode.toString(`${base}/verify/${u.public_token}`, {
        type: "svg",
        margin: 0,
        errorCorrectionLevel: "M",
        color: { dark: "#000000", light: "#FFFFFF" },
      }),
    })),
  )

  return (
    <>
      <style>{`
        @page { size: A4; margin: 8mm; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #f4f4f2; color: #111; }
        html { color-scheme: light; }
        /* The site root sets <html class="dark">, so every colour here must be
           stated explicitly — otherwise the labels inherit cream text and print
           white-on-white. */
        .sheet {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4mm;
          padding: 8mm;
          max-width: 210mm;
          margin: 0 auto;
          background: #fff;
          color: #111;
        }
        .label {
          border: 1px solid #111;
          padding: 3mm;
          text-align: center;
          break-inside: avoid;
          page-break-inside: avoid;
          background: #fff;
          color: #111;
        }
        .label > * { color: inherit; }
        .brand {
          color: #111;
          font: 700 8pt/1 system-ui, sans-serif;
          letter-spacing: .18em;
          border-bottom: 1px solid #111;
          padding-bottom: 1.5mm;
          margin-bottom: 2mm;
        }
        .qr { width: 22mm; height: 22mm; margin: 0 auto; }
        .qr svg { width: 100%; height: 100%; display: block; }
        .qr svg rect[fill="#FFFFFF"], .qr svg path[fill="#FFFFFF"] { fill: #fff; }
        .serial { color: #111; font: 700 7pt/1.2 ui-monospace, monospace; margin-top: 1.5mm; letter-spacing: .04em; }
        .scratch {
          margin-top: 1.5mm; padding-top: 1.5mm; border-top: 1px dashed #999;
          font: 600 5.5pt/1.3 system-ui, sans-serif; letter-spacing: .1em; color: #444;
        }
        .code { color: #111; font: 700 9pt/1.2 ui-monospace, monospace; letter-spacing: .06em; margin-top: .5mm; }
        .masked { background: repeating-linear-gradient(45deg,#999,#999 2px,#bbb 2px,#bbb 4px);
                  color: transparent; border-radius: 1px; }
        .sms { font: 5pt/1.2 system-ui, sans-serif; color: #666; margin-top: 1mm; }
        @media print { .no-print { display: none !important; } body { background: #fff; } }
      `}</style>

      <LabelSheetControls
        batchCode={batch.batch_code}
        productName={product?.name ?? ""}
        shown={labels.length}
        from={from}
        maxPerSheet={MAX_PER_SHEET}
        hideCodes={hideCodes}
        batchId={batchId}
      />

      <div className="sheet">
        {labels.map((label) => (
          <div className="label" key={label.serial}>
            <div className="brand">HAKIKI ✓</div>
            <div className="qr" dangerouslySetInnerHTML={{ __html: label.qr }} />
            <div className="serial">{label.serial}</div>
            <div className="scratch">SCRATCH TO VERIFY</div>
            <div className={`code ${hideCodes ? "masked" : ""}`}>{formatScratchCode(label.code)}</div>
            <div className="sms">{company?.name} · {product?.size}</div>
          </div>
        ))}
      </div>
    </>
  )
}

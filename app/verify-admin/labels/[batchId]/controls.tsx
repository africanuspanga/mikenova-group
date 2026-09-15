"use client"

import Link from "next/link"

/** Screen-only toolbar. Hidden by @media print so it never lands on a label sheet. */
export function LabelSheetControls({
  batchCode, productName, shown, from, maxPerSheet, hideCodes, batchId,
}: {
  batchCode: string
  productName: string
  shown: number
  from: number
  maxPerSheet: number
  hideCodes: boolean
  batchId: string
}) {
  const nextFrom = from + maxPerSheet
  return (
    <div
      className="no-print"
      style={{
        position: "sticky", top: 0, zIndex: 10, display: "flex", flexWrap: "wrap",
        gap: 12, alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px", background: "#141312", color: "#FAFAF8",
        font: "13px system-ui, sans-serif", borderBottom: "1px solid rgba(240,165,0,.25)",
      }}
    >
      <div>
        <strong style={{ color: "#F0A500", letterSpacing: ".08em" }}>{batchCode}</strong>
        <span style={{ opacity: .65 }}> · {productName} · showing {shown} labels from #{from + 1}</span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href={`/verify-admin/labels/${batchId}?from=${from}&hideCodes=${hideCodes ? "0" : "1"}`}
          style={btn}>{hideCodes ? "Show codes" : "Mask codes"}</Link>
        {from > 0 && (
          <Link href={`/verify-admin/labels/${batchId}?from=${Math.max(0, from - maxPerSheet)}`} style={btn}>
            ← Previous
          </Link>
        )}
        {shown === maxPerSheet && (
          <Link href={`/verify-admin/labels/${batchId}?from=${nextFrom}`} style={btn}>Next →</Link>
        )}
        <Link href={`/verify-admin/batches/${batchId}`} style={btn}>Back to batch</Link>
        <button onClick={() => window.print()} style={{ ...btn, background: "#F0A500", color: "#0F0E0C", fontWeight: 700, cursor: "pointer", border: "none" }}>
          Print
        </button>
      </div>

      <p style={{ width: "100%", margin: 0, fontSize: 11, color: "#F0A500", opacity: .8 }}>
        These sheets show the scratch codes in plain text. For real production the code
        goes under a scratch panel. Use “Mask codes” if anyone else can see the screen.
      </p>
    </div>
  )
}

const btn: React.CSSProperties = {
  padding: "8px 14px", border: "1px solid rgba(240,165,0,.35)", color: "#FAFAF8",
  textDecoration: "none", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase",
  background: "transparent",
}

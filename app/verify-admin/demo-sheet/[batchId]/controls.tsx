"use client"

import Link from "next/link"

/** Screen-only toolbar; hidden by @media print. */
export function DemoSheetControls({
  batchId, count, batchCode,
}: { batchId: string; count: number; batchCode: string }) {
  return (
    <div
      className="no-print"
      style={{
        position: "sticky", top: 0, zIndex: 10, display: "flex", flexWrap: "wrap", gap: 10,
        alignItems: "center", justifyContent: "space-between", padding: "12px 16px",
        background: "#0F0E0C", color: "#fff", font: "13px system-ui, sans-serif",
      }}
    >
      <span>
        <strong style={{ color: "#F0A500" }}>Client demo sheet</strong>
        <span style={{ opacity: .7 }}> · {batchCode} · {count} live products</span>
      </span>
      <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[8, 10, 12].map((n) => (
          <Link key={n} href={`/verify-admin/demo-sheet/${batchId}?count=${n}`}
            style={{ ...btn, background: n === count ? "#F0A500" : "transparent", color: n === count ? "#0F0E0C" : "#fff" }}>
            {n}
          </Link>
        ))}
        <Link href={`/verify-admin/batches/${batchId}`} style={btn}>Back</Link>
        <button onClick={() => window.print()}
          style={{ ...btn, background: "#F0A500", color: "#0F0E0C", fontWeight: 700, cursor: "pointer" }}>
          Save as PDF
        </button>
      </span>
      <p style={{ width: "100%", margin: 0, fontSize: 11, color: "#F0A500", opacity: .85 }}>
        In the print dialog choose “Save as PDF”, paper A4, margins None, and tick Background graphics.
      </p>
    </div>
  )
}

const btn: React.CSSProperties = {
  padding: "7px 13px", border: "1px solid rgba(240,165,0,.4)", borderRadius: 6,
  color: "#fff", textDecoration: "none", fontSize: 12, background: "transparent",
}

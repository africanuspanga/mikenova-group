"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, X, Loader2, ArrowRight, ShieldCheck, ShieldAlert } from "lucide-react"
import { PageHeader, Badge, Spinner, EmptyState, Button, Card, inputClass, labelClass, Alert, STATUS_TONE } from "../ui"
import { guessRisk, CODE_LENGTH_OPTIONS, DEFAULT_CODE_LENGTH } from "@/lib/hakiki/risk"

const RISK_STYLE = {
  CATASTROPHIC: { tone: "danger", label: "Do not use" },
  WEAK: { tone: "danger", label: "Too weak" },
  ACCEPTABLE: { tone: "success", label: "Safe" },
  STRONG: { tone: "success", label: "Very safe" },
} as const

export default function BatchesPage() {
  const [batches, setBatches] = useState<any[] | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    product_id: "", batch_code: "", planned_quantity: "50000",
    code_length: String(DEFAULT_CODE_LENGTH), manufactured_at: "", expires_at: "", notes: "",
  })

  async function load() {
    const [b, p] = await Promise.all([
      fetch("/api/hakiki/admin/batches/").then((r) => r.json()),
      fetch("/api/hakiki/admin/products/").then((r) => r.json()),
    ])
    setBatches(b.batches ?? [])
    setProducts(p.products ?? [])
  }
  useEffect(() => { load() }, [])

  async function create() {
    setBusy(true); setError("")
    const res = await fetch("/api/hakiki/admin/batches/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        planned_quantity: Number(form.planned_quantity),
        code_length: Number(form.code_length),
      }),
    })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) return setError(data.error)
    setAdding(false)
    load()
  }

  const quantity = Number(form.planned_quantity) || 0
  const risk = guessRisk(Number(form.code_length), quantity)
  const riskStyle = RISK_STYLE[risk.verdict]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Production batches"
        subtitle="Generate identities, reconcile what was actually labelled, then activate."
        action={
          <Button onClick={() => setAdding((v) => !v)} disabled={products.length === 0}>
            {adding ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> New batch</>}
          </Button>
        }
      />

      {adding && (
        <Card className="mb-5 p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-medium text-foreground">New production batch</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Product *</label>
              <select className={inputClass} value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
                <option value="">Select a product</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.sku}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Batch code *</label>
              <input className={`${inputClass} uppercase`} value={form.batch_code}
                onChange={(e) => setForm({ ...form, batch_code: e.target.value })} placeholder="GG-2609-01" />
            </div>
            <div>
              <label className={labelClass}>Units ordered *</label>
              <input type="number" inputMode="numeric" className={inputClass} value={form.planned_quantity}
                onChange={(e) => setForm({ ...form, planned_quantity: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Manufactured</label>
              <input type="date" className={inputClass} value={form.manufactured_at}
                onChange={(e) => setForm({ ...form, manufactured_at: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Expires</label>
              <input type="date" className={inputClass} value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Notes</label>
              <input className={inputClass} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="China production run, labelled in Dar" />
            </div>
          </div>

          {/* The 6-vs-12 digit question, answered with the actual numbers. */}
          <div className="mt-5 border-t border-border pt-5">
            <label className="mb-1 block text-xs font-medium text-foreground">Scratch code length</label>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Shorter codes are easier to type on a feature phone. But a counterfeiter
              doesn&apos;t crack anything. They print invented digits and hope some verify.
              This is the odds of an invented code hitting a real one in this batch.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {CODE_LENGTH_OPTIONS.map((len) => {
                const r = guessRisk(len, quantity)
                const selected = Number(form.code_length) === len
                const bad = r.verdict === "CATASTROPHIC" || r.verdict === "WEAK"
                return (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setForm({ ...form, code_length: String(len) })}
                    className={`rounded-lg border px-2 py-3 text-center transition-all ${
                      selected
                        ? bad
                          ? "border-[var(--hakiki-danger)] bg-[var(--hakiki-danger-bg)] ring-1 ring-[var(--hakiki-danger)]"
                          : "border-primary bg-[#fdf4e0] ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <span className="num block text-lg font-semibold tracking-tight text-foreground">{len}</span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">digits</span>
                    <span className={`num mt-1.5 block text-[10px] font-medium ${bad ? "text-[var(--hakiki-danger)]" : "text-[var(--hakiki-success)]"}`}>
                      1 in {r.oneIn.toLocaleString()}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className={`mt-3 flex items-start gap-2.5 rounded-lg border px-3.5 py-3 ${
              riskStyle.tone === "danger"
                ? "border-[#fecaca] bg-[var(--hakiki-danger-bg)]"
                : "border-[#bbf7d0] bg-[var(--hakiki-success-bg)]"
            }`}>
              {riskStyle.tone === "danger"
                ? <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hakiki-danger)]" />
                : <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hakiki-success)]" />}
              <p className="text-xs leading-relaxed text-foreground">
                <strong className={riskStyle.tone === "danger" ? "text-[var(--hakiki-danger)]" : "text-[var(--hakiki-success)]"}>
                  {riskStyle.label}.
                </strong>{" "}
                With {quantity.toLocaleString()} units on {form.code_length} digits, roughly{" "}
                <strong>1 in {risk.oneIn.toLocaleString()}</strong> invented codes would come back as genuine.
                {riskStyle.tone === "danger" && " At that rate counterfeiters can print codes at random and still pass verification, which defeats the entire system."}
              </p>
            </div>
          </div>

          {error && <div className="mt-4"><Alert tone="danger">{error}</Alert></div>}
          <Button className="mt-5" onClick={create} disabled={busy || !form.product_id || !form.batch_code}>
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : "Create batch"}
          </Button>
        </Card>
      )}

      {batches === null ? (
        <Spinner />
      ) : batches.length === 0 ? (
        <EmptyState
          title="No batches yet"
          body={products.length === 0
            ? "Create a product first, then come back to generate authentication codes for a production run."
            : "Create a batch to generate the authentication identities for a production run."}
        />
      ) : (
        <div className="space-y-3">
          {batches.map((b) => {
            const pct = b.planned_quantity ? Math.round((b.activated_quantity / b.planned_quantity) * 100) : 0
            return (
              <Link key={b.id} href={`/verify-admin/batches/${b.id}`}
                className="block rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="num text-sm font-semibold tracking-tight text-foreground">{b.batch_code}</span>
                      <Badge tone={STATUS_TONE[b.status]}>{b.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {b.products?.name} · {b.products?.size}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Ordered", b.planned_quantity],
                    ["Generated", b.generated_quantity],
                    ["Activated", b.activated_quantity],
                    ["Voided", b.voided_quantity],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <p className="text-[11px] text-muted-foreground">{label}</p>
                      <p className="num mt-0.5 text-sm font-medium text-foreground">{Number(value).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

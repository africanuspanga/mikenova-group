"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft, Loader2, Download, Cpu, CheckCircle2, Ban, Archive, AlertOctagon, Search, QrCode, Presentation,
} from "lucide-react"
import { StatCard, Badge, Spinner, Button, Card, SectionTitle, Alert, inputClass, STATUS_TONE } from "../../ui"

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<any>(null)
  const [units, setUnits] = useState<any[]>([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busy, setBusy] = useState("")
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [activateMode, setActivateMode] = useState<"count" | "serials">("count")
  const [activateQty, setActivateQty] = useState("")
  const [activateSerials, setActivateSerials] = useState("")

  const load = useCallback(async () => {
    const res = await fetch(`/api/hakiki/admin/batches/${id}/`)
    const json = await res.json()
    if (!res.ok) return setError(json.error)
    setData(json)
  }, [id])

  const loadUnits = useCallback(async () => {
    const params = new URLSearchParams({ filter })
    if (search) params.set("q", search)
    const res = await fetch(`/api/hakiki/admin/batches/${id}/units/?${params}`)
    const json = await res.json()
    setUnits(json.units ?? [])
  }, [id, filter, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadUnits() }, [loadUnits])

  /**
   * Generation runs chunk by chunk so the operator watches real progress
   * rather than a spinner that might be a dead request.
   */
  async function generate() {
    setBusy("generate"); setError(""); setNotice("")
    try {
      for (;;) {
        const res = await fetch(`/api/hakiki/admin/batches/${id}/generate/`, { method: "POST" })
        const json = await res.json()
        if (!res.ok) { setError(json.error); break }
        setProgress({ done: json.generated, total: json.total })
        if (json.done) {
          setNotice(`${json.generated.toLocaleString()} authentication identities generated.`)
          break
        }
      }
    } finally {
      setBusy(""); setProgress(null); load()
    }
  }

  async function activate() {
    setBusy("activate"); setError(""); setNotice("")
    const res = await fetch(`/api/hakiki/admin/batches/${id}/activate/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        activateMode === "count"
          ? { mode: "count", quantity: Number(activateQty) }
          : { mode: "serials", serials: activateSerials },
      ),
    })
    const json = await res.json()
    setBusy("")
    if (!res.ok) return setError(json.error)
    setNotice(`${json.activated.toLocaleString()} units are now live and will verify as genuine.`)
    setActivateQty(""); setActivateSerials("")
    load(); loadUnits()
  }

  async function transition(action: string, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return
    setBusy(action); setError(""); setNotice("")
    const res = await fetch(`/api/hakiki/admin/batches/${id}/transition/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    const json = await res.json()
    setBusy("")
    if (!res.ok) return setError(json.error)
    setNotice(json.voided !== undefined
      ? `${json.voided.toLocaleString()} unapplied codes destroyed.`
      : `Batch is now ${json.status}.`)
    load(); loadUnits()
  }

  if (error && !data) return <div className="p-4 sm:p-6 lg:p-8"><p className="text-[#E53935]">{error}</p></div>
  if (!data) return <Spinner />

  const { batch, counts } = data
  const unactivated = batch.generated_quantity - batch.activated_quantity - counts.voided
  const canGenerate = ["DRAFT", "CODES_GENERATED"].includes(batch.status) && batch.generated_quantity < batch.planned_quantity

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href="/verify-admin/batches" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All batches
      </Link>

      <div className="mb-5 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="num text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{batch.batch_code}</h1>
          <Badge tone={STATUS_TONE[batch.status]}>{batch.status.replace("_", " ")}</Badge>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {batch.products?.name} · {batch.products?.size} · {batch.code_length}-digit codes
        </p>
        {batch.notes && <p className="mt-1 text-sm text-muted-foreground">{batch.notes}</p>}
      </div>

      {notice && <div className="mb-4"><Alert tone="success">{notice}</Alert></div>}
      {error && <div className="mb-4"><Alert tone="danger">{error}</Alert></div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Ordered" value={batch.planned_quantity} />
        <StatCard label="Codes generated" value={batch.generated_quantity} tone="gold" />
        <StatCard label="Activated" value={batch.activated_quantity} tone="success" hint="Live in the market" />
        <StatCard label="Voided" value={counts.voided} hint="Never reached a product" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Awaiting activation" value={unactivated} tone={unactivated > 0 ? "warning" : "default"} />
        <StatCard label="Verified units" value={counts.verified} />
        <StatCard label="Suspicious units" value={counts.suspicious} tone={counts.suspicious > 0 ? "danger" : "default"} />
        <StatCard label="Open alerts" value={counts.openAlerts} tone={counts.openAlerts > 0 ? "danger" : "success"} />
      </div>

      {/* ---- step 1: generate ---- */}
      <Card className="mt-6 p-4 sm:p-5">
        <SectionTitle>Step 1 · Generate identities</SectionTitle>
        <p className="mb-4 mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Creates one serial, QR token and hidden scratch code per unit. Codes are stored
          hashed — the plain text exists only inside the print file.
        </p>

        {progress && (
          <div className="mb-4">
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>Generating…</span>
              <span className="num">{progress.done.toLocaleString()} / {progress.total.toLocaleString()}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={generate} disabled={!canGenerate || busy !== ""}>
            {busy === "generate" ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Cpu className="h-4 w-4" /> Generate codes</>}
          </Button>
          <a href={`/api/hakiki/admin/batches/${id}/export`} download>
            <Button variant="outline" disabled={batch.generated_quantity === 0}>
              <Download className="h-4 w-4" /> Download print file
            </Button>
          </a>
          <a href={`/verify-admin/labels/${id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" disabled={batch.generated_quantity === 0}>
              <QrCode className="h-4 w-4" /> Printable labels
            </Button>
          </a>
          <a href={`/verify-admin/demo-sheet/${id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" disabled={batch.activated_quantity === 0}>
              <Presentation className="h-4 w-4" /> Client demo sheet
            </Button>
          </a>
        </div>
        {batch.generated_quantity > 0 && (
          <p className="mt-3 text-xs leading-relaxed text-[var(--hakiki-warning)]">
            The print file contains every scratch code in plain text — send it to the security
            printer over an encrypted channel and delete local copies afterwards. “Printable
            labels” renders finished labels with QR codes for pilot runs you print yourself.
          </p>
        )}
      </Card>

      {/* ---- step 2: reconcile & activate ---- */}
      <Card className="mt-3 p-4 sm:p-5">
        <SectionTitle>Step 2 · Reconcile and activate</SectionTitle>
        <p className="mb-4 mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Nothing verifies as genuine until it is activated. Activate only what was actually
          applied to a product — the rest stay inert, so a stolen label roll is worthless.
        </p>

        <div className="mb-4 flex gap-2">
          {(["count", "serials"] as const).map((mode) => (
            <button key={mode} onClick={() => setActivateMode(mode)}
              className={`min-h-9 rounded-lg border px-3.5 text-xs font-medium transition-colors ${
                activateMode === mode
                  ? "border-primary bg-[#fdf4e0] text-[#8a5f00]"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}>
              {mode === "count" ? "By quantity" : "By serial list"}
            </button>
          ))}
        </div>

        {activateMode === "count" ? (
          <>
            <input type="number" inputMode="numeric" className={inputClass} value={activateQty}
              onChange={(e) => setActivateQty(e.target.value)}
              placeholder={`How many labels were applied? (max ${unactivated.toLocaleString()})`} />
            <p className="mt-2 text-xs text-muted-foreground">
              Activates that many codes in serial order — matches a printer working sequentially off the roll.
            </p>
          </>
        ) : (
          <>
            <textarea className={`${inputClass} num min-h-32`} value={activateSerials}
              onChange={(e) => setActivateSerials(e.target.value)}
              placeholder={"HK-7K9M-2PXQ\nHK-2B4N-9QRS\n…"} />
            <p className="mt-2 text-xs text-muted-foreground">
              Paste the serials that were scanned on the line. One per line, or comma separated.
            </p>
          </>
        )}

        <Button className="mt-4" onClick={activate}
          disabled={busy !== "" || batch.generated_quantity === 0 ||
            (activateMode === "count" ? !activateQty : !activateSerials.trim())}>
          {busy === "activate" ? <><Loader2 className="h-4 w-4 animate-spin" /> Activating…</> : <><CheckCircle2 className="h-4 w-4" /> Activate units</>}
        </Button>
      </Card>

      {/* ---- lifecycle ---- */}
      <Card className="mt-3 p-4 sm:p-5">
        <SectionTitle>Lifecycle</SectionTitle><div className="h-3" />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => transition("mark_printing")} disabled={busy !== ""}>At printer</Button>
          <Button variant="outline" onClick={() => transition("mark_labelled")} disabled={busy !== ""}>Labels applied</Button>
          <Button variant="outline" disabled={busy !== "" || unactivated <= 0}
            onClick={() => transition("void_remaining", `Permanently destroy the ${unactivated.toLocaleString()} codes that were never applied to a product? This cannot be undone.`)}>
            <Ban className="h-4 w-4" /> Void {unactivated > 0 ? unactivated.toLocaleString() : ""} unused
          </Button>
          <Button variant="outline" onClick={() => transition("close", "Close this batch? Existing units keep verifying normally.")} disabled={busy !== ""}>
            <Archive className="h-4 w-4" /> Close batch
          </Button>
          <Button variant="danger" disabled={busy !== "" || batch.status === "RECALLED"}
            onClick={() => transition("recall", `RECALL the entire batch ${batch.batch_code}? Every unit will tell customers to stop using the product.`)}>
            <AlertOctagon className="h-4 w-4" /> Recall batch
          </Button>
        </div>
      </Card>

      {/* ---- unit inspector ---- */}
      <section className="mt-6">
        <SectionTitle>Units</SectionTitle><div className="h-3" />
        <div className="mb-3 flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className={`${inputClass} num pl-9`} value={search}
              onChange={(e) => setSearch(e.target.value)} placeholder="Search serial…" />
          </div>
          <select className={`${inputClass} sm:w-56`} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All units</option>
            <option value="suspicious">Suspicious only</option>
            <option value="verified">Verified only</option>
            <option value="active">Active</option>
            <option value="generated">Awaiting activation</option>
            <option value="voided">Voided</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-[11px] font-medium text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-normal">Serial</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Scans</th>
                <th className="px-4 py-3 font-normal">People</th>
                <th className="px-4 py-3 font-normal">Last verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {units.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">No units match this filter.</td></tr>
              ) : units.map((u) => (
                <tr key={u.id} className={u.distinct_verifiers >= 3 ? "bg-[var(--hakiki-danger-bg)]" : ""}>
                  <td className="num px-4 py-3 font-medium text-foreground">{u.serial_number}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[u.status]}>{u.status}</Badge></td>
                  <td className="num px-4 py-3 text-muted-foreground">{u.verification_count}</td>
                  <td className={`num px-4 py-3 ${u.distinct_verifiers >= 3 ? "font-medium text-[var(--hakiki-danger)]" : "text-muted-foreground"}`}>
                    {u.distinct_verifiers}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {u.last_verified_at ? new Date(u.last_verified_at).toLocaleString("en-GB") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Showing up to 100 units, most suspicious first.</p>
      </section>
    </div>
  )
}

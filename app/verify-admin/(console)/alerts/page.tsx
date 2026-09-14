"use client"

import { useCallback, useEffect, useState } from "react"
import { ShieldAlert, Loader2 } from "lucide-react"
import { PageHeader, Badge, Spinner, EmptyState, Card, inputClass, STATUS_TONE } from "../ui"

const NEXT_STATUS = ["INVESTIGATING", "RESOLVED", "DISMISSED"] as const

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[] | null>(null)
  const [status, setStatus] = useState("OPEN")
  const [busy, setBusy] = useState("")

  const load = useCallback(async () => {
    setAlerts(null)
    const res = await fetch(`/api/hakiki/admin/alerts/?status=${status}`)
    const json = await res.json()
    setAlerts(json.alerts ?? [])
  }, [status])

  useEffect(() => { load() }, [load])

  async function update(id: string, next: string) {
    setBusy(id)
    await fetch(`/api/hakiki/admin/alerts/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    })
    setBusy("")
    load()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader title="Fraud alerts" subtitle="Deterministic rules — every alert can be read back and defended." />

      <select className={`${inputClass} mb-4 sm:max-w-xs`} value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="OPEN">Open</option>
        <option value="INVESTIGATING">Investigating</option>
        <option value="RESOLVED">Resolved</option>
        <option value="DISMISSED">Dismissed</option>
        <option value="all">All</option>
      </select>

      {alerts === null ? (
        <Spinner />
      ) : alerts.length === 0 ? (
        <EmptyState
          title={status === "OPEN" ? "No open alerts" : "Nothing here"}
          body={status === "OPEN"
            ? "No unit is showing a duplication, brute-force or pre-activation pattern right now."
            : "No alerts with this status."}
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <Card key={a.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <ShieldAlert className={`h-4 w-4 ${a.severity === "WARNING" ? "text-[var(--hakiki-warning)]" : "text-[var(--hakiki-danger)]"}`} />
                <span className="num text-sm font-medium text-foreground">{a.auth_units?.serial_number ?? "—"}</span>
                <Badge tone={STATUS_TONE[a.severity]}>{a.severity}</Badge>
                <Badge>{a.alert_type.replace(/_/g, " ")}</Badge>
                <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-foreground">{a.detail}</p>

              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {a.batches?.batch_code && <span>Batch {a.batches.batch_code}</span>}
                {a.auth_units && <span>{a.auth_units.verification_count} scans · {a.auth_units.distinct_verifiers} people</span>}
                <span>{new Date(a.created_at).toLocaleString("en-GB")}</span>
              </div>

              {a.status !== "RESOLVED" && a.status !== "DISMISSED" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {NEXT_STATUS.filter((s) => s !== a.status).map((s) => (
                    <button key={s} onClick={() => update(a.id, s)} disabled={busy === a.id}
                      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50">
                      {busy === a.id && <Loader2 className="h-3 w-3 animate-spin" />}
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

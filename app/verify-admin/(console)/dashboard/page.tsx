"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShieldAlert, ArrowRight, Layers, MessageSquare, CheckCircle2 } from "lucide-react"
import { PageHeader, StatCard, Badge, Spinner, STATUS_TONE, Button, Card, SectionTitle, Alert } from "../ui"

interface Payload {
  stats: Record<string, number>
  trend: { date: string; genuine: number; suspicious: number; invalid: number }[]
  alerts: any[]
}

interface SmsStatus {
  balance: { ok: boolean; balance: number | null; raw: string }
  counts: { sent: number; failed: number; skipped: number }
  enabled: boolean
  relayConfigured: boolean
}

export default function DashboardPage() {
  const [data, setData] = useState<Payload | null>(null)
  const [sms, setSms] = useState<SmsStatus | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/hakiki/admin/stats/")
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setData(d)))
      .catch(() => setError("Could not load dashboard"))

    // Separate request: the balance check calls an external gateway and must
    // never hold up the dashboard if it is slow or blocked.
    fetch("/api/hakiki/admin/sms-status/")
      .then((r) => r.json())
      .then((d) => !d.error && setSms(d))
      .catch(() => {})
  }, [])

  if (error) return <div className="p-4 sm:p-6"><Alert tone="danger">{error}</Alert></div>
  if (!data) return <Spinner />

  const s = data.stats
  const peak = Math.max(1, ...data.trend.map((d) => d.genuine + d.suspicious + d.invalid))

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Dashboard"
        subtitle="Live authentication activity across every active batch."
        action={
          <Link href="/verify-admin/batches">
            <Button variant="outline"><Layers className="h-4 w-4" /> Batches</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active units" value={s.activeUnits} hint="Live in the market" />
        <StatCard label="Verifications" value={s.totalVerifications} hint="All channels" />
        <StatCard label="Open alerts" value={s.openAlerts} tone={s.openAlerts > 0 ? "danger" : "success"} hint={s.openAlerts > 0 ? "Need review" : "All clear"} />
        <StatCard label="Suspicious" value={s.suspicious} tone={s.suspicious > 0 ? "warning" : "default"} hint="Likely copied codes" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="First verified" value={s.firstVerified} tone="success" hint="Never seen before" />
        <StatCard label="Repeat" value={s.repeatVerified} hint="Owner re-checking" />
        <StatCard label="Invalid" value={s.invalid} tone={s.invalid > 0 ? "danger" : "default"} hint="Not recognised" />
        <StatCard label="Codes issued" value={s.generatedUnits} hint={`${s.batches} batches`} />
      </div>

      {/* 30 day trend — plain CSS bars; no chart library needed at this size */}
      <Card className="mt-6 p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <SectionTitle>Verifications — last 30 days</SectionTitle>
          <div className="flex gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-[var(--hakiki-success)]" /> Genuine</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-primary" /> Suspicious</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-[var(--hakiki-danger)]" /> Invalid</span>
          </div>
        </div>

        <div className="flex h-36 items-end gap-[3px]">
          {data.trend.map((day) => {
            const total = day.genuine + day.suspicious + day.invalid
            return (
              <div key={day.date} className="group relative flex h-full flex-1 flex-col justify-end"
                title={`${day.date} · ${total} verifications`}>
                {total === 0 ? (
                  <div className="h-[3px] w-full rounded-sm bg-muted" />
                ) : (
                  <div className="w-full overflow-hidden rounded-sm">
                    <div className="w-full bg-[var(--hakiki-danger)]" style={{ height: `${(day.invalid / peak) * 144}px` }} />
                    <div className="w-full bg-primary" style={{ height: `${(day.suspicious / peak) * 144}px` }} />
                    <div className="w-full bg-[var(--hakiki-success)]" style={{ height: `${(day.genuine / peak) * 144}px` }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>{data.trend[0]?.date}</span>
          <span>{data.trend.at(-1)?.date}</span>
        </div>
      </Card>

      {sms && (
        <Card className="mt-3 p-4 sm:p-5">
          <SectionTitle icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}>SMS gateway</SectionTitle>

          {!sms.balance.ok && (
            <div className="mt-3">
              <Alert tone="danger">
                Gateway unreachable: {sms.balance.raw}
                {!sms.relayConfigured && (
                  <span className="mt-1 block font-normal opacity-80">
                    Mobishastra only accepts one whitelisted IP. Set MOBISHASTRA_PROXY_URL to the VPS relay.
                  </span>
                )}
              </Alert>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Credits left", sms.balance.balance?.toLocaleString() ?? "—",
                sms.balance.balance !== null && sms.balance.balance < 1000 ? "text-[var(--hakiki-danger)]" : "text-foreground"],
              ["Sent", sms.counts.sent.toLocaleString(), "text-foreground"],
              ["Failed", sms.counts.failed.toLocaleString(),
                sms.counts.failed > 0 ? "text-[var(--hakiki-danger)]" : "text-foreground"],
              ["Relay", sms.relayConfigured ? "On" : "Off",
                sms.relayConfigured ? "text-[var(--hakiki-success)]" : "text-[var(--hakiki-warning)]"],
            ].map(([label, value, color]) => (
              <div key={label as string}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`num mt-1 text-xl font-semibold tracking-tight ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <SectionTitle>Recent fraud alerts</SectionTitle>
          <Link href="/verify-admin/alerts" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {data.alerts.length === 0 ? (
          <Card className="flex items-center justify-center gap-2 px-5 py-8 text-sm text-[var(--hakiki-success)]">
            <CheckCircle2 className="h-4 w-4" />
            No open fraud alerts. Every verified unit looks legitimate.
          </Card>
        ) : (
          <Card className="divide-y divide-border overflow-hidden">
            {data.alerts.map((alert) => (
              <Link key={alert.id} href="/verify-admin/alerts"
                className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/50">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hakiki-danger)]" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="num text-sm font-medium text-foreground">
                      {alert.auth_units?.serial_number ?? "—"}
                    </span>
                    <Badge tone={STATUS_TONE[alert.severity]}>{alert.severity}</Badge>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{alert.detail}</p>
                </div>
              </Link>
            ))}
          </Card>
        )}
      </section>
    </div>
  )
}

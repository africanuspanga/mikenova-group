"use client"

import { useCallback, useEffect, useState } from "react"
import { Smartphone, QrCode, Globe, RefreshCw } from "lucide-react"
import { PageHeader, Badge, Spinner, EmptyState, Button, Card, inputClass, STATUS_TONE } from "../ui"

const CHANNEL_ICON: Record<string, any> = { SMS: Smartphone, QR_WEB: QrCode, WEB: Globe, ADMIN: Globe }

export default function VerificationsPage() {
  const [events, setEvents] = useState<any[] | null>(null)
  const [result, setResult] = useState("all")
  const [channel, setChannel] = useState("all")

  const load = useCallback(async () => {
    setEvents(null)
    const params = new URLSearchParams({ result, channel })
    const res = await fetch(`/api/hakiki/admin/verifications/?${params}`)
    const json = await res.json()
    setEvents(json.events ?? [])
  }, [result, channel])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Verifications"
        subtitle="Every attempt is logged, including the ones that failed."
        action={<Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>}
      />

      <div className="mb-4 grid gap-2.5 sm:grid-cols-2">
        <select className={inputClass} value={result} onChange={(e) => setResult(e.target.value)}>
          <option value="all">All results</option>
          <option value="genuine">Genuine</option>
          <option value="CHECKED_MANY_TIMES">Code already used</option>
          <option value="SUSPICIOUS_DUPLICATE">Suspicious duplicates</option>
          <option value="invalid">Invalid codes</option>
          <option value="NOT_ACTIVATED">Not activated</option>
          <option value="RATE_LIMITED">Rate limited</option>
        </select>
        <select className={inputClass} value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="all">All channels</option>
          <option value="QR_WEB">QR scan</option>
          <option value="WEB">Web form</option>
          <option value="SMS">SMS</option>
        </select>
      </div>

      {events === null ? (
        <Spinner />
      ) : events.length === 0 ? (
        <EmptyState title="No verifications yet" body="Once labelled products reach customers, every scan and SMS lands here in real time." />
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {events.map((e) => {
            const Icon = CHANNEL_ICON[e.channel] ?? Globe
            return (
              <div key={e.id} className="flex items-start gap-3 p-4">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="num text-sm font-medium text-foreground">
                      {e.auth_units?.serial_number ?? "unknown code"}
                    </span>
                    <Badge tone={STATUS_TONE[e.result]}>{e.result.replace(/_/g, " ")}</Badge>
                    {e.verification_number && <Badge>scan #{e.verification_number}</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[
                      e.batches?.batch_code,
                      e.channel.replace("_", " "),
                      e.phone_last4 ? `•••${e.phone_last4}` : null,
                      e.region,
                    ].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {new Date(e.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </time>
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}

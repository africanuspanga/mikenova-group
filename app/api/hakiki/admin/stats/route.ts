import { requireAdmin } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { handle } from "@/lib/hakiki/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  return handle(async () => {
    const admin = await requireAdmin()
    const db = serviceClient()

    const count = async (table: string, build: (q: any) => any) => {
      const { count } = await build(
        db.from(table).select("*", { count: "exact", head: true }).eq("company_id", admin.companyId),
      )
      return count ?? 0
    }

    const [activeUnits, generatedUnits, totalVerifications, firstVerified, repeatVerified, suspicious, invalid, openAlerts, products, batches] =
      await Promise.all([
        count("auth_units", (q) => q.eq("status", "ACTIVE")),
        count("auth_units", (q) => q),
        count("verification_events", (q) => q),
        count("verification_events", (q) => q.eq("result", "GENUINE_FIRST")),
        // A code is good for one check, so every later check lands in
        // CHECKED_MANY_TIMES. That is a warning to the customer, not yet
        // evidence for the company, so it is counted apart from the codes
        // we can actually show are in several different hands.
        count("verification_events", (q) => q.in("result", ["GENUINE_REPEAT", "CHECKED_MANY_TIMES"])),
        count("verification_events", (q) => q.eq("result", "SUSPICIOUS_DUPLICATE")),
        count("verification_events", (q) => q.in("result", ["INVALID_CODE", "INVALID_SECRET"])),
        count("fraud_alerts", (q) => q.eq("status", "OPEN")),
        count("products", (q) => q),
        count("batches", (q) => q),
      ])

    // 30 day trend, bucketed client-side to keep the query simple.
    const since = new Date(Date.now() - 30 * 864e5).toISOString()
    const { data: recent } = await db
      .from("verification_events")
      .select("created_at, result")
      .eq("company_id", admin.companyId)
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .limit(20000)

    const buckets = new Map<string, { date: string; genuine: number; suspicious: number; invalid: number }>()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10)
      buckets.set(date, { date, genuine: 0, suspicious: 0, invalid: 0 })
    }
    for (const row of recent ?? []) {
      const key = (row.created_at as string).slice(0, 10)
      const bucket = buckets.get(key)
      if (!bucket) continue
      if (row.result === "SUSPICIOUS_DUPLICATE" || row.result === "CHECKED_MANY_TIMES") bucket.suspicious++
      else if (String(row.result).startsWith("GENUINE")) bucket.genuine++
      else if (String(row.result).startsWith("INVALID")) bucket.invalid++
    }

    const { data: alerts } = await db
      .from("fraud_alerts")
      .select("id, alert_type, severity, detail, event_count, created_at, auth_units(serial_number)")
      .eq("company_id", admin.companyId)
      .eq("status", "OPEN")
      .order("created_at", { ascending: false })
      .limit(6)

    return {
      stats: {
        activeUnits, generatedUnits, totalVerifications, firstVerified,
        repeatVerified, suspicious, invalid, openAlerts, products, batches,
      },
      trend: [...buckets.values()],
      alerts: alerts ?? [],
    }
  })
}

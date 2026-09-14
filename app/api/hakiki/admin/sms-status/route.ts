import { requireAdmin } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { checkSmsBalance } from "@/lib/hakiki/sms"
import { handle } from "@/lib/hakiki/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  return handle(async () => {
    const admin = await requireAdmin()
    const db = serviceClient()

    const tally = async (status: string) => {
      const { count } = await db
        .from("sms_events").select("*", { count: "exact", head: true })
        .eq("direction", "OUTBOUND").eq("status", status)
      return count ?? 0
    }

    const [balance, sent, failed, skipped, recent] = await Promise.all([
      checkSmsBalance(),
      tally("SENT"),
      tally("FAILED"),
      tally("SKIPPED"),
      db.from("sms_events")
        .select("created_at, direction, phone_last4, status, error, provider_response")
        .order("created_at", { ascending: false }).limit(20),
    ])

    return {
      balance,
      counts: { sent, failed, skipped },
      enabled: process.env.HAKIKI_SMS_ENABLED !== "false",
      relayConfigured: Boolean(process.env.MOBISHASTRA_PROXY_URL),
      recent: recent.data ?? [],
      role: admin.role,
    }
  })
}

import { requireAdmin } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { handle } from "@/lib/hakiki/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  return handle(async () => {
    const admin = await requireAdmin()
    const url = new URL(request.url)
    const result = url.searchParams.get("result")
    const channel = url.searchParams.get("channel")

    let query = serviceClient()
      .from("verification_events")
      .select("id, created_at, channel, result, phone_last4, region, verification_number, auth_units(serial_number), batches(batch_code)")
      .eq("company_id", admin.companyId)

    if (result && result !== "all") {
      if (result === "genuine") query = query.in("result", ["GENUINE_FIRST", "GENUINE_REPEAT"])
      else if (result === "invalid") query = query.in("result", ["INVALID_CODE", "INVALID_SECRET"])
      else query = query.eq("result", result)
    }
    if (channel && channel !== "all") query = query.eq("channel", channel)

    const { data, error } = await query.order("created_at", { ascending: false }).limit(150)
    if (error) throw new Error(error.message)
    return { events: data ?? [] }
  })
}

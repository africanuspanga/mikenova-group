import { requireAdmin } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { handle } from "@/lib/hakiki/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  return handle(async () => {
    const admin = await requireAdmin()
    const status = new URL(request.url).searchParams.get("status") ?? "OPEN"

    let query = serviceClient()
      .from("fraud_alerts")
      .select("*, auth_units(serial_number, verification_count, distinct_verifiers), batches(batch_code), products:auth_units(product_id)")
      .eq("company_id", admin.companyId)
    if (status !== "all") query = query.eq("status", status)

    const { data, error } = await query
      .order("severity", { ascending: true })
      .order("updated_at", { ascending: false })
      .limit(150)
    if (error) throw new Error(error.message)
    return { alerts: data ?? [] }
  })
}

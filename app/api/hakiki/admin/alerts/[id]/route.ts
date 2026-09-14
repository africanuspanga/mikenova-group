import { requireWriter, audit } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { handle } from "@/lib/hakiki/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const admin = await requireWriter()
    const { id } = await ctx.params
    const { status } = await request.json()

    if (!["OPEN", "INVESTIGATING", "RESOLVED", "DISMISSED"].includes(status)) {
      throw new Error("Invalid status")
    }

    const { data, error } = await serviceClient()
      .from("fraud_alerts")
      .update({
        status,
        updated_at: new Date().toISOString(),
        resolved_at: ["RESOLVED", "DISMISSED"].includes(status) ? new Date().toISOString() : null,
        resolved_by: ["RESOLVED", "DISMISSED"].includes(status) ? admin.userId : null,
      })
      .eq("id", id).eq("company_id", admin.companyId)
      .select().single()
    if (error) throw new Error(error.message)

    await audit({ admin, action: `ALERT_${status}`, entityType: "fraud_alert", entityId: id })
    return { alert: data }
  })
}

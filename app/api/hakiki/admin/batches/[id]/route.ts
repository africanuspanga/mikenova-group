import { requireAdmin } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { handle } from "@/lib/hakiki/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const admin = await requireAdmin()
    const { id } = await ctx.params
    const db = serviceClient()

    const { data: batch, error } = await db
      .from("batches").select("*, products(name, sku, size, image_url)")
      .eq("id", id).eq("company_id", admin.companyId).single()
    if (error) throw new Error("Batch not found")

    const tally = async (build: (q: any) => any) => {
      const { count } = await build(
        db.from("auth_units").select("*", { count: "exact", head: true }).eq("batch_id", id),
      )
      return count ?? 0
    }

    const [active, generated, voided, revoked, verified, suspicious, alerts] = await Promise.all([
      tally((q) => q.eq("status", "ACTIVE")),
      tally((q) => q.eq("status", "GENERATED")),
      tally((q) => q.eq("status", "VOIDED")),
      tally((q) => q.in("status", ["REVOKED", "RECALLED"])),
      tally((q) => q.gt("verification_count", 0)),
      tally((q) => q.gte("distinct_verifiers", 3)),
      db.from("fraud_alerts").select("*", { count: "exact", head: true }).eq("batch_id", id).eq("status", "OPEN"),
    ])

    const { data: labelJobs } = await db
      .from("label_jobs").select("*").eq("batch_id", id).order("generated_at", { ascending: false })

    return {
      batch,
      counts: { active, generated, voided, revoked, verified, suspicious, openAlerts: alerts.count ?? 0 },
      labelJobs: labelJobs ?? [],
    }
  })
}

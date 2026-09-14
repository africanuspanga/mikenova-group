import { requireWriter, audit } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { handle } from "@/lib/hakiki/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const admin = await requireWriter()
    const { id } = await ctx.params
    const { action } = await request.json()
    const db = serviceClient()

    const { data: batch, error } = await db
      .from("batches").select("*").eq("id", id).eq("company_id", admin.companyId).single()
    if (error || !batch) throw new Error("Batch not found")

    switch (action) {
      case "void_remaining": {
        const { data, error: rpcError } = await db.rpc("hakiki_void_remaining", { p_batch_id: id })
        if (rpcError) throw new Error(rpcError.message)
        await audit({ admin, action: "CODES_VOIDED", entityType: "batch", entityId: id, detail: { voided: data } })
        return { voided: data ?? 0 }
      }
      case "mark_printing":
      case "mark_labelled": {
        const status = action === "mark_printing" ? "PRINTING" : "LABELLED"
        await db.from("batches").update({ status }).eq("id", id)
        await audit({ admin, action: `BATCH_${status}`, entityType: "batch", entityId: id })
        return { status }
      }
      case "close": {
        await db.from("batches").update({ status: "CLOSED", closed_at: new Date().toISOString() }).eq("id", id)
        await audit({ admin, action: "BATCH_CLOSED", entityType: "batch", entityId: id })
        return { status: "CLOSED" }
      }
      case "recall": {
        if (admin.role !== "ADMIN") throw new Error("Only an ADMIN can recall a batch")
        const { data, error: rpcError } = await db.rpc("hakiki_recall_batch", { p_batch_id: id })
        if (rpcError) throw new Error(rpcError.message)
        await audit({
          admin, action: "BATCH_RECALLED", entityType: "batch", entityId: id,
          detail: { batch_code: batch.batch_code, units: data },
        })
        return { status: "RECALLED", units: data ?? 0 }
      }
      default:
        throw new Error("Unknown action")
    }
  })
}

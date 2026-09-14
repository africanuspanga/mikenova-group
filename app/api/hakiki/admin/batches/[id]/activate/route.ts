import { requireWriter, audit } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { handle } from "@/lib/hakiki/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

/**
 * Reconciliation, not a formality.
 *
 * 50,000 labels were printed; maybe 49,873 actually reached a bottle. Only
 * the ones someone confirms get to answer "genuine". The remainder stay inert
 * so a stolen label roll is worthless.
 */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const admin = await requireWriter()
    const { id } = await ctx.params
    const body = await request.json()
    const db = serviceClient()

    const { data: batch, error } = await db
      .from("batches").select("*").eq("id", id).eq("company_id", admin.companyId).single()
    if (error || !batch) throw new Error("Batch not found")
    if (batch.generated_quantity === 0) throw new Error("Generate the authentication codes first")
    if (batch.status === "RECALLED") throw new Error("This batch has been recalled")

    let activated = 0

    if (body.mode === "serials") {
      const serials: string[] = String(body.serials ?? "")
        .split(/[\s,;]+/).map((s) => s.trim().toUpperCase()).filter(Boolean)
      if (serials.length === 0) throw new Error("No serial numbers provided")

      const { data, error: rpcError } = await db.rpc("hakiki_activate_serials", {
        p_batch_id: id, p_serials: serials,
      })
      if (rpcError) throw new Error(rpcError.message)
      activated = data ?? 0

      if (activated < serials.length) {
        await audit({
          admin, action: "ACTIVATION_PARTIAL", entityType: "batch", entityId: id,
          detail: { requested: serials.length, activated },
        })
      }
    } else {
      const quantity = Number(body.quantity)
      if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Enter how many labels were applied")
      if (quantity > batch.generated_quantity - batch.activated_quantity) {
        throw new Error(`Only ${batch.generated_quantity - batch.activated_quantity} unactivated codes remain in this batch`)
      }

      const { data, error: rpcError } = await db.rpc("hakiki_activate_batch", {
        p_batch_id: id, p_quantity: quantity,
      })
      if (rpcError) throw new Error(rpcError.message)
      activated = data ?? 0
    }

    await audit({
      admin, action: "BATCH_ACTIVATED", entityType: "batch", entityId: id,
      detail: { batch_code: batch.batch_code, activated, mode: body.mode ?? "count" },
    })

    return { activated }
  })
}

import { requireWriter, audit } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { handle } from "@/lib/hakiki/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const admin = await requireWriter()
    const { id } = await ctx.params
    const body = await request.json()

    const patch: Record<string, unknown> = {}
    for (const field of ["name", "size", "description", "image_url"]) {
      if (field in body) patch[field] = body[field]?.trim?.() || null
    }
    if ("is_active" in body) patch.is_active = Boolean(body.is_active)

    const { data, error } = await serviceClient()
      .from("products").update(patch)
      .eq("id", id).eq("company_id", admin.companyId)
      .select().single()
    if (error) throw new Error(error.message)

    await audit({ admin, action: "PRODUCT_UPDATED", entityType: "product", entityId: id, detail: patch })
    return { product: data }
  })
}

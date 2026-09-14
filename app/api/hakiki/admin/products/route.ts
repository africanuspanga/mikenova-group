import { requireAdmin, requireWriter, audit } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { handle } from "@/lib/hakiki/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  return handle(async () => {
    const admin = await requireAdmin()
    const { data, error } = await serviceClient()
      .from("products")
      .select("*, batches(count)")
      .eq("company_id", admin.companyId)
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return { products: data ?? [] }
  })
}

export async function POST(request: Request) {
  return handle(async () => {
    const admin = await requireWriter()
    const body = await request.json()
    if (!body.name?.trim() || !body.sku?.trim()) throw new Error("Name and SKU are required")

    const { data, error } = await serviceClient()
      .from("products")
      .insert({
        company_id: admin.companyId,
        name: body.name.trim(),
        sku: body.sku.trim().toUpperCase(),
        size: body.size?.trim() || null,
        description: body.description?.trim() || null,
        image_url: body.image_url?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.code === "23505" ? `SKU "${body.sku}" already exists` : error.message)
    }
    await audit({ admin, action: "PRODUCT_CREATED", entityType: "product", entityId: data.id, detail: { sku: data.sku } })
    return { product: data }
  })
}

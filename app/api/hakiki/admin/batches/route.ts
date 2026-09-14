import { requireAdmin, requireWriter, audit } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { handle } from "@/lib/hakiki/api"
import { DEFAULT_CODE_LENGTH } from "@/lib/hakiki/codes"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  return handle(async () => {
    const admin = await requireAdmin()
    const { data, error } = await serviceClient()
      .from("batches")
      .select("*, products(name, sku, size)")
      .eq("company_id", admin.companyId)
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return { batches: data ?? [] }
  })
}

export async function POST(request: Request) {
  return handle(async () => {
    const admin = await requireWriter()
    const body = await request.json()

    if (!body.product_id) throw new Error("Choose a product")
    if (!body.batch_code?.trim()) throw new Error("Batch code is required")

    const quantity = Number(body.planned_quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500_000) {
      throw new Error("Quantity must be between 1 and 500,000")
    }
    const codeLength = Number(body.code_length ?? DEFAULT_CODE_LENGTH)
    if (!Number.isInteger(codeLength) || codeLength < 6 || codeLength > 14) {
      throw new Error("Code length must be between 6 and 14 digits")
    }

    const { data, error } = await serviceClient()
      .from("batches")
      .insert({
        company_id: admin.companyId,
        product_id: body.product_id,
        batch_code: body.batch_code.trim().toUpperCase(),
        planned_quantity: quantity,
        code_length: codeLength,
        manufactured_at: body.manufactured_at || null,
        expires_at: body.expires_at || null,
        notes: body.notes?.trim() || null,
        created_by: admin.userId,
      })
      .select("*, products(name, sku, size)")
      .single()

    if (error) {
      throw new Error(error.code === "23505" ? `Batch code "${body.batch_code}" already exists` : error.message)
    }
    await audit({
      admin, action: "BATCH_CREATED", entityType: "batch", entityId: data.id,
      detail: { batch_code: data.batch_code, quantity, codeLength },
    })
    return { batch: data }
  })
}

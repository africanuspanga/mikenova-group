import { requireAdmin } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { handle } from "@/lib/hakiki/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const admin = await requireAdmin()
    const { id } = await ctx.params
    const url = new URL(request.url)
    const filter = url.searchParams.get("filter") ?? "all"
    const search = url.searchParams.get("q")?.trim()

    let query = serviceClient()
      .from("auth_units")
      // Note the columns absent here: no hmac, no ciphertext. The console
      // never needs a scratch code and so is never given one.
      .select("id, serial_number, public_token, status, verification_count, distinct_verifiers, failed_attempt_count, first_verified_at, last_verified_at")
      .eq("batch_id", id).eq("company_id", admin.companyId)

    if (filter === "suspicious") query = query.gte("distinct_verifiers", 3)
    else if (filter === "verified") query = query.gt("verification_count", 0)
    else if (filter !== "all") query = query.eq("status", filter.toUpperCase())
    if (search) query = query.ilike("serial_number", `%${search}%`)

    const { data, error } = await query
      .order("distinct_verifiers", { ascending: false })
      .order("serial_number")
      .limit(100)
    if (error) throw new Error(error.message)
    return { units: data ?? [] }
  })
}

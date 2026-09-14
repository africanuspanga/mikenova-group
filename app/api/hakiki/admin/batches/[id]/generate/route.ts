import { requireWriter, audit } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { handle } from "@/lib/hakiki/api"
import { generateSerial, generatePublicToken, generateScratchCode } from "@/lib/hakiki/codes"
import { hmacCode, encryptCode } from "@/lib/hakiki/crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

const CHUNK = 2500

/**
 * Generates authentication identities for a batch, one chunk per call.
 *
 * Chunked on purpose: 50,000 units is a lot of rows, and driving it from the
 * client means the operator watches a real progress bar instead of staring at
 * a request that might silently time out.
 */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const admin = await requireWriter()
    const { id } = await ctx.params
    const db = serviceClient()

    const { data: batch, error } = await db
      .from("batches").select("*").eq("id", id).eq("company_id", admin.companyId).single()
    if (error || !batch) throw new Error("Batch not found")

    if (!["DRAFT", "CODES_GENERATED"].includes(batch.status)) {
      throw new Error(`Cannot generate codes for a batch in ${batch.status} state`)
    }

    const remaining = batch.planned_quantity - batch.generated_quantity
    if (remaining <= 0) {
      return { done: true, generated: batch.generated_quantity, total: batch.planned_quantity }
    }

    const size = Math.min(remaining, CHUNK)

    // Every unique index (serial, public_token, secret hmac) can collide.
    // At 50k units in a 10-digit keyspace a birthday collision is a roughly
    // 1-in-7 event across the whole batch, so this retry is load-bearing,
    // not paranoia. Regenerating the chunk is cheap; a silent duplicate
    // secret would mean two bottles sharing one identity.
    let inserted = 0
    for (let attempt = 0; attempt < 6 && inserted === 0; attempt++) {
      const rows = Array.from({ length: size }, () => {
        const code = generateScratchCode(batch.code_length)
        return {
          company_id: batch.company_id,
          product_id: batch.product_id,
          batch_id: batch.id,
          serial_number: generateSerial(),
          public_token: generatePublicToken(),
          secret_code_hmac: hmacCode(code),
          secret_code_encrypted: encryptCode(code),
          status: "GENERATED",
        }
      })

      const { error: insertError } = await db.from("auth_units").insert(rows)
      if (!insertError) {
        inserted = size
        break
      }
      if (insertError.code !== "23505") throw new Error(insertError.message)
      console.warn(`[HAKIKI] identity collision on batch ${batch.batch_code}, regenerating chunk (attempt ${attempt + 1})`)
    }

    if (inserted === 0) throw new Error("Could not generate unique identities after several attempts")

    const generated = batch.generated_quantity + inserted
    const done = generated >= batch.planned_quantity

    await db.from("batches").update({
      generated_quantity: generated,
      status: done ? "CODES_GENERATED" : batch.status,
    }).eq("id", batch.id)

    if (done) {
      await audit({
        admin, action: "CODES_GENERATED", entityType: "batch", entityId: batch.id,
        detail: { batch_code: batch.batch_code, quantity: generated, code_length: batch.code_length },
      })
    }

    return { done, generated, total: batch.planned_quantity, chunk: inserted }
  })
}

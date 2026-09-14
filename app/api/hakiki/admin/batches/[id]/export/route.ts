import crypto from "node:crypto"
import { requireAdmin, audit, UnauthorizedError, type AdminContext } from "@/lib/hakiki/auth"
import { serviceClient } from "@/lib/hakiki/supabase"
import { decryptCode } from "@/lib/hakiki/crypto"
import { formatScratchCode } from "@/lib/hakiki/codes"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

const PAGE = 1000

/**
 * The variable-data print file.
 *
 * This is the single most sensitive artefact HAKIKI produces — it contains
 * every scratch code for the batch in plain text. Whoever holds it can
 * manufacture perfect labels. Hence: ADMIN role only, always audited, hashed
 * so a later reprint request can be compared against what was issued, and
 * streamed so a 50,000 row file never has to sit in function memory.
 */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  let admin: AdminContext
  try {
    admin = await requireAdmin()
  } catch (err) {
    if (err instanceof UnauthorizedError) return NextResponse.json({ error: "Not authorised" }, { status: 401 })
    throw err
  }
  if (admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Only an ADMIN can download the print file" }, { status: 403 })
  }

  const db = serviceClient()
  const { data: batch, error } = await db
    .from("batches").select("*, products(name, sku, size)")
    .eq("id", id).eq("company_id", admin.companyId).single()
  if (error || !batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 })
  if (batch.generated_quantity === 0) {
    return NextResponse.json({ error: "No codes have been generated for this batch" }, { status: 400 })
  }

  const base = process.env.NEXT_PUBLIC_HAKIKI_BASE_URL ?? "https://www.mikenovagroup.co.tz"
  const product = (batch as any).products
  const hash = crypto.createHash("sha256")
  let rowCount = 0

  const stream = new ReadableStream({
    async start(controller) {
      const write = (line: string) => {
        hash.update(line)
        controller.enqueue(new TextEncoder().encode(line))
      }

      write("serial_number,qr_url,scratch_code,scratch_code_formatted,batch_code,product_name,product_size\n")

      try {
        for (let offset = 0; ; offset += PAGE) {
          const { data: units, error: pageError } = await db
            .from("auth_units")
            .select("serial_number, public_token, secret_code_encrypted")
            .eq("batch_id", id)
            .order("serial_number")
            .range(offset, offset + PAGE - 1)

          if (pageError) throw new Error(pageError.message)
          if (!units || units.length === 0) break

          for (const unit of units) {
            const code = unit.secret_code_encrypted ? decryptCode(unit.secret_code_encrypted) : ""
            write(
              [
                unit.serial_number,
                `${base}/verify/${unit.public_token}`,
                code,
                formatScratchCode(code),
                batch.batch_code,
                `"${String(product?.name ?? "").replace(/"/g, '""')}"`,
                product?.size ?? "",
              ].join(",") + "\n",
            )
            rowCount++
          }

          if (units.length < PAGE) break
        }

        const digest = hash.digest("hex")
        await db.from("label_jobs").insert({
          company_id: batch.company_id,
          batch_id: batch.id,
          quantity: rowCount,
          file_hash: digest,
          storage_path: null,
          generated_by: admin.userId,
          downloaded_at: new Date().toISOString(),
          status: "DOWNLOADED",
        })
        await audit({
          admin, action: "PRINT_FILE_EXPORTED", entityType: "batch", entityId: batch.id,
          detail: { batch_code: batch.batch_code, rows: rowCount, file_hash: digest },
        })

        controller.close()
      } catch (err) {
        console.error("[HAKIKI] export failed", err)
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="HAKIKI-${batch.batch_code}-print-file.csv"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  })
}

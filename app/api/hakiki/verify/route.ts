import { NextResponse } from "next/server"
import { verifyUnit, clientIp } from "@/lib/hakiki/verify"
import { isValidTzPhone } from "@/lib/hakiki/crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Public verification endpoint.
 *
 * The browser never touches auth_units. It posts a token and a code here and
 * receives a sanitised verdict — no database ids, no hashes, no neighbouring
 * serials it could enumerate.
 */
export async function POST(request: Request) {
  let body: {
    code?: string
    publicToken?: string | null
    phone?: string | null
    notifyBySms?: boolean
    region?: string | null
    latitude?: number | null
    longitude?: number | null
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const code = (body.code ?? "").replace(/\D/g, "")
  if (code.length < 6 || code.length > 14) {
    return NextResponse.json({ error: "Tafadhali weka code sahihi / Please enter a valid code" }, { status: 400 })
  }

  const phone = body.phone?.trim() || null
  if (phone && !isValidTzPhone(phone)) {
    return NextResponse.json(
      { error: "Namba ya simu si sahihi / Please enter a valid Tanzanian phone number" },
      { status: 400 },
    )
  }

  try {
    const result = await verifyUnit({
      code,
      publicToken: body.publicToken ?? null,
      channel: body.publicToken ? "QR_WEB" : "WEB",
      phone,
      ip: clientIp(request.headers),
      userAgent: request.headers.get("user-agent"),
      region: body.region ?? null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      notifyBySms: Boolean(body.notifyBySms && phone),
    })

    // Only ever return what the customer is entitled to see.
    return NextResponse.json({
      result: result.result,
      verdict: result.verdict,
      copy: result.copy,
      serial: result.serial ?? null,
      product: result.product ?? null,
      productSize: result.product_size ?? null,
      productImage: result.product_image ?? null,
      company: result.company ?? null,
      batchCode: result.batch_code ?? null,
      verificationNumber: result.verification_number ?? null,
      distinctVerifiers: result.distinct_verifiers ?? null,
      isExpired: result.is_expired ?? false,
      supportPhone: result.support_phone ?? process.env.NEXT_PUBLIC_HAKIKI_SUPPORT_PHONE ?? null,
      smsSent: result.smsSent,
    })
  } catch (err) {
    console.error("[HAKIKI] verify route failed", err)
    return NextResponse.json({ error: "Samahani, tumeshindwa kuthibitisha. Jaribu tena." }, { status: 500 })
  }
}

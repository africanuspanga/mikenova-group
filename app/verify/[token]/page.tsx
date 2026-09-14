import { notFound } from "next/navigation"
import { getUnitPublicInfo } from "@/lib/hakiki/queries"
import { VerifyClient } from "../verify-client"

export const dynamic = "force-dynamic"

/**
 * The QR landing page.
 *
 * Scanning gets the customer here and no further. The page names the product
 * the label CLAIMS to be, then asks for the scratch code. Nothing on this
 * screen asserts the product is genuine, because nothing yet has proved it.
 */
export default async function VerifyTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const unit = await getUnitPublicInfo(token)
  if (!unit) notFound()
  return <VerifyClient unit={unit} />
}

import { serviceClient } from "./supabase"

export interface UnitPublicInfo {
  publicToken: string
  serial: string
  productName: string
  productSize: string | null
  productImage: string | null
  companyName: string
  supportPhone: string | null
  codeLength: number
}

/**
 * What a QR scan is allowed to reveal BEFORE the scratch code is entered.
 *
 * Deliberately thin. Scanning the QR proves nothing — it only says
 * "I claim to be this product". Status, verification history and anything
 * resembling a secret stay out of this payload, because the QR is printed
 * on the outside of the box where anyone can photograph it.
 */
export async function getUnitPublicInfo(token: string): Promise<UnitPublicInfo | null> {
  const { data, error } = await serviceClient()
    .from("auth_units")
    .select("public_token, serial_number, batches(code_length), products(name, size, image_url), companies(name, support_phone)")
    .eq("public_token", token)
    .maybeSingle()

  if (error || !data) return null

  const product = data.products as any
  const company = data.companies as any
  const batch = data.batches as any

  return {
    publicToken: data.public_token,
    serial: data.serial_number,
    productName: product?.name ?? "Product",
    productSize: product?.size ?? null,
    productImage: product?.image_url ?? null,
    companyName: company?.name ?? "",
    supportPhone: company?.support_phone ?? null,
    codeLength: batch?.code_length ?? 10,
  }
}

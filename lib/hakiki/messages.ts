export type VerificationResult =
  | "GENUINE_FIRST"
  | "GENUINE_REPEAT"
  | "SUSPICIOUS_DUPLICATE"
  | "INVALID_CODE"
  | "INVALID_SECRET"
  | "NOT_ACTIVATED"
  | "VOIDED"
  | "REVOKED"
  | "RECALLED"
  | "RATE_LIMITED"

export type Verdict = "GENUINE" | "WARNING" | "INVALID"

export interface EngineResult {
  result: VerificationResult
  serial?: string
  product?: string
  product_size?: string
  product_image?: string
  company?: string
  support_phone?: string
  batch_code?: string
  verification_number?: number
  distinct_verifiers?: number
  first_verified_at?: string
  is_expired?: boolean
  expires_at?: string
  failed_attempts?: number
  severity?: string
}

export const VERDICT: Record<VerificationResult, Verdict> = {
  GENUINE_FIRST: "GENUINE",
  GENUINE_REPEAT: "GENUINE",
  SUSPICIOUS_DUPLICATE: "WARNING",
  NOT_ACTIVATED: "WARNING",
  RECALLED: "WARNING",
  VOIDED: "INVALID",
  REVOKED: "INVALID",
  INVALID_CODE: "INVALID",
  INVALID_SECRET: "INVALID",
  RATE_LIMITED: "WARNING",
}

/**
 * SMS copy is deliberately plain ASCII.
 *
 * A single tick or warning triangle pushes the whole message out of GSM-7
 * into UCS-2, which cuts the per-segment limit from 160 characters to 70 and
 * doubles the send cost. On a 50,000 unit pilot that is a real bill, so the
 * symbols live on the web screen and the SMS stays text.
 */
export function smsBody(r: EngineResult, supportPhone: string): string {
  const product = [r.product, r.product_size].filter(Boolean).join(" ")
  const batch = r.batch_code ? ` Batch ${r.batch_code}.` : ""

  switch (r.result) {
    case "GENUINE_FIRST":
      return `HAKIKI: HALISI. ${product}.${batch} Hii ni mara ya KWANZA code hii kuthibitishwa. Asante kwa kuhakiki bidhaa yako.`

    case "GENUINE_REPEAT":
      return `HAKIKI: HALISI. ${product}.${batch} Umehakiki bidhaa hii mara ${r.verification_number}. Kila kitu ni sawa.`

    case "SUSPICIOUS_DUPLICATE":
      return `HAKIKI: TAHADHARI. Code hii ni halali lakini imeshathibitishwa mara ${r.verification_number} na watu ${r.distinct_verifiers} tofauti. Inawezekana imenakiliwa. USITUMIE. Piga ${supportPhone}`

    case "NOT_ACTIVATED":
      return `HAKIKI: TAHADHARI. Code ipo kwenye mfumo lakini bidhaa hii HAIJAIDHINISHWA kwa mauzo. Usitumie. Piga ${supportPhone}`

    case "RECALLED":
      return `HAKIKI: ONYO. Bidhaa hii imeondolewa sokoni. USITUMIE. Wasiliana na ${r.company ?? "mtengenezaji"}: ${supportPhone}`

    case "REVOKED":
    case "VOIDED":
      return `HAKIKI: ONYO. Code hii imefutwa na haitumiki. Bidhaa inaweza kuwa BANDIA. Usitumie. Piga ${supportPhone}`

    case "INVALID_SECRET":
      return `HAKIKI: Code uliyoweka hailingani na lebo hii. Hakikisha umeandika tarakimu vizuri na ujaribu tena.`

    case "RATE_LIMITED":
      return `HAKIKI: Umejaribu mara nyingi mfululizo. Tafadhali subiri dakika chache kisha ujaribu tena.`

    case "INVALID_CODE":
    default:
      return `HAKIKI: Code hii HAIJATAMBULIKA. Hakikisha umeandika tarakimu vizuri. Ikiwa ni sahihi, bidhaa inaweza kuwa BANDIA. Usitumie. Piga ${supportPhone}`
  }
}

/** Rich bilingual copy for the web result screen. */
export function webCopy(r: EngineResult): {
  verdict: Verdict
  titleSw: string
  titleEn: string
  bodySw: string
  bodyEn: string
} {
  switch (r.result) {
    case "GENUINE_FIRST":
      return {
        verdict: "GENUINE",
        titleSw: "HALISI",
        titleEn: "Genuine product",
        bodySw: "Hii ni mara ya kwanza code hii kuthibitishwa. Bidhaa yako ni halisi.",
        bodyEn: "This is the first time this code has ever been verified. Your product is authentic.",
      }
    case "GENUINE_REPEAT":
      return {
        verdict: "GENUINE",
        titleSw: "HALISI",
        titleEn: "Genuine product",
        bodySw: `Bidhaa hii ni halisi. Umeihakiki mara ${r.verification_number}.`,
        bodyEn: `This product is authentic. You have checked it ${r.verification_number} times.`,
      }
    case "SUSPICIOUS_DUPLICATE":
      return {
        verdict: "WARNING",
        titleSw: "TAHADHARI",
        titleEn: "Warning — code may be copied",
        bodySw: `Code hii ni halali, lakini imeshathibitishwa mara ${r.verification_number} na watu ${r.distinct_verifiers} tofauti. Inawezekana imenakiliwa kwenye bidhaa bandia. Usitumie kama una mashaka.`,
        bodyEn: `This code is valid, but it has been verified ${r.verification_number} times by ${r.distinct_verifiers} different people. It has likely been copied onto counterfeit products. Do not use the product if you have any doubt.`,
      }
    case "NOT_ACTIVATED":
      return {
        verdict: "WARNING",
        titleSw: "TAHADHARI",
        titleEn: "Not approved for sale",
        bodySw: "Code ipo kwenye mfumo wa HAKIKI, lakini bidhaa hii haijaidhinishwa kwa mauzo. Tafadhali wasiliana na mtengenezaji.",
        bodyEn: "This code exists in HAKIKI, but this product was never approved for sale. Please contact the manufacturer.",
      }
    case "RECALLED":
      return {
        verdict: "WARNING",
        titleSw: "IMEONDOLEWA SOKONI",
        titleEn: "Product recalled",
        bodySw: "Bidhaa hii imeondolewa sokoni na mtengenezaji. Usitumie.",
        bodyEn: "This product has been recalled by the manufacturer. Do not use it.",
      }
    case "REVOKED":
    case "VOIDED":
      return {
        verdict: "INVALID",
        titleSw: "CODE IMEFUTWA",
        titleEn: "Code revoked",
        bodySw: "Code hii ilifutwa na haitumiki tena. Bidhaa inaweza kuwa bandia.",
        bodyEn: "This code was cancelled and is no longer valid. The product may be counterfeit.",
      }
    case "INVALID_SECRET":
      return {
        verdict: "INVALID",
        titleSw: "CODE HAILINGANI",
        titleEn: "Code does not match this label",
        bodySw: "Code uliyoweka hailingani na lebo uliyoscan. Hakikisha umeandika tarakimu vizuri.",
        bodyEn: "The code you entered does not belong to the label you scanned. Please check the digits and try again.",
      }
    case "RATE_LIMITED":
      return {
        verdict: "WARNING",
        titleSw: "SUBIRI KIDOGO",
        titleEn: "Too many attempts",
        bodySw: "Umejaribu mara nyingi mfululizo. Tafadhali subiri dakika chache kisha ujaribu tena.",
        bodyEn: "Too many attempts in a short time. Please wait a few minutes and try again.",
      }
    case "INVALID_CODE":
    default:
      // Never say "FAKE" outright — the customer may simply have mistyped,
      // and accusing a genuine buyer of holding a counterfeit is its own harm.
      return {
        verdict: "INVALID",
        titleSw: "CODE HAITAMBULIKI",
        titleEn: "Code not recognised",
        bodySw: "HAKIKI haijatambua code hii. Hakikisha umeandika tarakimu vizuri. Ikiwa code ni sahihi, bidhaa inaweza kuwa bandia — usitumie hadi uthibitishe na mtengenezaji.",
        bodyEn: "HAKIKI does not recognise this code. Please check the digits carefully. If the code is correct, the product may be counterfeit — do not use it until you confirm with the manufacturer.",
      }
  }
}

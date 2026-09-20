export type VerificationResult =
  | "GENUINE_FIRST"
  | "GENUINE_REPEAT"
  | "CHECKED_MANY_TIMES"
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
  /**
   * The engine recognised this call as a repeat of one it had already
   * answered (a retried SMS gateway callback) and counted nothing.
   */
  deduplicated?: boolean
}

export const VERDICT: Record<VerificationResult, Verdict> = {
  GENUINE_FIRST: "GENUINE",
  GENUINE_REPEAT: "GENUINE",
  CHECKED_MANY_TIMES: "WARNING",
  SUSPICIOUS_DUPLICATE: "WARNING",
  NOT_ACTIVATED: "WARNING",
  RECALLED: "WARNING",
  VOIDED: "INVALID",
  REVOKED: "INVALID",
  INVALID_CODE: "INVALID",
  INVALID_SECRET: "INVALID",
  RATE_LIMITED: "WARNING",
}

/** One GSM-7 segment is 160 characters; HAKIKI ships well inside that. */
export const SMS_MAX_CHARS = 150

/**
 * SMS copy is deliberately plain ASCII.
 *
 * A single tick or warning triangle pushes the whole message out of GSM-7
 * into UCS-2, which cuts the per-segment limit from 160 characters to 70 and
 * doubles the send cost. On a 50,000 unit pilot that is a real bill, so the
 * symbols live on the web screen and the SMS stays text.
 */
function plain(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Compose to a fixed budget.
 *
 * `head` is the part a customer must receive: verdict, product, and for a
 * warning the instruction and the phone number. Everything after it is detail
 * that earns its place only if the message still fits, so an unusually long
 * product name costs a reference line rather than a second segment.
 */
function fit(head: string, ...extras: string[]): string {
  let out = plain(head)
  for (const extra of extras) {
    const part = plain(extra)
    if (part && out.length + 1 + part.length <= SMS_MAX_CHARS) out += " " + part
  }
  return out.length <= SMS_MAX_CHARS ? out : out.slice(0, SMS_MAX_CHARS).trimEnd()
}

/** Product name plus size, clipped at a word boundary so it cannot blow the budget. */
function productName(r: EngineResult, limit = 38): string {
  const full = plain([r.product, r.product_size].filter(Boolean).join(" "))
  if (!full) return "Bidhaa hii"
  if (full.length <= limit) return full
  const cut = full.slice(0, limit)
  const space = cut.lastIndexOf(" ")
  return space > 12 ? cut.slice(0, space) : cut
}

/**
 * The receipt.
 *
 * This message is the only part of HAKIKI a customer keeps, and it may be
 * shown to a shopkeeper as proof, so it reads like an official notice: who is
 * speaking, which product, the verdict, a reference number, and for anything
 * short of genuine, one instruction and one number to call.
 */
export function smsBody(r: EngineResult, supportPhone: string): string {
  const product = productName(r)
  // After a preposition ("code ya ...", "lebo ya ...") a capitalised fallback
  // reads like a proper noun, so the genitive form stays lower case.
  const productRef = r.product ? product : "bidhaa hii"
  const ref = r.serial ? `Kumb: ${r.serial}.` : ""
  const issuer = r.company ? `Imesajiliwa na ${r.company}.` : ""
  const times = r.verification_number
  const people = r.distinct_verifiers

  switch (r.result) {
    case "GENUINE_FIRST":
      return fit(
        `HAKIKI: ${product} ni HALISI.`,
        ref,
        "Hii ni mara ya kwanza. Code hii hutumika mara moja tu.",
        issuer,
      )

    case "GENUINE_REPEAT":
      return fit(
        `HAKIKI: ${product} ni HALISI.`,
        ref,
        times ? `Code hii imethibitishwa mara ${times}.` : "",
        issuer,
      )

    // A code is revealed from under scratch foil once, so the person who
    // checks it first is the buyer. Everyone after them is holding either
    // the same bottle or a copy, and the copy is what we are looking for.
    case "CHECKED_MANY_TIMES":
      return fit(
        `HAKIKI: TAHADHARI. ${product}: code hii imeshathibitishwa mara ${times}. Bidhaa huenda si halisi. Piga ${supportPhone}.`,
        ref,
        "Kila code hutumika mara moja tu.",
      )

    case "SUSPICIOUS_DUPLICATE":
      return fit(
        `HAKIKI: TAHADHARI. ${product}: code hii huenda imenakiliwa. USITUMIE. Piga ${supportPhone}.`,
        times && people ? `Imethibitishwa mara ${times} na watu ${people}.` : "",
        ref,
      )

    case "NOT_ACTIVATED":
      return fit(
        `HAKIKI: TAHADHARI. ${product} haijaidhinishwa kwa mauzo rasmi. Usitumie. Piga ${supportPhone}.`,
        ref,
      )

    case "RECALLED":
      return fit(
        `HAKIKI: ONYO RASMI. ${product} imeondolewa sokoni. USITUMIE. Piga ${supportPhone}.`,
        ref,
        issuer,
      )

    case "REVOKED":
    case "VOIDED":
      return fit(
        `HAKIKI: ONYO. Code ya ${productRef} imefutwa rasmi na haitumiki. Huenda ni bandia. Usitumie. Piga ${supportPhone}.`,
        ref,
      )

    case "INVALID_SECRET":
      return fit(
        `HAKIKI: Code uliyoweka hailingani na lebo ya ${productRef}. Angalia tarakimu na ujaribu tena.`,
        `Msaada: ${supportPhone}.`,
      )

    case "RATE_LIMITED":
      return fit(
        "HAKIKI: Majaribio mengi kwa muda mfupi. Kwa usalama, subiri dakika 10 kisha ujaribu tena.",
        `Msaada: ${supportPhone}.`,
      )

    case "INVALID_CODE":
    default:
      return fit(
        `HAKIKI: Code hii HAITAMBULIKI kwenye mfumo rasmi. Angalia tarakimu. Ikiwa ni sahihi, bidhaa huenda ni bandia. Usitumie. Piga ${supportPhone}.`,
      )
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
        bodySw:
          "Hii ni mara ya kwanza code hii kuthibitishwa. Bidhaa yako ni halisi. "
          + "Code hii sasa imetumika na hutumika mara moja tu.",
        bodyEn:
          "This is the first time this code has ever been verified. Your product is authentic. "
          + "The code is now used; each code is only valid for one check.",
      }
    case "GENUINE_REPEAT":
      return {
        verdict: "GENUINE",
        titleSw: "HALISI",
        titleEn: "Genuine product",
        bodySw: `Bidhaa hii ni halisi. Umeihakiki mara ${r.verification_number}.`,
        bodyEn: `This product is authentic. You have checked it ${r.verification_number} times.`,
      }
    case "CHECKED_MANY_TIMES":
      // Still a real credential, so we never say "fake" outright — the
      // buyer may simply be checking their own bottle twice. We give them
      // the count, the reason it matters, and one number to call.
      return {
        verdict: "WARNING",
        titleSw: "CODE IMESHATUMIKA",
        titleEn: "Code already used",
        bodySw:
          `Code hii ni halali, lakini imeshathibitishwa mara ${r.verification_number}. `
          + "Kila code ya HAKIKI hutumika mara moja tu, hivyo bidhaa hii huenda si halisi. "
          + "Tafadhali piga namba yetu hapa chini.",
        bodyEn:
          `This code is valid, but it has already been verified ${r.verification_number} times. `
          + "Every HAKIKI code is meant to be checked once, so this product may not be genuine. "
          + "Please call the number below.",
      }
    case "SUSPICIOUS_DUPLICATE":
      return {
        verdict: "WARNING",
        titleSw: "TAHADHARI",
        titleEn: "Warning: code may be copied",
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
        bodySw: "HAKIKI haijatambua code hii. Hakikisha umeandika tarakimu vizuri. Ikiwa code ni sahihi, bidhaa inaweza kuwa bandia. Usitumie hadi uthibitishe na mtengenezaji.",
        bodyEn: "HAKIKI does not recognise this code. Please check the digits carefully. If the code is correct, the product may be counterfeit. Do not use it until you confirm with the manufacturer.",
      }
  }
}

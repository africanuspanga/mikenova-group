/**
 * Shape of a scratch code, in one place.
 *
 * The printed label, the web input and the SMS receipt must all present the
 * same code the same way. When the label reads 4827 1936 52 and the screen
 * asks for 0000 0000 0000, a customer counts the boxes, decides they are
 * holding the wrong thing, and stops trusting the system before they have
 * even typed. So the grouping and the expected length live here and every
 * surface reads them from this file.
 *
 * No node built-ins, so client components can import it freely.
 */

/** Matches the `code_length between 6 and 14` constraint on batches. */
export const MIN_CODE_LENGTH = 6
export const MAX_CODE_LENGTH = 14

/**
 * "Ulinunua wapi?" — how much a customer may type about where they bought it.
 *
 * 160 characters is one SMS, which is about as much as anyone will type on a
 * phone standing in a shop, and it is enough for a street, a market and a
 * stall name. The field, the API and Postgres all truncate to this same
 * number so a customer never loses text they thought they had entered.
 */
export const MAX_PURCHASE_PLACE = 160

/** 4827193652 -> "4827 1936 52". Groups of four, whatever the length. */
export function groupDigits(code: string): string {
  return code.replace(/(\d{4})(?=\d)/g, "$1 ")
}

/** The grey hint in an empty field: the right number of boxes, grouped the same way. */
export function codePlaceholder(length: number): string {
  return groupDigits("0".repeat(length))
}

import crypto from "node:crypto"
import { MIN_CODE_LENGTH, MAX_CODE_LENGTH } from "./format"

/**
 * Identity generation for physical units.
 *
 * Every bottle gets three things:
 *   serial       — printed in the clear, human readable, for support calls
 *   public token — sits in the QR URL, public by design, proves nothing
 *   scratch code — hidden under the panel, the ONLY thing that proves anything
 */

// Crockford-style alphabet: no I, L, O or U, so nothing reads as 1/0 or
// turns into an unfortunate word on a printed label.
const SERIAL_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
const TOKEN_ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"

/** Uniform random index, rejection-sampled so there is no modulo bias. */
function pick(alphabet: string): string {
  const limit = 256 - (256 % alphabet.length)
  let byte: number
  do {
    byte = crypto.randomBytes(1)[0]
  } while (byte >= limit)
  return alphabet[byte % alphabet.length]
}

function randomString(alphabet: string, length: number): string {
  let out = ""
  for (let i = 0; i < length; i++) out += pick(alphabet)
  return out
}

/** e.g. HK-7K9M-2PXQ */
export function generateSerial(): string {
  return `HK-${randomString(SERIAL_ALPHABET, 4)}-${randomString(SERIAL_ALPHABET, 4)}`
}

/** e.g. r8bWx2KM9qPd — goes in the QR URL, carries no secret. */
export function generatePublicToken(): string {
  return randomString(TOKEN_ALPHABET, 12)
}

/**
 * Numeric scratch code.
 *
 * Numeric because a farmer in Kigoma types this on a feature-phone keypad;
 * JH8Q-X2MP-KQ9Z is hostile there and 4827 1936 5204 is not.
 *
 * The first digit is never 0 — people drop leading zeros when they retype a
 * number, and a code that fails because of that trains customers to
 * distrust the system.
 */
export function generateScratchCode(length: number): string {
  if (length < MIN_CODE_LENGTH || length > MAX_CODE_LENGTH) {
    throw new Error(`Code length must be between ${MIN_CODE_LENGTH} and ${MAX_CODE_LENGTH}`)
  }
  let code = String(1 + Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0x100000000) * 9))
  for (let i = 1; i < length; i++) code += pick("0123456789")
  return code
}

// Grouping and the expected digit count are shared with the browser and the
// label artwork, so they live in ./format and everything reads them from there.
export { groupDigits as formatScratchCode, codePlaceholder, MIN_CODE_LENGTH, MAX_CODE_LENGTH } from "./format"

// Risk maths lives in ./risk so client components can import it without
// pulling node:crypto into the browser bundle.
export { keyspaceFor, guessRisk, CODE_LENGTH_OPTIONS, DEFAULT_CODE_LENGTH } from "./risk"

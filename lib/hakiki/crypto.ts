import crypto from "node:crypto"

/**
 * HAKIKI cryptography.
 *
 * Scratch codes are NEVER stored in plain text. We keep:
 *   - an HMAC, peppered with a server-side secret, for verification lookups
 *   - an AES-256-GCM ciphertext, so a label can be legitimately reprinted
 *
 * Both keys live in the environment, never in Postgres. A database dump on
 * its own therefore does not let anyone mint working codes.
 */

function requireSecret(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set. HAKIKI cannot run without it`)
  return value
}

/** Verification fingerprint for a scratch code. Deterministic and unique. */
export function hmacCode(code: string): string {
  return crypto
    .createHmac("sha256", requireSecret("HAKIKI_HMAC_SECRET"))
    .update(normalizeCode(code))
    .digest("hex")
}

/**
 * Stable pseudonym for a phone number. Uses a separate pepper from the code
 * HMAC so the two hash spaces can never be correlated against each other.
 */
export function hashPhone(phone: string): string {
  return crypto
    .createHmac("sha256", requireSecret("HAKIKI_PHONE_SALT"))
    .update(normalizePhone(phone))
    .digest("hex")
}

/** Same idea for IP addresses — we want the identity, not the address. */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null
  return crypto
    .createHmac("sha256", requireSecret("HAKIKI_PHONE_SALT"))
    .update(ip.trim())
    .digest("hex")
}

export function encryptCode(code: string): string {
  const key = Buffer.from(requireSecret("HAKIKI_ENCRYPTION_KEY"), "hex")
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const ct = Buffer.concat([cipher.update(code, "utf8"), cipher.final()])
  return `v1:${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${ct.toString("hex")}`
}

export function decryptCode(payload: string): string {
  const [version, ivHex, tagHex, ctHex] = payload.split(":")
  if (version !== "v1") throw new Error("Unsupported ciphertext version")
  const key = Buffer.from(requireSecret("HAKIKI_ENCRYPTION_KEY"), "hex")
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"))
  decipher.setAuthTag(Buffer.from(tagHex, "hex"))
  return Buffer.concat([decipher.update(Buffer.from(ctHex, "hex")), decipher.final()]).toString("utf8")
}

/** Strip everything a customer might add: spaces, dashes, stray punctuation. */
export function normalizeCode(raw: string): string {
  return (raw ?? "").replace(/\D/g, "")
}

/**
 * Tanzanian numbers arrive in every shape: 0712…, +255712…, 255712…, 712….
 * All of them must hash to the same identity or duplicate detection breaks.
 */
export function normalizePhone(raw: string): string {
  let digits = (raw ?? "").replace(/\D/g, "")
  if (digits.startsWith("000")) digits = digits.slice(3)
  if (digits.startsWith("0")) digits = `255${digits.slice(1)}`
  else if (digits.length === 9) digits = `255${digits}`
  return digits
}

export function isValidTzPhone(raw: string): boolean {
  // 255 + 9 digits, and TZ mobile prefixes are 6 or 7.
  return /^255[67]\d{8}$/.test(normalizePhone(raw))
}

export function phoneLast4(raw: string): string {
  return normalizePhone(raw).slice(-4)
}

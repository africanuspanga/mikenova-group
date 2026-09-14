/**
 * How much protection a given scratch-code length actually buys.
 * Pure maths, no node built-ins, so the console can show it live while
 * an operator is choosing.
 *
 * The threat is not cryptographic. A counterfeiter does not break anything —
 * they print random digits and let customers discover that some of those
 * codes come back "genuine". The only defence is a keyspace so much larger
 * than the issued set that blind guesses miss:
 *
 *   hitRate = issuedUnits / keyspace
 *
 * At 50,000 units:
 *    6 digits  ->  1 in 18          ~5.6% of invented codes verify as real
 *    8 digits  ->  1 in 1,800       still far too loose to publish
 *   10 digits  ->  1 in 180,000     safe, and only 10 keypresses
 *   12 digits  ->  1 in 18,000,000  safest, noticeably more to type
 */

export type RiskVerdict = "CATASTROPHIC" | "WEAK" | "ACCEPTABLE" | "STRONG"

export function keyspaceFor(length: number): number {
  // First digit is never 0, so the space is 9 * 10^(n-1).
  return 9 * Math.pow(10, length - 1)
}

export function guessRisk(length: number, issuedUnits: number) {
  const keyspace = keyspaceFor(length)
  const hitRate = issuedUnits > 0 ? issuedUnits / keyspace : 0
  const oneIn = hitRate > 0 ? Math.round(1 / hitRate) : Infinity

  const verdict: RiskVerdict =
    oneIn < 100 ? "CATASTROPHIC" : oneIn < 10_000 ? "WEAK" : oneIn < 1_000_000 ? "ACCEPTABLE" : "STRONG"

  return { keyspace, hitRate, oneIn, verdict }
}

export const CODE_LENGTH_OPTIONS = [6, 8, 10, 12] as const
export const DEFAULT_CODE_LENGTH = 10

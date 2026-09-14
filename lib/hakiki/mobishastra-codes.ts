/**
 * Mobishastra response handling, per "MobiShastra API Integration v1.3".
 *
 * The plain send API answers with free text ("Send Successful", "No More
 * Credits", …). Passing ShowError=C switches it to numeric codes, which are
 * far safer to branch on. We request codes but parse BOTH, because the
 * documented ShowError example is on the valuesms.ae host and we cannot
 * assume mshastra.com honours the flag.
 */

/** Numeric codes returned when ShowError=C is accepted. */
export const MOBISHASTRA_CODES: Record<string, string> = {
  "000": "Send Successful",
  "001": "Invalid receiver",
  "003": "Invalid message",
  "005": "Authorization failed",
  "006": "DND number",
  "007": "Cannot extract country code",
  "008": "Empty receiver",
  "009": "Profile blocked",
  "010": "Invalid profile ID",
  "011": "Profile ID expired",
  "012": "Sender ID longer than 13 characters",
  "013": "Server error",
}

/**
 * Free-text failures the API returns without ShowError.
 *
 * Several of these contain no word like "error" or "invalid" — "No More
 * Credits", "Submission Stops" and "Country not activated" all read as
 * neutral prose. Matching on generic error keywords would score them as
 * successful sends, so failures are enumerated explicitly instead.
 */
const TEXT_FAILURES = [
  "invalid mobile no",
  "invalid password",
  "profile id blocked",
  "submission stops",
  "no more credits",
  "enter mobile number",
  "enter text message",
  "invalid profile id",
  "country not activated",
  "ip address not allowed",
]

export interface ParsedSmsResponse {
  ok: boolean
  /** Human-readable reason, suitable for the SMS log and the console. */
  reason: string
}

export function parseMobishastraResponse(raw: string): ParsedSmsResponse {
  const body = (raw ?? "").trim()
  if (!body) return { ok: false, reason: "Empty response from gateway" }

  // Numeric form first: the response is just the code, possibly padded.
  const code = body.match(/^(\d{3})\b/)?.[1]
  if (code && code in MOBISHASTRA_CODES) {
    return { ok: code === "000", reason: MOBISHASTRA_CODES[code] }
  }

  const lower = body.toLowerCase()

  // Positive confirmation — never infer success from the absence of an error.
  if (lower.includes("send successful") || lower.includes("send success")) {
    return { ok: true, reason: "Send Successful" }
  }

  const failure = TEXT_FAILURES.find((f) => lower.includes(f))
  if (failure) return { ok: false, reason: body.slice(0, 200) }

  // Unrecognised: treat as failure. A message we cannot confirm was sent
  // must not be logged as delivered.
  return { ok: false, reason: `Unrecognised gateway response: ${body.slice(0, 160)}` }
}

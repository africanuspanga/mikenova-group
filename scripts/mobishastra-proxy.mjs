/**
 * HAKIKI SMS relay — runs on the host whose IP Mobishastra has whitelisted
 * (164.92.205.5). Vercel functions get random egress IPs, so they cannot
 * talk to Mobishastra directly; they POST here instead.
 *
 * Deliberately NOT a generic proxy. It accepts only { to, text } and builds
 * the gateway URL itself, so a leaked URL cannot be used to relay arbitrary
 * traffic, and the gateway password never leaves this machine.
 *
 * Run on the whitelisted box:
 *   MOBISHASTRA_USER=DRIFTMARK \
 *   MOBISHASTRA_PASSWORD=... \
 *   MOBISHASTRA_SENDER_ID="CV CHAP" \
 *   HAKIKI_PROXY_SECRET=<same value as MOBISHASTRA_PROXY_SECRET on Vercel> \
 *   node mobishastra-proxy.mjs
 *
 * Then put it behind HTTPS (Caddy or nginx) and set on Vercel:
 *   MOBISHASTRA_PROXY_URL=https://sms.yourdomain.tz/send
 *   MOBISHASTRA_PROXY_SECRET=<the same secret>
 */
import http from "node:http"
import crypto from "node:crypto"

const PORT = Number(process.env.PORT ?? 8088)
const SECRET = process.env.HAKIKI_PROXY_SECRET
const USER = process.env.MOBISHASTRA_USER
const PWD = process.env.MOBISHASTRA_PASSWORD
const SENDER = process.env.MOBISHASTRA_SENDER_ID
const BASE = process.env.MOBISHASTRA_BASE_URL ?? "https://mshastra.com"

if (!SECRET || !USER || !PWD || !SENDER) {
  throw new Error("HAKIKI_PROXY_SECRET, MOBISHASTRA_USER, MOBISHASTRA_PASSWORD and MOBISHASTRA_SENDER_ID are required")
}

/** Constant-time compare so the secret cannot be recovered by timing. */
function secretMatches(presented) {
  if (typeof presented !== "string") return false
  const a = Buffer.from(presented)
  const b = Buffer.from(SECRET)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

http.createServer((req, res) => {
  const reply = (code, body) => {
    res.writeHead(code, { "Content-Type": "text/plain" })
    res.end(body)
  }

  if (req.method === "GET" && req.url === "/health") return reply(200, "ok")
  if (req.method !== "POST") return reply(405, "Method not allowed")
  if (!secretMatches(req.headers["x-hakiki-key"])) return reply(401, "Unauthorised")

  let raw = ""
  req.on("data", (chunk) => {
    raw += chunk
    if (raw.length > 8_000) req.destroy()
  })

  req.on("end", async () => {
    let to, text, action
    try {
      ({ to, text, action } = JSON.parse(raw))
    } catch {
      return reply(400, "Invalid JSON")
    }

    // Credit balance — no message is sent.
    if (action === "balance") {
      const url = new URL("/balance.aspx", BASE)
      url.searchParams.set("user", USER)
      url.searchParams.set("pwd", PWD)
      try {
        const upstream = await fetch(url, { signal: AbortSignal.timeout(15_000) })
        return reply(upstream.ok ? 200 : 502, (await upstream.text()).trim())
      } catch (err) {
        return reply(502, `Gateway error: ${err.message}`)
      }
    }

    const destination = String(to ?? "").replace(/\D/g, "")
    if (!/^255[67]\d{8}$/.test(destination)) return reply(400, "Invalid destination")
    if (!text || String(text).length > 700) return reply(400, "Invalid message")

    const url = new URL("/sendurl.aspx", BASE)
    url.searchParams.set("user", USER)
    url.searchParams.set("pwd", PWD)
    url.searchParams.set("senderid", SENDER)
    url.searchParams.set("mobileno", destination)
    url.searchParams.set("msgtext", String(text))
    url.searchParams.set("priority", "High")
    url.searchParams.set("CountryCode", "ALL")
    url.searchParams.set("ShowError", "C")

    try {
      const upstream = await fetch(url, { signal: AbortSignal.timeout(15_000) })
      reply(upstream.ok ? 200 : 502, (await upstream.text()).trim())
    } catch (err) {
      reply(502, `Gateway error: ${err.message}`)
    }
  })
}).listen(PORT, () => console.log(`HAKIKI SMS relay listening on :${PORT}`))

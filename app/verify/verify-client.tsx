"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ShieldCheck, AlertTriangle, XCircle, Loader2, Phone, MessageSquare,
  ChevronDown, RotateCcw, MapPin,
} from "lucide-react"
import { CodeInput } from "@/components/hakiki/code-input"
import { HakikiWordmark } from "@/components/hakiki/brand"
import { TZ_REGIONS } from "@/lib/hakiki/regions"
import type { UnitPublicInfo } from "@/lib/hakiki/queries"

interface VerifyResponse {
  result: string
  verdict: "GENUINE" | "WARNING" | "INVALID"
  copy: { titleSw: string; titleEn: string; bodySw: string; bodyEn: string }
  serial: string | null
  product: string | null
  productSize: string | null
  productImage: string | null
  company: string | null
  batchCode: string | null
  verificationNumber: number | null
  distinctVerifiers: number | null
  isExpired: boolean
  supportPhone: string | null
  smsSent: boolean
}

const THEME = {
  GENUINE: { accent: "#1FA463", Icon: ShieldCheck },
  WARNING: { accent: "#F0A500", Icon: AlertTriangle },
  INVALID: { accent: "#E53935", Icon: XCircle },
} as const

export function VerifyClient({ unit }: { unit?: UnitPublicInfo | null }) {
  const [code, setCode] = useState("")
  const [phone, setPhone] = useState("")
  const [wantsSms, setWantsSms] = useState(true)
  const [region, setRegion] = useState("")
  const [showExtra, setShowExtra] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<VerifyResponse | null>(null)

  const supportPhone = result?.supportPhone ?? unit?.supportPhone ?? "+255623821175"

  async function submit() {
    if (code.length < 6) {
      setError("Weka code kamili kutoka kwenye lebo / Enter the full code from your label")
      return
    }
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/hakiki/verify/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          publicToken: unit?.publicToken ?? null,
          phone: phone.trim() || null,
          notifyBySms: Boolean(wantsSms && phone.trim()),
          region: region || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Imeshindikana. Jaribu tena.")
        return
      }
      setResult(data)
    } catch {
      setError("Tatizo la mtandao. Jaribu tena / Network problem. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setResult(null)
    setCode("")
    setError("")
  }

  // ---------------- result screen ----------------
  if (result) {
    const { accent, Icon } = THEME[result.verdict]
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-8 sm:py-12">
        <div className="mb-8 flex justify-center">
          <HakikiWordmark size="sm" href="/verify" />
        </div>

        <div className="border" style={{ borderColor: `${accent}55`, backgroundColor: `${accent}0F` }}>
          <div className="flex flex-col items-center px-5 py-9 text-center sm:px-8">
            <span
              className="mb-5 flex h-16 w-16 items-center justify-center"
              style={{ backgroundColor: accent }}
            >
              <Icon className="h-9 w-9 text-[#0F0E0C]" strokeWidth={2.5} />
            </span>
            <h1
              className="font-serif text-3xl leading-tight tracking-wide sm:text-4xl"
              style={{ color: accent }}
            >
              {result.copy.titleSw}
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#FAFAF8]/50">
              {result.copy.titleEn}
            </p>
            <p className="mt-6 text-base leading-relaxed text-[#FAFAF8]">{result.copy.bodySw}</p>
            <p className="mt-3 text-sm leading-relaxed text-[#FAFAF8]/55">{result.copy.bodyEn}</p>
          </div>

          {result.product && (
            <div className="flex items-center gap-4 border-t px-5 py-5 sm:px-8" style={{ borderColor: `${accent}33` }}>
              {result.productImage && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-[#0F0E0C]">
                  <Image src={result.productImage} alt={result.product} fill className="object-contain p-1.5" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-serif text-lg text-[#FAFAF8]">{result.product}</p>
                <p className="text-sm text-[#A8A6A1]">
                  {[result.productSize, result.company].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-px border-t bg-[#F0A500]/10" style={{ borderColor: `${accent}33` }}>
            {[
              ["Serial", result.serial],
              ["Batch", result.batchCode],
              ["Imehakikiwa mara", result.verificationNumber ? String(result.verificationNumber) : null],
              ["Watu tofauti", result.distinctVerifiers ? String(result.distinctVerifiers) : null],
            ]
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={label as string} className="bg-[#0F0E0C] px-5 py-4">
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-[#FAFAF8]/40">{label}</dt>
                  <dd className="mt-1 font-mono text-sm text-[#FAFAF8]">{value}</dd>
                </div>
              ))}
          </dl>

          {result.isExpired && (
            <p className="border-t px-5 py-4 text-sm text-[#F0A500] sm:px-8" style={{ borderColor: `${accent}33` }}>
              Bidhaa hii ni halisi lakini muda wake wa matumizi umepita.
              <span className="block text-[#FAFAF8]/50">This product is genuine but past its expiry date.</span>
            </p>
          )}

          {result.smsSent && (
            <p className="flex items-center gap-2 border-t px-5 py-4 text-sm text-[#FAFAF8]/70 sm:px-8" style={{ borderColor: `${accent}33` }}>
              <MessageSquare className="h-4 w-4 shrink-0 text-[#F0A500]" />
              Tumekutumia SMS ya uthibitisho / A confirmation SMS has been sent to you.
            </p>
          )}
        </div>

        {result.verdict !== "GENUINE" && (
          <a
            href={`tel:${supportPhone}`}
            className="mt-4 flex w-full items-center justify-center gap-2.5 bg-[#F0A500] px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#0F0E0C] transition-opacity hover:opacity-90"
          >
            <Phone className="h-4 w-4" />
            Piga simu — {supportPhone}
          </a>
        )}

        <button
          onClick={reset}
          className="mt-3 flex w-full items-center justify-center gap-2.5 border border-[#F0A500]/30 px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#FAFAF8] transition-colors hover:border-[#F0A500] hover:text-[#F0A500]"
        >
          <RotateCcw className="h-4 w-4" />
          Hakiki bidhaa nyingine
        </button>

        <p className="mt-8 text-center text-xs leading-relaxed text-[#FAFAF8]/35">
          HAKIKI inathibitisha bidhaa moja moja, siyo QR code peke yake.
          <br />
          <Link href="/" className="text-[#F0A500]/70 underline-offset-4 hover:underline">
            MIKENOVA GROUP
          </Link>
        </p>
      </div>
    )
  }

  // ---------------- entry screen ----------------
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 sm:py-12">
      <div className="mb-9 flex justify-center">
        <HakikiWordmark href="/verify" />
      </div>

      {unit ? (
        <div className="mb-6 flex items-center gap-4 border border-[#F0A500]/20 bg-[#1B1A17] p-4">
          {unit.productImage && (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-[#0F0E0C]">
              <Image src={unit.productImage} alt={unit.productName} fill className="object-contain p-1.5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-serif text-lg text-[#FAFAF8]">{unit.productName}</p>
            <p className="text-sm text-[#A8A6A1]">
              {[unit.productSize, unit.companyName].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-0.5 font-mono text-xs text-[#F0A500]/70">{unit.serial}</p>
          </div>
        </div>
      ) : (
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl text-[#FAFAF8] sm:text-3xl">Thibitisha bidhaa yako</h1>
          <p className="mt-2 text-sm text-[#A8A6A1]">Verify your product is genuine</p>
        </div>
      )}

      {/* The distinction the whole system rests on. */}
      <p className="mb-6 border-l-2 border-[#F0A500] bg-[#1B1A17] px-4 py-3 text-sm leading-relaxed text-[#FAFAF8]/75">
        Kwarua sehemu ya usalama kwenye lebo, kisha weka tarakimu zilizofichwa.
        <span className="mt-1 block text-[#FAFAF8]/45">
          Scratch the security panel on the label and enter the hidden digits.
        </span>
      </p>

      <label className="mb-2 block text-[10px] uppercase tracking-[0.22em] text-[#F0A500]">
        Code ya usalama / Security code
      </label>
      <CodeInput value={code} onChange={setCode} maxLength={14} onEnter={submit} autoFocus={!!unit} />

      <label className="mt-6 mb-2 block text-[10px] uppercase tracking-[0.22em] text-[#F0A500]">
        Namba ya simu / Phone number
      </label>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        inputMode="tel"
        autoComplete="tel"
        placeholder="0712 345 678"
        aria-label="Phone number"
        className="w-full border border-[#F0A500]/30 bg-[#0F0E0C] px-4 py-4 text-lg text-[#FAFAF8] placeholder:text-[#FAFAF8]/20 transition-colors focus:border-[#F0A500] focus:outline-none focus:ring-1 focus:ring-[#F0A500]"
      />

      <label className="mt-3 flex cursor-pointer items-start gap-3 py-1">
        <input
          type="checkbox"
          checked={wantsSms}
          onChange={(e) => setWantsSms(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#F0A500]"
        />
        <span className="text-sm leading-snug text-[#FAFAF8]/70">
          Nitumie majibu kwa SMS
          <span className="block text-xs text-[#FAFAF8]/40">Send me the result by SMS</span>
        </span>
      </label>

      <button
        type="button"
        onClick={() => setShowExtra((v) => !v)}
        className="mt-4 flex w-full items-center justify-between border-t border-[#F0A500]/15 pt-4 text-xs uppercase tracking-[0.15em] text-[#FAFAF8]/50 transition-colors hover:text-[#F0A500]"
      >
        <span className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          Ulinunua wapi? (si lazima)
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${showExtra ? "rotate-180" : ""}`} />
      </button>

      {showExtra && (
        <div className="mt-3">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            aria-label="Region where the product was bought"
            className="w-full border border-[#F0A500]/30 bg-[#0F0E0C] px-4 py-3.5 text-base text-[#FAFAF8] focus:border-[#F0A500] focus:outline-none"
          >
            <option value="">Chagua mkoa / Select region</option>
            {TZ_REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-relaxed text-[#FAFAF8]/35">
            Hii inatusaidia kujua maeneo yenye bidhaa bandia. This helps us map where
            counterfeits are being sold.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-5 border border-[#E53935]/40 bg-[#E53935]/10 px-4 py-3 text-sm text-[#E53935]">
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={busy || code.length < 6}
        className="mt-6 flex w-full items-center justify-center gap-2.5 bg-[#F0A500] px-6 py-5 text-sm font-bold uppercase tracking-[0.2em] text-[#0F0E0C] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
      >
        {busy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Inathibitisha…
          </>
        ) : (
          <>
            <ShieldCheck className="h-5 w-5" />
            HAKIKI
          </>
        )}
      </button>

      <p className="mt-8 text-center text-xs leading-relaxed text-[#FAFAF8]/35">
        Huna intaneti? Tuma code yako kwa SMS.
        <br />
        <Link href="/" className="text-[#F0A500]/70 underline-offset-4 hover:underline">
          MIKENOVA GROUP
        </Link>
      </p>
    </div>
  )
}

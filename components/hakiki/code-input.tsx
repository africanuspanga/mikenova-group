"use client"

import { useRef } from "react"

/**
 * The scratch code field.
 *
 * Built for a cheap Android phone held in one hand in a shop:
 *   - numeric keypad forced open via inputMode
 *   - digits auto-grouped in fours as they type, so people can check their
 *     work against the label without counting characters
 *   - anything that isn't a digit is silently dropped, because customers
 *     paste and retype these with spaces, dashes and stray letters
 */
export function CodeInput({
  value,
  onChange,
  maxLength = 14,
  onEnter,
  autoFocus,
}: {
  value: string
  onChange: (digits: string) => void
  maxLength?: number
  onEnter?: () => void
  autoFocus?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  const display = value.replace(/(\d{4})(?=\d)/g, "$1 ")

  return (
    <input
      ref={ref}
      value={display}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, maxLength))}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) onEnter()
      }}
      inputMode="numeric"
      autoComplete="one-time-code"
      autoFocus={autoFocus}
      placeholder="0000 0000 0000"
      aria-label="Security code from the scratch panel"
      className="w-full bg-[#0F0E0C] border border-[#F0A500]/30 px-4 py-5 text-center font-mono text-2xl sm:text-3xl tracking-[0.18em] text-[#FAFAF8] placeholder:text-[#FAFAF8]/20 focus:border-[#F0A500] focus:outline-none focus:ring-1 focus:ring-[#F0A500] transition-colors"
    />
  )
}

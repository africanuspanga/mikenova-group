"use client"

import { useRef } from "react"
import { groupDigits, codePlaceholder, MAX_CODE_LENGTH } from "@/lib/hakiki/format"

/**
 * The scratch code field.
 *
 * Built for a cheap Android phone held in one hand in a shop:
 *   - numeric keypad forced open via inputMode
 *   - digits auto-grouped in fours as they type, so people can check their
 *     work against the label without counting characters
 *   - anything that isn't a digit is silently dropped, because customers
 *     paste and retype these with spaces, dashes and stray letters
 *
 * `length` is how many digits this label actually carries. It drives the
 * placeholder and the counter, so the field on screen shows exactly as many
 * boxes as the panel on the bottle — a customer holding a 10 digit code must
 * never be shown a 12 digit hint and conclude they have the wrong product.
 *
 * `strict` says we know that length for certain (the QR told us which batch
 * this label came from), so the field can hard-stop at it. On the manual
 * entry page we are only guessing from the default, and the field stays open
 * to the full range a batch may legally use.
 */
export function CodeInput({
  value,
  onChange,
  length,
  strict = false,
  onEnter,
  autoFocus,
}: {
  value: string
  onChange: (digits: string) => void
  length: number
  strict?: boolean
  onEnter?: () => void
  autoFocus?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  const cap = strict ? length : MAX_CODE_LENGTH
  const complete = value.length === length

  return (
    <div>
      <input
        ref={ref}
        value={groupDigits(value)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, cap))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter()
        }}
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        placeholder={codePlaceholder(length)}
        aria-label={`Security code from the scratch panel, ${length} digits`}
        className="w-full bg-white border border-[#D8D4CB] px-4 py-5 text-center font-mono text-2xl sm:text-3xl tracking-[0.18em] text-[#1B1A17] placeholder:text-[#B3AFA6] focus:border-[#F0A500] focus:outline-none focus:ring-1 focus:ring-[#F0A500] transition-colors"
      />
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-[#8C8A85]">
          Tarakimu {length} / {length} digits
        </span>
        <span className={`font-mono ${complete ? "text-[#12683F]" : "text-[#8C8A85]"}`}>
          {value.length}/{length}
        </span>
      </div>
    </div>
  )
}

import Link from "next/link"
import { ShieldCheck } from "lucide-react"

/** The HAKIKI mark — gold tile, dark tick. Reads on both light and dark ground. */
export function HakikiMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box = size === "sm" ? "h-8 w-8 rounded-lg" : size === "lg" ? "h-12 w-12 rounded-xl" : "h-10 w-10 rounded-lg"
  const icon = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"
  return (
    <span className={`${box} grid shrink-0 place-items-center bg-[#F0A500]`}>
      <ShieldCheck className={`${icon} text-[#1B1A17]`} strokeWidth={2.5} />
    </span>
  )
}

export function HakikiWordmark({
  size = "md",
  href,
  tagline = true,
  dark = false,
}: {
  size?: "sm" | "md" | "lg"
  href?: string
  tagline?: boolean
  /** Use on the dark customer-facing pages. */
  dark?: boolean
}) {
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"
  const nameColor = dark ? "text-[#FAFAF8]" : "text-foreground"
  const tagColor = dark ? "text-[#F0A500]" : "text-muted-foreground"

  const inner = (
    <span className="flex items-center gap-2.5">
      <HakikiMark size={size} />
      <span className="flex flex-col leading-none">
        <span className={`${text} font-semibold tracking-tight ${nameColor}`}>HAKIKI</span>
        {tagline && (
          <span className={`mt-1 text-[10px] font-medium tracking-wide ${tagColor}`}>
            Scan. Scratch. Hakiki.
          </span>
        )}
      </span>
    </span>
  )
  return href ? <Link href={href} className="inline-flex">{inner}</Link> : inner
}

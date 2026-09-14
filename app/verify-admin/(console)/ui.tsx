"use client"

import { Loader2 } from "lucide-react"

/**
 * Console primitives.
 *
 * Everything here uses semantic tokens rather than fixed colours, so the
 * whole console follows the .hakiki-console light palette. Styling follows
 * the efferd dashboard language: rounded-xl cards, hairline borders, a soft
 * shadow, muted micro-labels and tabular figures.
 */

export function PageHeader({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({
  label, value, tone = "default", hint,
}: {
  label: string
  value: string | number
  tone?: "default" | "gold" | "warning" | "danger" | "success"
  hint?: string
}) {
  const color = {
    default: "text-foreground",
    gold: "text-foreground",
    warning: "text-[var(--hakiki-warning)]",
    danger: "text-[var(--hakiki-danger)]",
    success: "text-[var(--hakiki-success)]",
  }[tone]

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <p className="text-xs font-normal leading-tight text-muted-foreground">{label}</p>
      <p className={`num mt-2 text-2xl font-semibold tracking-tight ${color}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card shadow-sm ${className}`}>{children}</div>
  )
}

export function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
      {icon}
      {children}
    </h2>
  )
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    neutral: "border-border bg-muted text-muted-foreground",
    gold: "border-primary/30 bg-[#fdf4e0] text-[#8a5f00]",
    success: "border-[#bbf7d0] bg-[var(--hakiki-success-bg)] text-[var(--hakiki-success)]",
    warning: "border-[#fde68a] bg-[var(--hakiki-warning-bg)] text-[var(--hakiki-warning)]",
    danger: "border-[#fecaca] bg-[var(--hakiki-danger-bg)] text-[var(--hakiki-danger)]",
  }
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${tones[tone] ?? tones.neutral}`}>
      {children}
    </span>
  )
}

export const STATUS_TONE: Record<string, string> = {
  DRAFT: "neutral", CODES_GENERATED: "gold", PRINTING: "gold", LABELLED: "gold",
  ACTIVE: "success", CLOSED: "neutral", RECALLED: "danger",
  GENERATED: "neutral", VOIDED: "neutral", REVOKED: "danger",
  GENUINE_FIRST: "success", GENUINE_REPEAT: "success",
  SUSPICIOUS_DUPLICATE: "warning", NOT_ACTIVATED: "warning",
  INVALID_CODE: "danger", INVALID_SECRET: "danger", RATE_LIMITED: "warning",
  WARNING: "warning", HIGH: "danger", CRITICAL: "danger",
  OPEN: "danger", INVESTIGATING: "warning", RESOLVED: "success", DISMISSED: "neutral",
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-20 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      {label}
    </div>
  )
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

export function Button({
  children, onClick, variant = "primary", disabled, type = "button", className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "outline" | "danger" | "ghost"
  disabled?: boolean
  type?: "button" | "submit"
  className?: string
}) {
  const styles = {
    primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
    outline: "border border-border bg-card text-foreground shadow-sm hover:bg-muted",
    danger: "border border-[#fecaca] bg-card text-[var(--hakiki-danger)] shadow-sm hover:bg-[var(--hakiki-danger-bg)]",
    ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  }[variant]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      // min-h-10 keeps every control a comfortable tap target on a phone.
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  )
}

export const inputClass =
  "w-full min-h-10 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"

export const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground"

export function Alert({ tone, children }: { tone: "success" | "danger" | "warning"; children: React.ReactNode }) {
  const map = {
    success: "border-[#bbf7d0] bg-[var(--hakiki-success-bg)] text-[var(--hakiki-success)]",
    danger: "border-[#fecaca] bg-[var(--hakiki-danger-bg)] text-[var(--hakiki-danger)]",
    warning: "border-[#fde68a] bg-[var(--hakiki-warning-bg)] text-[var(--hakiki-warning)]",
  }[tone]
  return <div className={`rounded-lg border px-3.5 py-2.5 text-sm ${map}`}>{children}</div>
}

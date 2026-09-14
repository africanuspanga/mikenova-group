"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Loader2 } from "lucide-react"
import { browserClient } from "@/lib/hakiki/supabase-browser"
import { HakikiWordmark } from "@/components/hakiki/brand"

export default function HakikiLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")

    const { error: authError } = await browserClient().auth.signInWithPassword({ email, password })
    if (authError) {
      setError("Barua pepe au nenosiri si sahihi / Invalid email or password")
      setBusy(false)
      return
    }
    router.push("/verify-admin/dashboard")
    router.refresh()
  }

  const input =
    "w-full min-h-11 rounded-lg border border-input bg-card py-2 pl-10 pr-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"

  return (
    <div className="hakiki-console flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to site
      </Link>

      <div className="w-full max-w-sm">
        {/* The MIKENOVA wordmark is gold on transparent, so it needs a dark
            plate behind it to read at all on a light page. */}
        <div className="mb-5 flex justify-center">
          <div className="flex w-full max-w-[280px] items-center justify-center rounded-2xl bg-[#0F0E0C] px-7 py-6 shadow-lg shadow-black/10 sm:max-w-[300px]">
            <Image
              src="/logo-new.png"
              alt="MIKENOVA GROUP"
              width={600}
              height={160}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>

        <div className="mb-6 flex justify-center">
          <HakikiWordmark size="md" />
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Operations console</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage products, batches and fraud alerts.
          </p>

          {error && (
            <p className="mt-4 rounded-lg border border-[#fecaca] bg-[var(--hakiki-danger-bg)] px-3.5 py-2.5 text-sm text-[var(--hakiki-danger)]">
              {error}
            </p>
          )}

          <label htmlFor="email" className="mb-1.5 mt-5 block text-xs font-medium text-muted-foreground">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@mikenovagroup.co.tz"
              className={input}
            />
          </div>

          <label htmlFor="password" className="mb-1.5 mt-4 block text-xs font-medium text-muted-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={`${input} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Verifying a product?{" "}
          <Link href="/verify" className="font-medium text-foreground underline-offset-4 hover:underline">
            Go to /verify
          </Link>
        </p>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard, Package, Layers, ScanLine, ShieldAlert, LogOut, Menu, X, ExternalLink,
} from "lucide-react"
import { browserClient } from "@/lib/hakiki/supabase-browser"
import { HakikiWordmark } from "@/components/hakiki/brand"

const NAV = [
  { href: "/verify-admin/dashboard", label: "Dashboard", short: "Home", Icon: LayoutDashboard },
  { href: "/verify-admin/batches", label: "Batches", short: "Batches", Icon: Layers },
  { href: "/verify-admin/products", label: "Products", short: "Products", Icon: Package },
  { href: "/verify-admin/verifications", label: "Verifications", short: "Scans", Icon: ScanLine },
  { href: "/verify-admin/alerts", label: "Fraud alerts", short: "Alerts", Icon: ShieldAlert },
]

export function ConsoleShell({
  children, email, role,
}: {
  children: React.ReactNode
  email: string
  role: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  async function signOut() {
    await browserClient().auth.signOut()
    router.push("/verify-admin")
    router.refresh()
  }

  return (
    <div className="hakiki-console min-h-screen lg:flex">
      {/* ---------- desktop sidebar ---------- */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="px-4 py-5">
          <HakikiWordmark size="sm" href="/verify-admin/dashboard" />
        </div>

        <nav className="flex-1 px-3">
          {NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(href)
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive(href) ? "text-primary" : ""}`} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/verify"
            target="_blank"
            className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            Customer page
          </Link>
          <div className="rounded-lg bg-muted/60 px-3 py-2.5">
            <p className="truncate text-xs font-medium text-foreground">{email}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{role}</p>
          </div>
          <button
            onClick={signOut}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ---------- mobile top bar ---------- */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <HakikiWordmark size="sm" href="/verify-admin/dashboard" tagline={false} />
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="-mr-2 grid h-10 w-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[53px] z-30 overflow-y-auto bg-background px-4 py-4 lg:hidden">
          <div className="mb-3 rounded-lg bg-card px-3 py-2.5 shadow-sm">
            <p className="truncate text-sm font-medium text-foreground">{email}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{role}</p>
          </div>
          {NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-3.5 text-[15px] ${
                isActive(href) ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive(href) ? "text-primary" : ""}`} />
              {label}
            </Link>
          ))}
          <Link
            href="/verify"
            target="_blank"
            className="mb-1 flex items-center gap-3 rounded-lg px-3 py-3.5 text-[15px] text-muted-foreground"
          >
            <ExternalLink className="h-5 w-5" />
            Customer page
          </Link>
          <button
            onClick={signOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3.5 text-sm font-medium text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}

      {/* pb-20 clears the mobile tab bar */}
      <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>

      {/* ---------- mobile tab bar: this console gets used on a factory floor ---------- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {NAV.map(({ href, short, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors ${
              isActive(href) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {short}
          </Link>
        ))}
      </nav>
    </div>
  )
}

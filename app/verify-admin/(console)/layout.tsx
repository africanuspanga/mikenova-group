import { redirect } from "next/navigation"
import { getAdmin } from "@/lib/hakiki/auth"
import { ConsoleShell } from "./console-shell"

export const dynamic = "force-dynamic"

/**
 * Every console page is gated here.
 *
 * Being signed in with Supabase is not sufficient — getAdmin() also requires
 * an active admin_users row, so HAKIKI access is granted explicitly rather
 * than inherited from having any account on the project.
 */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin()
  if (!admin) redirect("/verify-admin")

  return (
    <ConsoleShell email={admin.email} role={admin.role}>
      {children}
    </ConsoleShell>
  )
}

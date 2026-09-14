import { sessionClient, serviceClient } from "./supabase"

export interface AdminContext {
  userId: string
  email: string
  fullName: string | null
  role: "ADMIN" | "OPERATIONS" | "VIEWER"
  companyId: string
}

/**
 * Resolves the logged-in HAKIKI operator.
 *
 * Being authenticated with Supabase is not enough — the user must also have
 * an active row in admin_users. That keeps the HAKIKI console separate from
 * any other auth that might later exist on the main site.
 */
export async function getAdmin(): Promise<AdminContext | null> {
  const supabase = await sessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: admin } = await serviceClient()
    .from("admin_users")
    .select("id, email, full_name, role, company_id, is_active")
    .eq("id", user.id)
    .maybeSingle()

  if (!admin || !admin.is_active) return null

  return {
    userId: admin.id,
    email: admin.email,
    fullName: admin.full_name,
    role: admin.role,
    companyId: admin.company_id,
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Not authorised") {
    super(message)
  }
}

export async function requireAdmin(): Promise<AdminContext> {
  const admin = await getAdmin()
  if (!admin) throw new UnauthorizedError()
  return admin
}

/** Mutating actions are closed to VIEWER accounts. */
export async function requireWriter(): Promise<AdminContext> {
  const admin = await requireAdmin()
  if (admin.role === "VIEWER") throw new UnauthorizedError("This account has read-only access")
  return admin
}

export async function audit(opts: {
  admin: AdminContext
  action: string
  entityType?: string
  entityId?: string
  detail?: Record<string, unknown>
}) {
  try {
    await serviceClient().from("audit_logs").insert({
      company_id: opts.admin.companyId,
      actor_id: opts.admin.userId,
      actor_email: opts.admin.email,
      action: opts.action,
      entity_type: opts.entityType ?? null,
      entity_id: opts.entityId ?? null,
      detail: opts.detail ?? {},
    })
  } catch (err) {
    console.error("[HAKIKI] audit write failed", err)
  }
}

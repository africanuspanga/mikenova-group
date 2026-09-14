"use client"

import { createBrowserClient } from "@supabase/ssr"

/**
 * Browser client. Used ONLY for admin login/logout session handling.
 * It can read no HAKIKI data — every table denies the anon role.
 */
export function browserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

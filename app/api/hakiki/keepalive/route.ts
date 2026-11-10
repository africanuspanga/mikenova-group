import { NextResponse } from "next/server"
import { serviceClient } from "@/lib/hakiki/supabase"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Daily Vercel Cron (vercel.json). Supabase's free plan pauses a project
 * after 7 days without activity, and a paused project means every HAKIKI
 * scan fails. One tiny query a day keeps it awake.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when that variable is
 * set, so nobody else can trigger it.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const { count, error } = await serviceClient()
    .from("companies").select("*", { count: "exact", head: true })
  if (error) {
    console.error("[hakiki keepalive] Supabase query failed:", error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, companies: count, at: new Date().toISOString() })
}

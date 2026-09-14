import { NextResponse } from "next/server"
import { UnauthorizedError } from "./auth"

/** Uniform error handling for every admin route. */
export async function handle<T>(fn: () => Promise<T>): Promise<NextResponse> {
  try {
    return NextResponse.json((await fn()) as Record<string, unknown>)
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    const message = err instanceof Error ? err.message : "Something went wrong"
    console.error("[HAKIKI admin]", err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

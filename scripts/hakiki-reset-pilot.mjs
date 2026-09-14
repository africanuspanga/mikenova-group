/**
 * Removes the automated pilot-test data (batches whose code starts PILOT-).
 * Products, the company and your admin login are left untouched.
 *   node --env-file=.env.local scripts/hakiki-reset-pilot.mjs
 */
import { createClient } from "@supabase/supabase-js"

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const { data: batches } = await db.from("batches").select("id, batch_code").like("batch_code", "PILOT-%")
if (!batches?.length) {
  console.log("No pilot batches found — nothing to clean up.")
  process.exit(0)
}

for (const batch of batches) {
  // auth_units, verification_events and fraud_alerts all cascade from the batch.
  await db.from("batches").delete().eq("id", batch.id)
  console.log(`removed ${batch.batch_code}`)
}
await db.from("rate_limits").delete().neq("bucket", "")
console.log(`\nRemoved ${batches.length} pilot batches and reset rate limits.`)

// Applies a .sql file to Supabase via the Management API.
//   node scripts/run-sql.mjs supabase/migrations/0001_hakiki_core.sql
import { readFileSync } from "node:fs"

const token = process.env.SUPABASE_ACCESS_TOKEN
const ref = process.env.SUPABASE_PROJECT_ID
if (!token || !ref) throw new Error("SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_ID required")

const arg = process.argv[2]
const sql = arg === "-e" ? process.argv[3] : readFileSync(arg, "utf8")

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
})
const text = await res.text()
if (!res.ok) {
  console.error(`FAILED ${res.status}:`, text)
  process.exit(1)
}
console.log("OK:", text.slice(0, 3000))

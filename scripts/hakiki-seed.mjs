/**
 * One-time HAKIKI bootstrap: company, first ADMIN operator, product catalogue.
 *   node --env-file=.env.local scripts/hakiki-seed.mjs <email> <password>
 */
import { createClient } from "@supabase/supabase-js"
import crypto from "node:crypto"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error("Supabase credentials missing from the environment")

const email = process.argv[2]
const password = process.argv[3] || crypto.randomBytes(12).toString("base64url")
if (!email) throw new Error("Usage: node --env-file=.env.local scripts/hakiki-seed.mjs <email> [password]")

const db = createClient(url, key, { auth: { persistSession: false } })

// ---- company -------------------------------------------------------
let { data: company } = await db.from("companies").select("*").eq("slug", "goddess-glow").maybeSingle()
if (!company) {
  const { data, error } = await db.from("companies").insert({
    name: "MIKENOVA GROUP",
    slug: "goddess-glow",
    support_phone: "+255623821175",
    support_email: "info@mikenovagroup.co.tz",
    logo_url: "/logo.png",
  }).select().single()
  if (error) throw error
  company = data
  console.log("created company:", company.name)
} else {
  console.log("company already exists:", company.name)
}

// ---- admin operator ------------------------------------------------
const { data: existing } = await db.auth.admin.listUsers({ perPage: 1000 })
let user = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

if (!user) {
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { hakiki_role: "ADMIN" },
  })
  if (error) throw error
  user = data.user
  console.log("created auth user:", email)
  console.log("PASSWORD:", password)
} else {
  await db.auth.admin.updateUserById(user.id, { password })
  console.log("auth user existed — password reset to:", password)
}

const { error: adminError } = await db.from("admin_users").upsert({
  id: user.id,
  company_id: company.id,
  email,
  full_name: "HAKIKI Administrator",
  role: "ADMIN",
  is_active: true,
}, { onConflict: "id" })
if (adminError) throw adminError
console.log("linked admin_users row with role ADMIN")

// ---- product catalogue ---------------------------------------------
const products = [
  { name: "Goddess Glow Body Cream", sku: "GG-CREAM-300", size: "300ml",
    description: "Brightening body cream that reveals smooth, even, radiant skin.",
    image_url: "/New Goddess Glow.PNG" },
  { name: "Goddess Glow Body Oil", sku: "GG-OIL",
    description: "Luxurious body oil that nourishes and gives skin a luminous glow.",
    image_url: "/goddess-glow/body-oil-product.jpeg" },
  { name: "Goddess Glow Bar Soap", sku: "GG-SOAP",
    description: "Natural brightening bar soap infused with fruit extracts.",
    image_url: "/goddess-glow/bar-soap-1.jpeg" },
  { name: "Bellela Face Cream", sku: "BELLELA-FACE",
    description: "Daily face cream for a smooth, even, radiant glow.",
    image_url: "/products/bellela-face-cream.webp" },
  { name: "Meloura Rich Moisture Body Cream", sku: "MELOURA-300", size: "300g",
    description: "Rich moisture body cream for melanin-rich skin. Nourishes, softens, restores.",
    image_url: "/products/meloura-body-cream.webp" },
]

for (const product of products) {
  const { error } = await db.from("products")
    .upsert({ company_id: company.id, ...product }, { onConflict: "company_id,sku" })
  if (error) throw error
}
console.log(`seeded ${products.length} products`)

console.log("\n--- HAKIKI is ready ---")
console.log("Console: /verify-admin")
console.log("Email:  ", email)
console.log("Password:", password)

import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Premium Products - MIKENOVA GROUP | Luxury Collection",
  description:
    "Browse MIKENOVA GROUP's curated collection of premium products including luxury cosmetics, designer fashion, high-end furniture, pharmacy supplies, and wellness products. Every item meets our uncompromising standard of excellence.",
  openGraph: {
    title: "Premium Products - MIKENOVA GROUP | Luxury Collection",
    description:
      "Browse MIKENOVA GROUP's curated collection of premium products including luxury cosmetics, designer fashion, high-end furniture, and wellness products.",
    url: "https://www.mikenovagroup.co.tz/products",
    siteName: "MIKENOVA GROUP",
    type: "website",
  },
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}

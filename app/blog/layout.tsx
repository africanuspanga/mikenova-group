import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Beauty & Skincare Blog | MIKENOVA GROUP",
  description:
    "Expert skincare advice, product guides, and real transformation stories. Your trusted duka la vipodozi na urembo (cosmetics and beauty shop) in Dar es Salaam.",
  keywords:
    "vipodozi, duka la vipodozi, vipodozi dar es salaam, vipodozi na urembo, skincare blog, beauty tips, goddess glow, vipodozi salama, vipodozi vya kung'arisha ngozi",
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

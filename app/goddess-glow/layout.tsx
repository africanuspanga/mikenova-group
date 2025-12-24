import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Goddess Glow - Vipodozi vya Kung'arisha Ngozi | Body Cream, Oil & Soap | MIKENOVA GROUP Tanzania",
  description:
    "Nunua Goddess Glow Brightening Body Cream, Body Oil na Bar Soap. Vipodozi salama vya kung'arisha ngozi kwa bei nafuu Tanzania. Dermatologist approved. Tuma WhatsApp +255 675 622 238. Delivery Tanzania nzima.",
  keywords: [
    "goddess glow",
    "brightening body cream",
    "vipodozi tanzania",
    "skin brightening cream",
    "body cream dar es salaam",
    "vipodozi vya kung'arisha ngozi",
    "mikenova group",
    "skincare tanzania",
    "body oil tanzania",
    "bar soap tanzania",
    "vipodozi salama",
    "cosmetics tanzania",
    "brightening cream africa",
    "skin care products",
    "beauty products tanzania",
  ],
  openGraph: {
    title: "Goddess Glow - Vipodozi vya Kung'arisha Ngozi | MIKENOVA GROUP",
    description:
      "Nunua Goddess Glow Body Cream, Body Oil na Bar Soap. Vipodozi salama vya kung'arisha ngozi kwa bei nafuu. Delivery Tanzania nzima.",
    url: "https://www.mikenovagroup.co.tz/goddess-glow",
    siteName: "MIKENOVA GROUP",
    type: "website",
    locale: "sw_TZ",
    images: [
      {
        url: "/images/img-7754.png",
        width: 1200,
        height: 630,
        alt: "Goddess Glow Brightening Body Cream - Vipodozi Tanzania",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Goddess Glow - Brightening Body Cream | MIKENOVA GROUP",
    description: "Premium brightening skincare products. Body Cream, Body Oil & Bar Soap. Delivery Tanzania nzima.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.mikenovagroup.co.tz/goddess-glow",
  },
}

export default function GoddessGlowLayout({ children }: { children: React.ReactNode }) {
  return children
}

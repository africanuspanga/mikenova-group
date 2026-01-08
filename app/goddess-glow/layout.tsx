import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Goddess Glow - Premium Brightening Body Cream, Oil & Soap | Buy Online Tanzania | MIKENOVA GROUP",
  description:
    "Buy Goddess Glow brightening skincare products in Tanzania. Premium Body Cream, Body Oil & Bar Soap for radiant, glowing skin. MVS Goddess Glow, Revolution Goddess Glow alternative. Free delivery Dar es Salaam. WhatsApp +255 623 821 175.",
  keywords: [
    // Primary brand keywords
    "goddess glow",
    "goddess glow cream",
    "goddess glow lotion",
    "goddess glow oil",
    "goddess glow body oil",
    "goddess glow bar soap",
    "goddess glow body cream",
    // Related brand searches
    "mvs goddess glow",
    "mvs cosmetics goddess glow",
    "revolution goddess glow",
    "radiant goddess glow",
    "revolution goddess glow primer",
    "revolution pro goddess glow primer",
    "primal queen vs goddess glow",
    // Product type keywords
    "brightening body cream",
    "skin brightening cream",
    "brightening body oil",
    "brightening bar soap",
    "skin glow cream",
    "body glow oil",
    "radiant skin cream",
    "glowing skin products",
    // Location keywords
    "skincare tanzania",
    "cosmetics tanzania",
    "beauty products tanzania",
    "body cream dar es salaam",
    "skincare products africa",
    "buy cream online tanzania",
    // Swahili keywords
    "vipodozi tanzania",
    "cream ya kung'arisha ngozi",
    "mafuta ya ngozi",
    "sabuni ya kung'arisha",
    // Brand keywords
    "mikenova group",
    "mikenova cosmetics",
    "mikenova skincare",
  ],
  openGraph: {
    title: "Goddess Glow - Premium Brightening Body Cream, Oil & Soap | MIKENOVA GROUP Tanzania",
    description:
      "Buy Goddess Glow brightening skincare products. Premium Body Cream TZS 30,000, Body Oil TZS 30,000 & Bar Soap TZS 8,000. Get radiant, glowing skin. Free delivery in Dar es Salaam.",
    url: "https://www.mikenovagroup.co.tz/goddess-glow",
    siteName: "MIKENOVA GROUP",
    type: "website",
    locale: "en_TZ",
    images: [
      {
        url: "https://www.mikenovagroup.co.tz/goddess-glow/body-cream-1.jpeg",
        width: 1200,
        height: 630,
        alt: "Goddess Glow Brightening Body Cream - Premium Skincare Tanzania",
      },
      {
        url: "https://www.mikenovagroup.co.tz/goddess-glow/body-oil-1.jpeg",
        width: 1200,
        height: 630,
        alt: "Goddess Glow Body Oil - Radiant Skin Tanzania",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Goddess Glow - Brightening Body Cream, Oil & Soap | Tanzania",
    description:
      "Premium brightening skincare products. Body Cream, Body Oil & Bar Soap for radiant glowing skin. Buy online with free delivery.",
    images: ["https://www.mikenovagroup.co.tz/goddess-glow/body-cream-1.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.mikenovagroup.co.tz/goddess-glow",
  },
  other: {
    "google-site-verification": "0P0--FJbylHfizoCQREuyNgyfURig8g-D2qiUcCcA-8",
  },
}

export default function GoddessGlowLayout({ children }: { children: React.ReactNode }) {
  return children
}

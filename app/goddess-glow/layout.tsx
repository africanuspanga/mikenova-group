import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Goddess Glow - Premium Brightening Body Cream | MIKENOVA GROUP",
  description:
    "Discover Goddess Glow Brightening Body Cream, our best-selling premium skincare product. Reveal your natural radiance with this luxurious, effective brightening cream formulated for all skin tones. Available in Tanzania.",
  openGraph: {
    title: "Goddess Glow - Premium Brightening Body Cream | MIKENOVA GROUP",
    description:
      "Discover Goddess Glow Brightening Body Cream, our best-selling premium skincare product. Reveal your natural radiance with this luxurious brightening cream.",
    url: "https://www.mikenovagroup.co.tz/goddess-glow",
    siteName: "MIKENOVA GROUP",
    type: "website",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7754.PNG-fFhHoSWbSPyiIJFgpGnSocDP8ag2Hi.png",
        width: 1200,
        height: 630,
        alt: "Goddess Glow Brightening Body Cream",
      },
    ],
  },
}

export default function GoddessGlowLayout({ children }: { children: React.ReactNode }) {
  return children
}

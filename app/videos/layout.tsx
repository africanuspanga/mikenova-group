import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "MIKENOVA Videos | Vlogs, Stories & Behind the Scenes — Tanzania",
  description:
    "Watch the latest MIKENOVA GROUP videos, vlogs, and behind-the-scenes stories from our Tanzanian luxury conglomerate and Goddess Glow skincare brand.",
  keywords: [
    "MIKENOVA videos",
    "MIKENOVA GROUP vlog",
    "Goddess Glow videos",
    "Tanzania business vlog",
    "MIKENOVA YouTube",
  ],
  openGraph: {
    title: "MIKENOVA Videos | Vlogs, Stories & Behind the Scenes",
    description:
      "Watch the latest MIKENOVA GROUP videos, vlogs, and behind-the-scenes stories.",
    url: "https://www.mikenovagroup.co.tz/videos/",
    siteName: "MIKENOVA GROUP",
    type: "website",
    images: [
      {
        url: "/golden-edition.png",
        width: 1200,
        height: 630,
        alt: "MIKENOVA GROUP - Videos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MIKENOVA Videos | Vlogs, Stories & Behind the Scenes",
    description:
      "Watch the latest MIKENOVA GROUP videos, vlogs, and behind-the-scenes stories.",
    images: ["/golden-edition.png"],
  },
  alternates: {
    canonical: "https://www.mikenovagroup.co.tz/videos/",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

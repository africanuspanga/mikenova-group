import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Chatbot } from "@/components/chatbot"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MIKENOVA GROUP - Curated Excellence",
  description:
    "A distinctive portfolio of businesses that set a global benchmark for quality in consumer luxury, health access, specialized trade, and critical infrastructure.",
  generator: "v0.app",
  metadataBase: new URL("https://www.mikenovagroup.co.tz"),
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.mikenovagroup.co.tz",
    siteName: "MIKENOVA GROUP",
    title: "MIKENOVA GROUP - Curated Excellence",
    description:
      "A distinctive portfolio of businesses that set a global benchmark for quality in consumer luxury, health access, specialized trade, and critical infrastructure.",
    images: [
      {
        url: "/favicon.png",
        width: 1200,
        height: 630,
        alt: "MIKENOVA GROUP",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MIKENOVA GROUP - Curated Excellence",
    description:
      "A distinctive portfolio of businesses that set a global benchmark for quality in consumer luxury, health access, specialized trade, and critical infrastructure.",
    images: ["/favicon.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${montserrat.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <Chatbot />
        <Analytics />
      </body>
    </html>
  )
}

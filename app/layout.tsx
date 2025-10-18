import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Chatbot } from "@/components/chatbot"
import Script from "next/script"
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
  verification: {
    google: "0P0--FJbylHfizoCQREuyNgyfURig8g-D2qiUcCcA-8",
  },
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
      <head>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MMPKG2F7');`}
        </Script>
      </head>
      <body className={`${montserrat.variable} ${playfair.variable} font-sans antialiased`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MMPKG2F7"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
        <Chatbot />
        <Analytics />
      </body>
    </html>
  )
}

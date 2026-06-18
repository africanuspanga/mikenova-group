import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us - MIKENOVA GROUP | Get in Touch",
  description:
    "Contact MIKENOVA GROUP for inquiries about our luxury products and services. Located in Dar es Salaam, Tanzania. Email: mikenovagroup@gmail.com | Phone: +255 623 821 175",
  openGraph: {
    title: "Contact Us - MIKENOVA GROUP | Get in Touch",
    description:
      "Contact MIKENOVA GROUP for inquiries about our luxury products and services. Located in Dar es Salaam, Tanzania.",
    url: "https://www.mikenovagroup.co.tz/contact/",
    siteName: "MIKENOVA GROUP",
    type: "website",
  },
  alternates: {
    canonical: "https://www.mikenovagroup.co.tz/contact/",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}

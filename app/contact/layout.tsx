import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us - MIKENOVA GROUP | Get in Touch",
  description:
    "Contact MIKENOVA GROUP for inquiries about our luxury products and services. Located in Dar es Salaam, Tanzania. Email: info@mikenovagroup.co.tz | Phone: +255 675 622 238",
  openGraph: {
    title: "Contact Us - MIKENOVA GROUP | Get in Touch",
    description:
      "Contact MIKENOVA GROUP for inquiries about our luxury products and services. Located in Dar es Salaam, Tanzania.",
    url: "https://www.mikenovagroup.co.tz/contact",
    siteName: "MIKENOVA GROUP",
    type: "website",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}

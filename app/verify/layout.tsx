import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "HAKIKI — Thibitisha Bidhaa Yako | Verify Your Product",
  description:
    "Scan. Scratch. Hakiki. Thibitisha kuwa bidhaa yako ni halisi kwa kutumia code iliyofichwa kwenye lebo. Verify that your product is genuine using the hidden code on its security label.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "HAKIKI — Thibitisha Bidhaa Yako",
    description: "Scan. Scratch. Hakiki. Verify your product is genuine.",
    type: "website",
  },
}

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0F0E0C]">{children}</div>
}

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "HAKIKI Console",
  description: "Anti-counterfeit operations console.",
  // This console must never be indexed or previewed by a crawler.
  robots: { index: false, follow: false, nocache: true },
}

export default function VerifyAdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0F0E0C]">{children}</div>
}

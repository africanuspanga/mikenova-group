import type React from "react"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const titles: Record<string, string> = {
    "10-signs-your-skin-needs-goddess-glow": "10 Signs Your Skin Needs Goddess Glow | MIKENOVA GROUP",
    "science-behind-goddess-glow": "The Science Behind Goddess Glow Brightening Formula | MIKENOVA GROUP",
    "dark-spots-be-gone-real-stories": "Real Before & After Stories from Goddess Glow Users | MIKENOVA GROUP",
    "complete-skincare-routine-goddess-glow": "Complete Skincare Routine with Goddess Glow | MIKENOVA GROUP",
    "30-day-journey-glowing-skin": "30-Day Journey to Glowing Skin with Goddess Glow | MIKENOVA GROUP",
  }

  return {
    title: titles[params.slug] || "Blog | MIKENOVA GROUP",
    description:
      "Expert skincare advice and real transformation stories. Learn about vipodozi salama (safe cosmetics) from duka la vipodozi na urembo in Dar es Salaam.",
  }
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

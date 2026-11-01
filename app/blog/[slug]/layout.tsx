import type React from "react"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const titles: Record<string, string> = {
    "10-signs-your-skin-needs-goddess-glow": "10 Signs Your Skin Needs Goddess Glow | MIKENOVA GROUP",
    "science-behind-goddess-glow": "The Science Behind Goddess Glow Brightening Formula | MIKENOVA GROUP",
    "dark-spots-be-gone-real-stories": "Real Before & After Stories from Goddess Glow Users | MIKENOVA GROUP",
    "complete-skincare-routine-goddess-glow": "Complete Skincare Routine with Goddess Glow | MIKENOVA GROUP",
    "30-day-journey-glowing-skin": "30-Day Journey to Glowing Skin with Goddess Glow | MIKENOVA GROUP",
    "bridal-glow-mikenova": "Bridal Glow: Preparing for Your Big Day | MIKENOVA GROUP",
    "goddess-glow-vs-competitors": "Goddess Glow vs. Competitors | MIKENOVA GROUP",
    "skin-brightening-guide": "The Ultimate Skin Brightening Guide | MIKENOVA GROUP",
  }

  const canonicalUrl = `https://www.mikenovagroup.co.tz/blog/${slug}/`

  return {
    title: titles[slug] || "Blog | MIKENOVA GROUP",
    description:
      "Expert skincare advice and real transformation stories. Learn about vipodozi salama (safe cosmetics) from duka la vipodozi na urembo in Dar es Salaam.",
    openGraph: {
      title: titles[slug] || "Blog | MIKENOVA GROUP",
      description:
        "Expert skincare advice and real transformation stories from MIKENOVA GROUP.",
      url: canonicalUrl,
      siteName: "MIKENOVA GROUP",
      type: "article",
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

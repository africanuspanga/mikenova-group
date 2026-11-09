import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Hero } from "@/app/sections/hero"
import { Philosophy } from "@/app/sections/philosophy"
import { FlagshipBrand } from "@/app/sections/flagship-brand"
import { GlowCampaign } from "@/app/sections/glow-campaign"
import { ProductCollection } from "@/app/sections/product-collection"
import { ComingSoon } from "@/app/sections/coming-soon"
import { GoldenEditionPromo } from "@/app/sections/golden-edition-promo"
import { DivisionsShowcase } from "@/app/sections/divisions-showcase"
import { PartnersMarquee } from "@/app/sections/partners-marquee"
import { AuthenticityGuide } from "@/app/sections/authenticity-guide"
import { Testimonials } from "@/app/sections/testimonials"
import { CtaContact } from "@/app/sections/cta-contact"

export const metadata: Metadata = {
  title: "MIKENOVA GROUP | Luxury Conglomerate & Goddess Glow Skincare — Tanzania",
  description:
    "MIKENOVA GROUP is a Tanzanian luxury holding company with 12 specialized divisions. Discover Goddess Glow, our signature skincare brand, and explore excellence across cosmetics, fashion, furniture, pharmacy, construction, and more.",
  keywords: [
    "MIKENOVA GROUP",
    "Tanzania luxury company",
    "Goddess Glow",
    "brightening body cream Tanzania",
    "skincare Tanzania",
    "luxury cosmetics Tanzania",
    "Dar es Salaam beauty products",
    "Mikenova divisions",
    "premium skincare Africa",
  ],
  openGraph: {
    title: "MIKENOVA GROUP | Luxury Conglomerate & Goddess Glow Skincare",
    description:
      "A curated house of premium brands and services shaping Africa's future. Explore 12 divisions and shop Goddess Glow skincare.",
    url: "https://www.mikenovagroup.co.tz/",
    siteName: "MIKENOVA GROUP",
    type: "website",
    images: [
      {
        url: "/golden-edition.jpg",
        width: 1200,
        height: 675,
        alt: "MIKENOVA GROUP - Luxury Conglomerate & Goddess Glow Golden Edition",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MIKENOVA GROUP | Luxury Conglomerate & Goddess Glow Skincare",
    description:
      "A curated house of premium brands and services shaping Africa's future. Explore 12 divisions and shop Goddess Glow skincare.",
    images: ["/golden-edition.jpg"],
  },
  alternates: {
    canonical: "https://www.mikenovagroup.co.tz/",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MIKENOVA GROUP",
  url: "https://www.mikenovagroup.co.tz/",
  logo: "https://www.mikenovagroup.co.tz/logo-new.png",
  description:
    "A Tanzanian luxury holding company with 12 specialized divisions, including Goddess Glow premium skincare.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+255623821175",
    contactType: "customer service",
    areaServed: "TZ",
    availableLanguage: ["English", "Swahili"],
  },
  sameAs: [
    "https://wa.me/255623821175",
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-[#0F0E0C]">
      <Navigation />
      <Hero />
      <Philosophy />
      <FlagshipBrand />
      <GlowCampaign />
      <ProductCollection />
      <ComingSoon />
      <GoldenEditionPromo />
      <AuthenticityGuide />
      <DivisionsShowcase />
      <PartnersMarquee />
      <Testimonials />
      <CtaContact />
      <Footer />
    </main>
    </>
  )
}

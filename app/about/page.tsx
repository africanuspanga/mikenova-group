import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Eye, Award, Shield, Gem, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us - MIKENOVA GROUP | Curated Excellence in Tanzania",
  description:
    "Learn about MIKENOVA GROUP, a distinctive holding company in Tanzania with 12 specialized divisions unified by uncompromising standards of luxury, precision, and excellence across consumer goods, health, trade, and infrastructure.",
  openGraph: {
    title: "About Us - MIKENOVA GROUP | Curated Excellence in Tanzania",
    description:
      "Learn about MIKENOVA GROUP, a distinctive holding company in Tanzania with 12 specialized divisions unified by uncompromising standards of luxury, precision, and excellence.",
    url: "https://www.mikenovagroup.co.tz/about/",
    siteName: "MIKENOVA GROUP",
    type: "website",
  },
  alternates: {
    canonical: "https://www.mikenovagroup.co.tz/about/",
  },
}

export default function AboutPage() {
  const values = [
    {
      icon: Gem,
      title: "PRECISION",
      description: "Uncompromising detail in sourcing, manufacturing, and service delivery.",
    },
    {
      icon: Shield,
      title: "INTEGRITY",
      description: "Global-standard ethical conduct and financial transparency.",
    },
    {
      icon: Award,
      title: "CURATION",
      description: "Selecting only the highest quality products and partnerships.",
    },
    {
      icon: TrendingUp,
      title: "LEGACY",
      description: "Building long-term value for our clients and the communities we serve.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#1B1A17]">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#1B1A17]">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-serif text-5xl md:text-7xl text-[#F0A500] text-center mb-6">
            {"The Pursuit of Unparalleled Value."}
          </h1>
        </div>
      </section>

      {/* At a Glance */}
      <section className="py-16 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-[#F0A500] mb-8 text-center">
              {"MIKENOVA AT A GLANCE"}
            </h2>
            <p className="text-lg text-[#1B1A17] leading-relaxed text-center">
              {
                "MIKENOVA GROUP is a holding company with roots in Tanzania, defined by a meticulously curated approach to market engagement. We transcend typical business models by integrating 12 specialized divisions under a single, unwavering standard of luxury and precision—the MNG standard."
              }
            </p>
            <p className="mt-8 text-base text-[#1B1A17]/75 leading-relaxed text-center">
              All official{" "}
              <a href="https://www.cvchapchap.com/ats-cv-checker" style={{ color: "inherit", textDecoration: "none" }}>
                recruitment
              </a>{" "}
              and career opportunities across the MIKENOVA GROUP divisions are published on this website, our official
              website.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-[#1B1A17]">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="font-serif text-4xl md:text-5xl text-[#F0A500] text-center mb-16">{"Our Core Commitment."}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Mission */}
            <Card className="bg-[#252320] border-[#F0A500]">
              <CardContent className="p-10">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="h-8 w-8 text-[#F0A500]" />
                  <h3 className="font-serif text-2xl text-[#F0A500]">Our Mission</h3>
                </div>
                <p className="font-serif text-xl text-[#FAFAF8] mb-4 uppercase tracking-wide">
                  {"TO CURATE EXCELLENCE AND DELIVER UNPARALLELED VALUE."}
                </p>
                <p className="text-[#A8A6A1] leading-relaxed italic">
                  {
                    "Our mission is to establish a distinctive portfolio of businesses that set a global benchmark for quality in consumer luxury, health access, specialized trade, and critical infrastructure, while generating superior, sustainable returns."
                  }
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="bg-[#252320] border-[#F0A500]">
              <CardContent className="p-10">
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="h-8 w-8 text-[#F0A500]" />
                  <h3 className="font-serif text-2xl text-[#F0A500]">Our Vision</h3>
                </div>
                <p className="font-serif text-xl text-[#FAFAF8] mb-4 uppercase tracking-wide">
                  {"TO BE THE DEFINITIVE STANDARD OF A DIVERSIFIED LUXURY HOLDING GROUP IN AFRICA."}
                </p>
                <p className="text-[#A8A6A1] leading-relaxed italic">
                  {
                    "Our vision is to be globally recognized as the integrated group whose uncompromising standards and curated offerings redefine industry leadership and enhance the lives of our discerning clientele."
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="font-serif text-4xl md:text-5xl text-[#F0A500] text-center mb-16">
            {"The Pillars of Distinction."}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card
                  key={index}
                  className="bg-white border-[#D4D2CC] hover:border-[#F0A500] transition-all duration-300"
                >
                  <CardContent className="p-8 text-center">
                    <Icon className="h-12 w-12 text-[#F0A500] mx-auto mb-4" />
                    <h3 className="font-serif text-xl text-[#F0A500] mb-3 tracking-wider">{value.title}</h3>
                    <p className="text-[#1B1A17] text-sm leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 bg-[#1B1A17]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-5xl text-[#F0A500] mb-6">Ready to Experience Excellence?</h2>
            <p className="text-lg text-[#A8A6A1] mb-10 leading-relaxed">
              Connect with us to discover how MIKENOVA GROUP can elevate your business or lifestyle.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#F0A500] text-[#1B1A17] hover:bg-[#F0A500]/90 font-medium tracking-wider text-lg px-10 py-6 transition-all duration-300 hover:scale-105"
            >
              <Link href="/contact/">
                CONTACT US
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

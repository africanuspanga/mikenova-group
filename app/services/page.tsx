import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Services - MIKENOVA GROUP | 12 Divisions of Excellence",
  description:
    "Explore MIKENOVA GROUP's 12 specialized divisions: Luxury Cosmetics, Fashion, Furniture, Pharmacy, Civil Engineering, Electrical & ICT, Real Estate, Logistics, Industrial Trade, Agribusiness, Vintage Vehicles, and Timber Supply.",
  openGraph: {
    title: "Our Services - MIKENOVA GROUP | 12 Divisions of Excellence",
    description:
      "Explore MIKENOVA GROUP's 12 specialized divisions offering luxury cosmetics, fashion, furniture, pharmacy services, construction, real estate, logistics, and more.",
    url: "https://www.mikenovagroup.co.tz/services",
    siteName: "MIKENOVA GROUP",
    type: "website",
  },
}

export default function ServicesPage() {
  const services = [
    {
      number: "01",
      title: "Luxury Cosmetics & Beauty Services",
      description:
        "We are the exclusive purveyor of premium beauty. Our service encompasses the import, supply, and retail of high-end cosmetics, skincare lines, and signature perfumes. Beyond product curation, we own and operate sophisticated personal care outlets and private salons, offering clientele a discreet, luxurious experience focused on wellness and personalized attention. We define the standard for African luxury beauty, ensuring every product and service adheres to global prestige benchmarks.",
      image: "/services/spa-salon-service.jpg",
    },
    {
      number: "02",
      title: "High-End Fashion & Accessories",
      description:
        "This division is dedicated to the curation and distribution of high-quality women's apparel, designer handbags, and elegant footwear. We establish specialized boutiques and exclusive online stores, creating a seamless retail experience for the discerning customer. We focus on selecting pieces defined by superior craftsmanship, rare materials, and timeless design. Our mission is to outfit the modern executive with accessories and clothing that speak to success, confidence, and quiet luxury.",
      image: "/services/fashion-boutique.jpg",
    },
    {
      number: "03",
      title: "Home Furniture & Interior Décor",
      description:
        "We offer full-cycle services in manufacturing, importing, and supplying sophisticated furniture for both residential and executive office spaces. Our expertise extends to providing high-grade interior decoration materials and home décor. Every piece is sourced or crafted with an emphasis on durability, material quality, and contemporary design, transforming spaces into environments that reflect prestige and professional excellence. We handle everything from large corporate fit-outs to bespoke home commissions.",
      image: "/services/furniture-showroom.jpg",
    },
    {
      number: "04",
      title: "Comprehensive Pharmacy Services",
      description:
        "MIKENOVA ensures crucial access to high-standard medication. We establish and operate licensed retail and wholesale pharmacies and dispensaries, specializing in the regulated supply of human medicines, essential medical supplies, and advanced healthcare products. Our service is built on integrity, guaranteeing the quality, authenticity, and effective distribution of every item. We partner with trusted global suppliers to maintain the highest level of reliability and clinical support for the communities we serve.",
      image: "/services/pharmacy-counter.jpg",
    },
    {
      number: "05",
      title: "Civil Engineering & Construction",
      description:
        "We are a foundational player in infrastructure development, offering services from the conceptual design phase through to construction, maintenance, and major structural improvements. Our scope covers all branches of civil engineering, including commercial buildings, residential complexes, and public infrastructure projects. We utilize specialized teams and advanced project management methodologies to deliver structures defined by architectural vision, engineered precision, and long-term durability, shaping Africa's urban landscape.",
      image: "/services/construction-site.webp",
    },
    {
      number: "06",
      title: "Electrical & ICT Contracting",
      description:
        "This division provides critical technology and power infrastructure solutions. Our service includes the design, installation, maintenance, and repair of complex electrical systems for large-scale commercial, industrial, and residential projects. Additionally, we provide full-service ICT solutions, covering software development, networking, hardware support, and system implementation. We ensure that our clients' operations are powered efficiently and connected securely with state-of-the-art technology.",
      image: "/services/technology-infrastructure.jpg",
    },
    {
      number: "07",
      title: "Real Estate & Property Management",
      description:
        "Our services cover the entire property lifecycle, including strategic land acquisition, development, long-term leasing, and comprehensive management of real estate portfolios. We focus on creating high-value commercial and residential assets that offer superior returns and exceptional quality of life. We are dedicated to maximizing the value of every property through meticulous oversight, strategic investment, and responsive management, establishing MIKENOVA as a trusted name in property investment.",
      image: "/services/real-estate-property.jpg",
    },
    {
      number: "08",
      title: "Logistics, Transport & Supply Chain",
      description:
        "We offer secure and efficient logistics, warehousing, and transportation services for materials and products of all kinds. Our integrated approach includes clearing and forwarding, specialized cargo handling, and dedicated counter services for parcels and packages across land, sea, and air. We manage complex supply chains with precision, ensuring timely and secure delivery, minimizing operational risk, and providing a seamless link between global markets and local consumers.",
      image: "/services/logistics-warehouse.jpg",
    },
    {
      number: "09",
      title: "General & Industrial Trade",
      description:
        "MIKENOVA acts as a major hub for essential industrial and retail supplies. We are importers, exporters, distributors, and wholesalers of general merchandise, including hardware, specialized building materials, industrial tools, and essential equipment. We serve a vast client base, including government offices, factories, hospitals, and construction firms, guaranteeing the quality and scale necessary to support large-scale industrial and commercial operations across the region.",
      image: "/services/industrial-supplies.png",
    },
    {
      number: "10",
      title: "Health Food & Agribusiness",
      description:
        "This division focuses on the integrity of our food supply chain. We engage in the purchasing, processing, packaging, and trade of high-quality food grains, cereals, pulses, and related agricultural products. Our services also extend to the supply and distribution of agro-chemicals, specialized seeds, and fertilizers, supporting sustainable farming and ensuring food security. We connect local production to regional markets under rigorous quality control standards.",
      image: "/services/agriculture-import.jpg",
    },
    {
      number: "11",
      title: "Vintage Vehicle Trade & Restoration",
      description:
        "A highly specialized service dedicated to sourcing, importing, purchasing, restoring, and selling classic and vintage motor vehicles. We offer tailored maintenance, vehicle customization, and support for high-profile exhibitions. This division caters to collectors and enthusiasts, providing expert care and authentication to preserve the legacy and value of these iconic automobiles. Our service ensures that every vintage vehicle meets a superior standard of engineering and aesthetic perfection.",
      image: "/services/vintage-car.jpg",
    },
    {
      number: "12",
      title: "Timber & Wood Product Supply",
      description:
        "We manage the ethical trade, processing, and supply of high-quality timber, logs, and various wood products used for furniture manufacturing, construction, and specialized industrial applications. We ensure sustainable sourcing practices while providing reliable access to materials known for their durability and aesthetic value. This division is crucial in supporting both our internal furniture manufacturing needs and the external construction market with premium resources.",
      image: "/services/wood-lumber.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-[#1B1A17]">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#1B1A17]">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#F0A500] text-center mb-6 text-balance">
            12 Divisions. One Standard: Excellence.
          </h1>
          <p className="text-lg text-[#A8A6A1] text-center max-w-4xl mx-auto leading-relaxed">
            Our twelve specialized divisions operate with absolute precision, unified by the MIKENOVA standard of
            uncompromising quality, delivering excellence across every sector we engage in.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <Card
                key={index}
                className="bg-white border-[#D4D2CC] hover:border-[#F0A500] hover:shadow-2xl transition-all duration-500 overflow-hidden group"
              >
                <CardContent className="p-0">
                  {/* Image Container */}
                  <div className="aspect-[16/9] bg-white flex items-center justify-center relative overflow-hidden">
                    {service.image ? (
                      <Image
                        src={service.image || "/placeholder.svg"}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1B1A17] via-[#252320] to-[#2A2926]" />
                        <div className="absolute inset-0 bg-[#F0A500]/5 group-hover:bg-[#F0A500]/10 transition-colors duration-500" />
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-4 right-4 w-32 h-32 border border-[#F0A500]/20 rounded-full" />
                          <div className="absolute bottom-4 left-4 w-24 h-24 border border-[#F0A500]/20 rounded-full" />
                        </div>
                        <div className="relative z-10 text-center">
                          <div className="text-[#F0A500] text-6xl font-serif mb-2">{service.number}</div>
                          <p className="text-[#A8A6A1] text-xs tracking-widest">SERVICE IMAGE</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h3 className="font-serif text-2xl text-[#F0A500] mb-4 text-balance group-hover:text-[#F0A500]/90 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-[#1B1A17] leading-relaxed text-sm">{service.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#1B1A17]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-5xl text-[#F0A500] mb-6">Interested in Our Services?</h2>
            <p className="text-lg text-[#A8A6A1] mb-10 leading-relaxed">
              Let us know how we can serve you with our specialized divisions and unmatched expertise.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#F0A500] text-[#1B1A17] hover:bg-[#F0A500]/90 font-medium tracking-wider text-lg px-10 py-6 transition-all duration-300 hover:scale-105"
            >
              <Link href="/contact">
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

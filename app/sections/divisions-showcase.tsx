"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { SectionLabel } from "@/app/components/animation/section-label"

const divisions = [
  {
    number: "01",
    title: "Luxury Cosmetics & Beauty Services",
    description: "Premium beauty, skincare, and signature salon experiences.",
    image: "/services/spa-salon-service.jpg",
  },
  {
    number: "02",
    title: "High-End Fashion & Accessories",
    description: "Curated designer apparel, handbags, and footwear.",
    image: "/services/fashion-boutique.jpg",
  },
  {
    number: "03",
    title: "Home Furniture & Interior Décor",
    description: "Sophisticated furnishings and interior solutions.",
    image: "/services/furniture-showroom.jpg",
  },
  {
    number: "04",
    title: "Comprehensive Pharmacy Services",
    description: "Licensed retail and wholesale pharmaceutical supply.",
    image: "/services/pharmacy-counter.webp",
  },
  {
    number: "05",
    title: "Civil Engineering & Construction",
    description: "Commercial, residential, and infrastructure development.",
    image: "/services/construction-site.webp",
  },
  {
    number: "06",
    title: "Electrical & ICT Contracting",
    description: "Power systems, networking, and software solutions.",
    image: "/services/technology-infrastructure.jpg",
  },
  {
    number: "07",
    title: "Real Estate & Property Management",
    description: "Land acquisition, development, leasing, and management.",
    image: "/services/real-estate-property.jpg",
  },
  {
    number: "08",
    title: "Logistics, Transport & Supply Chain",
    description: "Secure warehousing, clearing, and cargo handling.",
    image: "/services/logistics-warehouse.jpg",
  },
  {
    number: "09",
    title: "General & Industrial Trade",
    description: "Import, export, and distribution of industrial supplies.",
    image: "/services/industrial-supplies.webp",
  },
  {
    number: "10",
    title: "Health Food & Agribusiness",
    description: "Quality grains, pulses, seeds, and agro-inputs.",
    image: "/services/agriculture-import.jpg",
  },
  {
    number: "11",
    title: "Vintage Vehicle Trade & Restoration",
    description: "Classic car sourcing, restoration, and exhibition support.",
    image: "/services/vintage-car.jpg",
  },
  {
    number: "12",
    title: "Timber & Wood Product Supply",
    description: "Sustainable timber trade for furniture and construction.",
    image: "/services/wood-lumber.jpg",
  },
]

export function DivisionsShowcase() {
  return (
    <section id="divisions" className="py-24 sm:py-32 lg:py-40 bg-[#0F0E0C] overflow-hidden noise-overlay">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
          <SectionLabel color="gold" className="mb-6">
            Our Divisions
          </SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FAFAF8] mb-6 leading-[1.1]"
          >
            12 Divisions. One Standard.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[#A8A6A1] text-base sm:text-lg leading-relaxed"
          >
            From beauty to infrastructure, every MIKENOVA division shares an uncompromising commitment to excellence.
          </motion.p>
        </div>

        {/* Horizontal Scroll on Mobile / Grid on Desktop */}
        <div className="flex lg:grid lg:grid-cols-4 gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible pb-6 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-proximity">
          {divisions.map((division, index) => (
            <motion.div
              key={division.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: (index % 4) * 0.1, ease: [0.4, 0, 0.2, 1] }}
              className="flex-shrink-0 w-[280px] lg:w-auto snap-start"
            >
              <Link href="/services/" className="group block h-full">
                <div className="relative h-[420px] lg:h-[480px] overflow-hidden bg-[#1B1A17] border border-[#3A3835] hover:border-[#F0A500]/50 transition-colors duration-500">
                  <Image
                    src={division.image || "/placeholder.svg"}
                    alt={division.title}
                    fill
                    sizes="(max-width: 1024px) 280px, 25vw"
                    className="object-cover opacity-75 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0C] via-[#0F0E0C]/50 to-transparent" />

                  {/* Number */}
                  <div className="absolute top-6 right-6 font-serif text-6xl lg:text-7xl text-[#FAFAF8]/10 group-hover:text-[#F0A500]/20 transition-colors duration-500">
                    {division.number}
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                    <div className="w-10 h-px bg-[#F0A500] mb-4 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    <h3 className="font-serif text-lg lg:text-xl text-[#FAFAF8] mb-3 group-hover:text-[#F0A500] transition-colors duration-300 leading-tight">
                      {division.title}
                    </h3>
                    <p className="text-[#A8A6A1] text-sm leading-relaxed mb-4 line-clamp-2">
                      {division.description}
                    </p>
                    <span className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-[#F0A500] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore
                      <ArrowRight className="ml-2 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

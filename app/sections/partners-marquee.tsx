"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { SectionLabel } from "@/app/components/animation/section-label"

const brandPartners = [
  { src: "/brands/tommy-hilfiger.png", alt: "Tommy Hilfiger" },
  { src: "/brands/hm.png", alt: "H&M" },
  { src: "/brands/chanel.png", alt: "Chanel" },
  { src: "/brands/sephora.png", alt: "Sephora" },
  { src: "/brands/gucci.png", alt: "Gucci" },
  { src: "/brands/loreal.png", alt: "L'Oréal" },
  { src: "/brands/hermes.png", alt: "Hermès" },
  { src: "/brands/zara.png", alt: "Zara" },
  { src: "/brands/deldar.webp", alt: "Deldar" },
  { src: "/brands/orca.png", alt: "Orca" },
  { src: "/brands/empress-furniture.jpg", alt: "Empress Furniture" },
  { src: "/brands/palmers.jpg", alt: "Palmer's" },
  { src: "/brands/istikbal.png", alt: "İstikbal" },
  { src: "/brands/cerave.png", alt: "CeraVe" },
  { src: "/brands/la-roche-posay.png", alt: "La Roche-Posay" },
]

export function PartnersMarquee() {
  // Duplicate for seamless loop
  const allPartners = [...brandPartners, ...brandPartners]

  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-[#FAFAF8] overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 mb-12 lg:mb-16">
        <div className="text-center max-w-3xl mx-auto">
          <SectionLabel color="dark" className="mb-6">
            Trusted By Global Names
          </SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1B1A17] leading-[1.2]"
          >
            Brands We Partner With
          </motion.h2>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-[#FAFAF8] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-[#FAFAF8] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee">
          {allPartners.map((brand, index) => (
            <div
              key={`${brand.alt}-${index}`}
              className="flex-shrink-0 mx-10 sm:mx-14 lg:mx-20 h-20 sm:h-24 w-32 sm:w-40 relative flex items-center justify-center transition-all duration-500 opacity-85 hover:opacity-100"
            >
              <Image
                src={brand.src}
                alt={brand.alt}
                fill
                sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 200px"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

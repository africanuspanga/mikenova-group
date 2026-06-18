"use client"

import { motion } from "framer-motion"
import { SectionLabel } from "@/app/components/animation/section-label"
import { AnimatedWords } from "@/app/components/animation/animated-text"
import { GoldLine } from "@/app/components/animation/gold-line"

export function Philosophy() {
  const paragraphs = [
    {
      title: "Rooted in Tanzania",
      text: "Born in Dar es Salaam, MIKENOVA GROUP was founded on a singular belief: that African consumers deserve access to world-class products and services without compromise. What began as a vision has grown into a diversified house of excellence spanning luxury cosmetics, fashion, furniture, pharmacy, construction, and beyond.",
    },
    {
      title: "The MNG Standard",
      text: "Precision, curation, integrity, and legacy are not just values—they are our operating system. Every division, every partnership, and every product is measured against one unwavering standard: does it elevate the lives of those we serve?",
    },
    {
      title: "A House of Brands",
      text: "From the radiant formulations of Goddess Glow to the engineered precision of our construction and ICT divisions, MIKENOVA GROUP unites distinct businesses under one promise: uncompromising quality, delivered with African pride and global ambition.",
    },
  ]

  return (
    <section className="relative py-24 sm:py-32 lg:py-40 bg-[#FAFAF8] overflow-hidden">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[8rem] sm:text-[12rem] lg:text-[28rem] font-serif text-[#1B1A17]/[0.03] tracking-tight whitespace-nowrap">
          MIKENOVA
        </span>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <SectionLabel color="dark" className="mb-6">
              Our Philosophy
            </SectionLabel>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1B1A17] leading-[1.1] mb-8">
              <AnimatedWords text="We do not trade products. We curate standards." />
            </h2>
            <GoldLine width="100px" />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 lg:pl-12 lg:border-l border-[#1B1A17]/10">
            <div className="space-y-12 lg:space-y-16">
              {paragraphs.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: [0.4, 0, 0.2, 1] }}
                >
                  <h3 className="font-serif text-xl sm:text-2xl text-[#1B1A17] mb-4">
                    {item.title}
                  </h3>
                  <p className="text-[#6B6A67] text-base sm:text-lg leading-[1.8]">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionLabel } from "@/app/components/animation/section-label"
import { MagneticButton } from "@/app/components/animation/magnetic-button"

export function GoldenEditionPromo() {
  return (
    <section className="relative min-h-[80vh] sm:min-h-[700px] lg:min-h-[750px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/golden-edition.png"
          alt="Goddess Glow Golden Edition"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0E0C]/95 via-[#0F0E0C]/70 to-[#0F0E0C]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0C]/80 via-transparent to-[#0F0E0C]/50" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10 py-20 sm:py-24">
        <div className="max-w-2xl">
          <SectionLabel color="gold" className="mb-6">
            New Arrival
          </SectionLabel>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#FAFAF8] mb-4 leading-[1.05]"
          >
            Goddess Glow
            <br />
            <span className="text-[#F0A500]">Golden Edition</span>
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-24 h-px bg-gradient-to-r from-[#F0A500] to-[#D4AF37] mb-6 origin-left"
          />

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-[#FAFAF8]/90 text-lg sm:text-xl font-light mb-4"
          >
            Elevate your glow with our most luxurious formula yet.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[#A8A6A1] text-base sm:text-lg leading-relaxed mb-10 max-w-lg"
          >
            A richer, more radiant finish for those who demand the very best in skincare.
            Limited quantities available.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <MagneticButton>
              <Button
                asChild
                size="lg"
                className="bg-[#F0A500] text-[#0F0E0C] hover:bg-[#F0A500]/90 font-semibold text-xs sm:text-sm uppercase tracking-[0.15em] px-8 sm:px-10 py-6 sm:py-7 transition-all duration-300 shadow-[0_0_40px_rgba(240,165,0,0.3)] touch-manipulation"
              >
                <Link href="/goddess-glow/">
                  <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Buy Now
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-[#FAFAF8]/40 text-[#FAFAF8] hover:bg-[#FAFAF8]/10 hover:border-[#FAFAF8]/60 font-semibold text-xs sm:text-sm uppercase tracking-[0.15em] px-8 sm:px-10 py-6 sm:py-7 transition-all duration-300 touch-manipulation"
              >
                <Link href="/goddess-glow/">View Collection</Link>
              </Button>
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      {/* Limited Edition badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="hidden lg:block absolute top-28 right-8 z-10 bg-[#F0A500] text-[#0F0E0C] px-5 py-3 shadow-2xl"
      >
        <span className="text-xs font-bold uppercase tracking-[0.2em] block">Limited Edition</span>
        <span className="text-sm font-serif">Golden Collection</span>
      </motion.div>
    </section>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionLabel } from "@/app/components/animation/section-label"
import { MagneticButton } from "@/app/components/animation/magnetic-button"
import { useIsMobile } from "@/app/hooks/use-mobile"

export function FlagshipBrand() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? ["0%", "0%"] : ["-5%", "5%"]
  )

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 lg:py-40 bg-[#0F0E0C] overflow-hidden noise-overlay"
    >
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            className="lg:col-span-7 relative"
          >
            <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] overflow-hidden">
              <motion.div style={{ y: imageY }} className="absolute inset-[-10%] w-[120%] h-[120%] will-change-transform">
                <Image
                  src="/goddess-glow/hero-beach.png"
                  alt="Goddess Glow - Signature Skincare Brand"
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0C]/60 via-transparent to-[#0F0E0C]/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F0E0C]/30 to-transparent" />
            </div>

            {/* Floating product thumbnails */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:flex absolute -right-8 bottom-20 gap-3"
            >
              {[
                "/New Goddess Glow.PNG",
                "/goddess-glow/body-oil-hero.jpeg",
                "/goddess-glow/bar-soap-1.jpeg",
              ].map((src, index) => (
                <motion.div
                  key={src}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-20 h-20 border border-[#F0A500]/30 overflow-hidden shadow-2xl"
                >
                  <Image
                    src={src}
                    alt={`Goddess Glow product ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Content Column */}
          <div className="lg:col-span-5">
            <SectionLabel color="gold" className="mb-6">
              Signature Brand
            </SectionLabel>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#FAFAF8] mb-4 leading-[1]">
              Goddess
              <br />
              <span className="text-[#F0A500]">Glow</span>
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-24 h-px bg-gradient-to-r from-[#F0A500] to-[#D4AF37] mb-8 origin-left"
            />

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl sm:text-2xl text-[#FAFAF8]/90 font-light mb-6"
            >
              Radiance, perfected.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-[#A8A6A1] text-base sm:text-lg leading-[1.8] mb-10 max-w-md"
            >
              Our flagship skincare line blends dermatologist-approved formulas with the
              confidence of African beauty. Trusted by thousands, Goddess Glow reveals smooth,
              even, radiant skin — one ritual at a time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <MagneticButton>
                <Button
                  asChild
                  size="lg"
                  className="bg-[#F0A500] text-[#0F0E0C] hover:bg-[#F0A500]/90 font-semibold text-xs sm:text-sm uppercase tracking-[0.15em] px-8 sm:px-10 py-6 sm:py-7 transition-all duration-300 shadow-[0_0_40px_rgba(240,165,0,0.25)] touch-manipulation"
                >
                  <Link href="/goddess-glow/">
                    Shop the Collection
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

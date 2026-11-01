"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MagneticButton } from "@/app/components/animation/magnetic-button"
import { useIsMobile } from "@/app/hooks/use-mobile"

export function CtaContact() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const backgroundY = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? ["0%", "0%"] : ["0%", "20%"]
  )

  return (
    <section
      ref={sectionRef}
      className="relative py-32 sm:py-40 lg:py-52 overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-[-10%] w-[120%] h-[120%] will-change-transform">
        <Image
          src="/goddess-glow/luxury-horse.webp"
          alt="MIKENOVA Group - Experience Excellence"
          fill
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-[#0F0E0C]/75" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0C] via-transparent to-[#0F0E0C]/50" />

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[#FAFAF8] mb-6 leading-[1.1]"
          >
            Experience the
            <br />
            <span className="text-[#F0A500]">MIKENOVA Standard</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[#FAFAF8]/80 text-base sm:text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto"
          >
            Whether you are shopping Goddess Glow or exploring a partnership with one of our divisions, we are here to deliver excellence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <MagneticButton>
              <Button
                asChild
                size="lg"
                className="bg-[#F0A500] text-[#0F0E0C] hover:bg-[#F0A500]/90 font-semibold text-xs sm:text-sm uppercase tracking-[0.15em] px-8 sm:px-10 py-6 sm:py-7 transition-all duration-300 shadow-[0_0_40px_rgba(240,165,0,0.25)] touch-manipulation"
              >
                <Link href="/goddess-glow/">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-[#FAFAF8]/30 text-[#FAFAF8] hover:bg-[#FAFAF8]/5 hover:border-[#FAFAF8]/50 font-semibold text-xs sm:text-sm uppercase tracking-[0.15em] px-8 sm:px-10 py-6 sm:py-7 transition-all duration-300 touch-manipulation"
              >
                <Link href="/contact/">Get in Touch</Link>
              </Button>
            </MagneticButton>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

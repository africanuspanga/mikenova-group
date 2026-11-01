"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Check, Award, AlertTriangle } from "lucide-react"
import { SectionLabel } from "@/app/components/animation/section-label"
import { Button } from "@/components/ui/button"

const originalPoints = [
  "Gold band is embossed with repeated 'GODDESS GLOW' lettering.",
  "Text spacing is generous, even, and professionally aligned.",
  "Font is bold, premium, and clearly printed.",
  "Logo is large, crisp, and perfectly centered.",
  "Jar is heavy, durable, and made with thick premium plastic.",
  "Volume text, letters, and spacing are accurate and consistent.",
]

const warningPoints = [
  "Fake products may cause skin irritation or no results at all.",
  "Counterfeits are often sold at unusually low prices.",
  "Always check the gold band embossing before purchase.",
]

interface AuthenticityGuideProps {
  className?: string
}

export function AuthenticityGuide({ className = "" }: AuthenticityGuideProps) {
  return (
    <section className={`py-24 sm:py-32 lg:py-40 bg-[#FAFAF8] ${className}`}>
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
          <SectionLabel color="dark" className="mb-6">
            Authenticity First
          </SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1B1A17] mb-6 leading-[1.1]"
          >
            Only the Original Protects Your Skin
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[#6B6A67] text-base sm:text-lg leading-relaxed"
          >
            Counterfeit Goddess Glow products are circulating. This is how to recognize the authentic product and shop with confidence.
          </motion.p>
        </div>

        {/* Main Authentic Product Feature */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto mb-16 lg:mb-24">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-square bg-white border border-[#F0A500]/20 p-8 sm:p-12 flex items-center justify-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F0A500] to-[#D4AF37]" />
              <Image
                src="/OG.webp"
                alt="Authentic Goddess Glow Body Cream"
                fill
                className="object-contain p-8 sm:p-12"
              />
            </div>
            {/* Authentic badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#F0A500] text-[#0F0E0C] px-6 py-2 flex items-center gap-2 shadow-xl">
              <Award className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">100% Authentic</span>
            </div>
          </motion.div>

          {/* Checklist */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h3 className="font-serif text-2xl sm:text-3xl text-[#1B1A17] mb-8">
              How to Spot the Original
            </h3>
            <ul className="space-y-5 mb-10">
              {originalPoints.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-[#F0A500]/10 flex items-center justify-center mt-0.5">
                    <Check className="h-4 w-4 text-[#F0A500]" />
                  </div>
                  <span className="text-[#1B1A17]/80 text-base sm:text-lg leading-relaxed">{point}</span>
                </motion.li>
              ))}
            </ul>

            <Button
              asChild
              className="bg-[#F0A500] text-[#0F0E0C] hover:bg-[#F0A500]/90 font-semibold text-xs uppercase tracking-[0.15em] px-8 py-6 transition-all duration-300 shadow-[0_0_30px_rgba(240,165,0,0.2)] touch-manipulation"
            >
              <Link href="/goddess-glow/">Shop Authentic Goddess Glow</Link>
            </Button>
          </motion.div>
        </div>

        {/* Warning Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto bg-[#E53935]/5 border border-[#E53935]/20 p-8 sm:p-10"
        >
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle className="h-6 w-6 text-[#E53935] flex-shrink-0" />
            <h4 className="font-serif text-xl sm:text-2xl text-[#E53935]">Avoid Counterfeits</h4>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {warningPoints.map((point, index) => (
              <li key={index} className="text-[#1B1A17]/70 text-sm sm:text-base leading-relaxed">
                {point}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Trust Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mt-16 lg:mt-20"
        >
          <p className="text-[#6B6A67] text-base sm:text-lg leading-relaxed">
            Always purchase Goddess Glow products from{" "}
            <Link href="/goddess-glow/" className="text-[#F0A500] hover:underline font-medium">
              our official store
            </Link>{" "}
            or authorized MIKENOVA retailers to guarantee authenticity and safety.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

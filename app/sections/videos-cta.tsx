"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Youtube, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function VideosCta() {
  return (
    <section className="relative py-32 sm:py-40 lg:py-52 overflow-hidden bg-[#0F0E0C]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F0A500]/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0C] via-transparent to-[#0F0E0C]/50" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[#FAFAF8] mb-6 leading-[1.1]"
          >
            Never Miss a
            <br />
            <span className="text-[#F0A500]">New Episode</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[#FAFAF8]/80 text-base sm:text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto"
          >
            Subscribe to our YouTube channel for exclusive drops, behind-the-scenes access, and the latest from MIKENOVA GROUP.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Button
              asChild
              size="lg"
              className="bg-[#F0A500] text-[#0F0E0C] hover:bg-[#F0A500]/90 font-semibold text-xs sm:text-sm uppercase tracking-[0.15em] px-8 sm:px-10 py-6 sm:py-7 transition-all duration-300 shadow-[0_0_40px_rgba(240,165,0,0.25)] touch-manipulation"
            >
              <Link href="https://www.youtube.com/channel/UCKOCG6Ayd4dtHMR7izgTG2Q" target="_blank" rel="noopener noreferrer">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Subscribe Now
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[#FAFAF8]/30 text-[#FAFAF8] hover:bg-[#FAFAF8]/5 hover:border-[#FAFAF8]/50 font-semibold text-xs sm:text-sm uppercase tracking-[0.15em] px-8 sm:px-10 py-6 sm:py-7 transition-all duration-300 touch-manipulation"
            >
              <Link href="/contact/">Get in Touch</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

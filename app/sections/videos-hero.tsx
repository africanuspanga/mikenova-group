"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Youtube, ChevronDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { YouTubeVideo } from "@/lib/youtube"

interface VideosHeroProps {
  featuredVideo?: YouTubeVideo
}

export function VideosHero({ featuredVideo }: VideosHeroProps) {
  return (
    <section className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {featuredVideo ? (
          <Image
            src={featuredVideo.thumbnail}
            alt={featuredVideo.title}
            fill
            className="object-cover opacity-40"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B1A17] via-[#0F0E0C] to-[#1B1A17]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0E0C]/90 via-[#0F0E0C]/70 to-[#0F0E0C]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F0A500]/10 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-[#FAFAF8]/70">
              <span className="h-px w-8 sm:w-12 bg-[#F0A500]" />
              MIKENOVA TV
              <span className="h-px w-8 sm:w-12 bg-[#F0A500]" />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[100px] text-[#FAFAF8] mb-8 leading-[0.95] tracking-tight"
          >
            Stories,
            <br />
            <span className="text-[#F0A500]">Vlogs &amp; Vision</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl text-[#FAFAF8]/80 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Step inside MIKENOVA GROUP. Exclusive behind-the-scenes moments, Goddess Glow features, and the people shaping our vision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <Button
              asChild
              size="lg"
              className="bg-[#F0A500] text-[#0F0E0C] hover:bg-[#F0A500]/90 font-semibold text-xs sm:text-sm uppercase tracking-[0.15em] px-8 sm:px-10 py-6 sm:py-7 transition-all duration-300 shadow-[0_0_40px_rgba(240,165,0,0.25)] touch-manipulation"
            >
              <Link href="https://www.youtube.com/channel/UCKOCG6Ayd4dtHMR7izgTG2Q" target="_blank" rel="noopener noreferrer">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Subscribe on YouTube
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[#FAFAF8]/30 text-[#FAFAF8] hover:bg-[#FAFAF8]/5 hover:border-[#FAFAF8]/50 font-semibold text-xs sm:text-sm uppercase tracking-[0.15em] px-8 sm:px-10 py-6 sm:py-7 transition-all duration-300 touch-manipulation"
            >
              <Link href="#videos">
                Watch Episodes
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#FAFAF8]/50">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5 text-[#F0A500]/70" />
        </motion.div>
      </motion.div>
    </section>
  )
}

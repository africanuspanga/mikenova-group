import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { fetchChannelVideos } from "@/lib/youtube"
import { VideosGrid } from "@/app/sections/videos-grid"
import { Play, Youtube, ChevronDown, ArrowRight, Film } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"

export const dynamic = "force-dynamic"

export default async function VideosPage() {
  const { videos, error } = await fetchChannelVideos()
  const featuredVideo = videos[0]
  const remainingVideos = videos.slice(1)

  return (
    <main className="min-h-screen bg-[#0F0E0C]">
      <Navigation />

      {/* Hero Section */}
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

      {/* Featured Video Section */}
      {featuredVideo && (
        <section className="relative py-24 sm:py-32 lg:py-40 bg-[#0F0E0C] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F0A500]/5 via-transparent to-transparent pointer-events-none" />

          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
              <span className="inline-flex items-center gap-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-[#F0A500] mb-6">
                <span className="h-px w-8 sm:w-12 bg-[#F0A500]" />
                Featured Episode
                <span className="h-px w-8 sm:w-12 bg-[#F0A500]" />
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FAFAF8] leading-[1.1]">
                Latest from the Channel
              </h2>
            </div>

            <VideosGrid videos={[featuredVideo]} featured />
          </div>
        </section>
      )}

      {/* All Videos Grid */}
      <section id="videos" className="py-24 sm:py-32 lg:py-40 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
            <span className="inline-flex items-center gap-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-[#F0A500] mb-6">
              <span className="h-px w-8 sm:w-12 bg-[#F0A500]" />
              All Episodes
              <span className="h-px w-8 sm:w-12 bg-[#F0A500]" />
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1B1A17] mb-6 leading-[1.1]">
              Watch <span className="text-[#F0A500]">Everything</span>
            </h2>

            <p className="text-[#6B6A67] text-base sm:text-lg leading-relaxed">
              Every video from MIKENOVA GROUP, curated in one place.
            </p>
          </div>

          {error ? (
            <div className="text-center py-16 sm:py-24">
              <Film className="w-12 h-12 sm:w-16 sm:h-16 text-[#1B1A17]/20 mx-auto mb-4" />
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1B1A17] mb-3">
                Videos Unavailable
              </h2>
              <p className="text-[#6B6A67] text-sm sm:text-base max-w-md mx-auto">
                {error}
              </p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16 sm:py-24">
              <Film className="w-12 h-12 sm:w-16 sm:h-16 text-[#1B1A17]/20 mx-auto mb-4" />
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1B1A17] mb-3">
                No Videos Yet
              </h2>
              <p className="text-[#6B6A67] text-sm sm:text-base max-w-md mx-auto">
                Check back soon for the latest MIKENOVA stories and updates.
              </p>
            </div>
          ) : (
            <VideosGrid videos={featuredVideo ? remainingVideos : videos} />
          )}
        </div>
      </section>

      {/* CTA Section */}
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

      <Footer />
    </main>
  )
}

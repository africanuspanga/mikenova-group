import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { fetchChannelVideos } from "@/lib/youtube"
import { VideosGrid } from "@/app/sections/videos-grid"
import { Play, Youtube } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function VideosPage() {
  const { videos, error } = await fetchChannelVideos()

  return (
    <main className="min-h-screen bg-[#0F0E0C]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0E0C] via-[#1B1A17] to-[#0F0E0C]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F0A500]/5 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-[#F0A500] mb-6">
              <span className="h-px w-8 sm:w-12 bg-[#F0A500]" />
              MIKENOVA TV
              <span className="h-px w-8 sm:w-12 bg-[#F0A500]" />
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#FAFAF8] mb-6 leading-[1.05]">
              Stories, Vlogs
              <br />
              <span className="text-[#F0A500]">&amp; Behind the Scenes</span>
            </h1>

            <p className="text-[#A8A6A1] text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8">
              Watch the latest from MIKENOVA GROUP. From Goddess Glow skincare to our divisions across Tanzania — all in one place.
            </p>

            <Link
              href="https://www.youtube.com/channel/UCKOCG6Ayd4dtHMR7izgTG2Q"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="border-[#F0A500] text-[#F0A500] hover:bg-[#F0A500] hover:text-[#0F0E0C] font-semibold text-xs uppercase tracking-[0.15em] px-8 py-6 transition-all duration-300 touch-manipulation"
              >
                <Youtube className="w-4 h-4 mr-2" />
                Subscribe on YouTube
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-16 sm:py-24 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 lg:px-8">
          {error ? (
            <div className="text-center py-16 sm:py-24">
              <Play className="w-12 h-12 sm:w-16 sm:h-16 text-[#1B1A17]/20 mx-auto mb-4" />
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1B1A17] mb-3">
                Videos Unavailable
              </h2>
              <p className="text-[#6B6A67] text-sm sm:text-base max-w-md mx-auto">
                {error}
              </p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16 sm:py-24">
              <Play className="w-12 h-12 sm:w-16 sm:h-16 text-[#1B1A17]/20 mx-auto mb-4" />
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1B1A17] mb-3">
                No Videos Yet
              </h2>
              <p className="text-[#6B6A67] text-sm sm:text-base max-w-md mx-auto">
                Check back soon for the latest MIKENOVA stories and updates.
              </p>
            </div>
          ) : (
            <VideosGrid videos={videos} />
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

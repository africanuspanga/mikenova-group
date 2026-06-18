import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { fetchChannelVideos } from "@/lib/youtube"
import { VideosGrid } from "@/app/sections/videos-grid"
import { VideosHero } from "@/app/sections/videos-hero"
import { VideosCta } from "@/app/sections/videos-cta"
import { Film } from "lucide-react"

export const revalidate = 3600

export default async function VideosPage() {
  const { videos, error } = await fetchChannelVideos()
  const featuredVideo = videos[0]
  const remainingVideos = videos.slice(1)

  return (
    <main className="min-h-screen bg-[#0F0E0C]">
      <Navigation />

      <VideosHero featuredVideo={featuredVideo} />

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

      <VideosCta />
      <Footer />
    </main>
  )
}

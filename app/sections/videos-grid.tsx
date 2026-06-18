"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Play, X, Clock, Eye, Calendar, Youtube } from "lucide-react"
import type { YouTubeVideo } from "@/lib/youtube"
import { formatViewCount, formatDate } from "@/lib/youtube"

interface VideosGridProps {
  videos: YouTubeVideo[]
  featured?: boolean
}

export function VideosGrid({ videos, featured = false }: VideosGridProps) {
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null)

  const closeModal = useCallback(() => {
    setActiveVideo(null)
  }, [])

  if (videos.length === 0) return null

  return (
    <>
      <div className={featured ? "max-w-5xl mx-auto" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10"}>
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
            className={featured ? "" : "group"}
          >
            <button
              onClick={() => setActiveVideo(video)}
              className={`w-full text-left touch-manipulation ${featured ? "" : "group"}`}
              aria-label={`Play ${video.title}`}
            >
              <div
                className={`relative overflow-hidden bg-[#1B1A17] ${
                  featured ? "aspect-video mb-6 shadow-2xl" : "aspect-video mb-4"
                }`}
              >
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  sizes={
                    featured
                      ? "(max-width: 1024px) 100vw, 1024px"
                      : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  }
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0C]/70 via-[#0F0E0C]/20 to-transparent group-hover:from-[#0F0E0C]/50 transition-all duration-500" />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`bg-[#F0A500] text-[#0F0E0C] shadow-2xl transition-transform duration-300 group-hover:scale-110 ${
                      featured ? "p-4 sm:p-5" : "p-3 sm:p-4"
                    }`}
                  >
                    <Play className={`fill-current ${featured ? "w-8 h-8 sm:w-10 sm:h-10" : "w-6 h-6 sm:w-8 sm:h-8"}`} />
                  </div>
                </div>

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-[#0F0E0C]/90 text-[#FAFAF8] px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </div>
                )}
              </div>

              <div className={`space-y-2 ${featured ? "text-center max-w-3xl mx-auto" : ""}`}>
                <h3
                  className={`font-serif text-[#1B1A17] group-hover:text-[#F0A500] transition-colors duration-300 leading-tight ${
                    featured ? "text-2xl sm:text-3xl lg:text-4xl mb-3" : "text-lg sm:text-xl line-clamp-2"
                  }`}
                >
                  {video.title}
                </h3>

                <div
                  className={`flex flex-wrap items-center gap-3 text-[#6B6A67] text-xs sm:text-sm ${
                    featured ? "justify-center" : ""
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(video.publishedAt)}
                  </span>
                  {video.viewCount !== undefined && video.viewCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {formatViewCount(video.viewCount)}
                    </span>
                  )}
                </div>

                <p
                  className={`text-[#6B6A67] leading-relaxed ${
                    featured
                      ? "text-sm sm:text-base line-clamp-3 max-w-2xl mx-auto"
                      : "text-xs sm:text-sm line-clamp-2"
                  }`}
                >
                  {video.description}
                </p>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <div
              className="absolute inset-0 bg-[#0F0E0C]/95 backdrop-blur-sm"
              onClick={closeModal}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full max-w-5xl bg-[#1B1A17] shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 bg-[#0F0E0C]/80 hover:bg-[#F0A500] text-[#FAFAF8] hover:text-[#0F0E0C] transition-colors duration-300 touch-manipulation"
                aria-label="Close video"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              {/* Video Info */}
              <div className="p-4 sm:p-6 lg:p-8">
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl text-[#FAFAF8] mb-3 leading-tight">
                  {activeVideo.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-[#A8A6A1] text-xs sm:text-sm mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(activeVideo.publishedAt)}
                  </span>
                  {activeVideo.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {activeVideo.duration}
                    </span>
                  )}
                  {activeVideo.viewCount !== undefined && activeVideo.viewCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {formatViewCount(activeVideo.viewCount)}
                    </span>
                  )}
                  <Link
                    href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#F0A500] hover:underline"
                  >
                    <Youtube className="w-4 h-4" />
                    Watch on YouTube
                  </Link>
                </div>

                <p className="text-[#A8A6A1] text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {activeVideo.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

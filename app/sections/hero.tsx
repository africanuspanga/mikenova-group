"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ChevronDown, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MagneticButton } from "@/app/components/animation/magnetic-button"

const heroVideos = [
  {
    src: "/the-golden-editoon%20promo.mp4",
    poster: "/golden-edition.jpg",
    label: "The Golden Edition",
  },
  {
    src: "/Goddess%20Glow%20BG.mp4",
    poster: "/goddess-glow/natural-beauty.webp",
    label: "Goddess Glow",
  },
]

const SLIDE_DURATION = 10000 // 10 seconds per video

// In-app browsers on iPhone (WhatsApp, Facebook, Instagram…) run on WKWebView
// and often refuse inline playback: every play() call opens the video full
// screen, over whatever the visitor is reading. Their user agent lacks the
// "Safari" token that real Safari, Chrome iOS and Firefox iOS all carry.
function isIosInAppBrowser() {
  const ua = navigator.userAgent
  const isIos = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  return isIos && !/Safari\//.test(ua)
}

type WebkitVideo = HTMLVideoElement & { webkitExitFullscreen?: () => void }

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  // The hero only plays while it is on screen and the tab is visible
  const [isInView, setIsInView] = useState(true)
  const [isPageVisible, setIsPageVisible] = useState(true)
  // Show the poster stills instead of video where video can't stay inline
  const [useStills, setUseStills] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const shownIndexRef = useRef(-1)

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroVideos.length)
  }, [])

  useEffect(() => {
    if (isIosInAppBrowser()) setUseStills(true)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting))
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onVisibilityChange = () => setIsPageVisible(document.visibilityState === "visible")
    onVisibilityChange()
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [])

  const isActive = isInView && isPageVisible

  // Auto-advance slides, only while the hero is being looked at
  useEffect(() => {
    if (!isPlaying || !isActive) return
    const interval = setInterval(nextSlide, SLIDE_DURATION)
    return () => clearInterval(interval)
  }, [isPlaying, isActive, nextSlide])

  // Play the active slide's video; pause everything once the hero is off screen
  useEffect(() => {
    // Check the browser here too: on first render the stills state hasn't been set yet
    if (useStills || isIosInAppBrowser()) return
    videoRefs.current.forEach((video, index) => {
      if (!video) return
      if (index === currentIndex && isActive) {
        if (shownIndexRef.current !== index) {
          video.currentTime = 0
          shownIndexRef.current = index
        }
        video.play().catch(() => {
          // Autoplay may be blocked; poster will show
        })
      } else {
        video.pause()
      }
    })
  }, [currentIndex, isActive, useStills])

  // Last line of defence: if a browser still takes the background video full
  // screen, close it and switch to stills for the rest of the visit
  const handleForcedFullscreen = useCallback((event: Event) => {
    const video = event.currentTarget as WebkitVideo
    video.pause()
    video.webkitExitFullscreen?.()
    setUseStills(true)
  }, [])

  const videoRefCallbacks = useMemo(
    () =>
      heroVideos.map((_, index) => (el: HTMLVideoElement | null) => {
        const previous = videoRefs.current[index]
        if (previous && previous !== el) previous.removeEventListener("webkitbeginfullscreen", handleForcedFullscreen)
        videoRefs.current[index] = el
        if (!el) return
        // React doesn't always write the muted attribute; iOS needs it for inline autoplay
        el.muted = true
        el.defaultMuted = true
        el.addEventListener("webkitbeginfullscreen", handleForcedFullscreen)
      }),
    [handleForcedFullscreen]
  )

  return (
    <section ref={sectionRef} className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Video Background Slider */}
      <div className="absolute inset-0 animate-ken-burns will-change-transform">
        <AnimatePresence mode="sync">
          {heroVideos.map((video, index) =>
            index === currentIndex ? (
              <motion.div
                key={video.src}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0"
              >
                {useStills ? (
                  <Image
                    src={video.poster}
                    alt=""
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                ) : (
                  <video
                    ref={videoRefCallbacks[index]}
                    muted
                    loop
                    playsInline
                    disablePictureInPicture
                    disableRemotePlayback
                    preload="auto"
                    poster={video.poster}
                    className="absolute inset-0 w-full h-full object-cover"
                  >
                    <source src={video.src} type="video/mp4" />
                  </video>
                )}
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F0E0C]/85 via-[#0F0E0C]/50 to-[#0F0E0C]/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F0E0C]/60 via-transparent to-[#0F0E0C]/60" />

      {/* Content */}
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
              Tanzania · Luxury · Excellence
              <span className="h-px w-8 sm:w-12 bg-[#F0A500]" />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[110px] text-[#FAFAF8] mb-8 leading-[0.95] tracking-tight"
          >
            MIKENOVA
            <br />
            <span className="text-[#F0A500]">GROUP</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl text-[#FAFAF8]/80 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
          >
            A curated house of premium brands and services shaping Africa&apos;s future.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <MagneticButton>
              <Button
                asChild
                size="lg"
                className="bg-[#F0A500] text-[#0F0E0C] hover:bg-[#F0A500]/90 font-semibold text-xs sm:text-sm uppercase tracking-[0.15em] px-8 sm:px-10 py-6 sm:py-7 transition-all duration-300 shadow-[0_0_40px_rgba(240,165,0,0.25)] touch-manipulation"
              >
                <Link href="/goddess-glow/">
                  Explore Goddess Glow
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
                <Link href="#divisions">Discover Our Divisions</Link>
              </Button>
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      {/* Top-right social proof */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="hidden lg:block absolute top-28 right-8 z-10"
      >
        <div className="text-right space-y-2 text-[10px] uppercase tracking-[0.2em] text-[#FAFAF8]/60">
          <p>12 Divisions</p>
          <p>10,000+ Clients</p>
          <p>15 Years of Excellence</p>
        </div>
      </motion.div>

      {/* Video Slider Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 sm:gap-6"
      >
        {heroVideos.map((video, index) => (
          <button
            key={video.src}
            onClick={() => goToSlide(index)}
            className={`group flex items-center gap-2 sm:gap-3 text-left transition-all duration-300 touch-manipulation ${
              index === currentIndex ? "opacity-100" : "opacity-50 hover:opacity-80"
            }`}
            aria-label={`Go to slide ${index + 1}: ${video.label}`}
          >
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#FAFAF8]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="w-16 sm:w-24 h-0.5 bg-[#FAFAF8]/30 overflow-hidden">
              <motion.div
                className="h-full bg-[#F0A500]"
                initial={{ width: "0%" }}
                animate={index === currentIndex ? { width: "100%" } : { width: "0%" }}
                transition={index === currentIndex ? { duration: SLIDE_DURATION / 1000, ease: "linear" } : { duration: 0.3 }}
              />
            </div>
            <span className="hidden sm:block text-[10px] sm:text-xs text-[#FAFAF8]/80 uppercase tracking-wider">
              {video.label}
            </span>
          </button>
        ))}

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="ml-2 p-2 border border-[#FAFAF8]/30 text-[#FAFAF8]/80 hover:border-[#F0A500] hover:text-[#F0A500] transition-all duration-300 touch-manipulation"
          aria-label={isPlaying ? "Pause video slider" : "Play video slider"}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
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

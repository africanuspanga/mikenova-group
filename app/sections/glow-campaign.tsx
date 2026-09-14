"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "framer-motion"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionLabel } from "@/app/components/animation/section-label"
import { MagneticButton } from "@/app/components/animation/magnetic-button"

const campaignSlides = [
  {
    src: "/goddess-glow/promo/promo-1.webp",
    alt: "Goddess Glow Brightening Body Cream campaign — 'Ready for radiance.' Soft skin, natural glow.",
    caption: "Ready for radiance",
  },
  {
    src: "/goddess-glow/promo/promo-2.webp",
    alt: "Goddess Glow Brightening Body Cream campaign — 'Glow, simplified.' A small ritual for a big glow.",
    caption: "Glow, simplified",
  },
  {
    src: "/goddess-glow/promo/promo-3.webp",
    alt: "Goddess Glow Brightening Body Cream campaign — 'A glow you keep.' Bright skin, daily.",
    caption: "A glow you keep",
  },
  {
    src: "/goddess-glow/promo/promo-4.webp",
    alt: "Goddess Glow Brightening Body Cream campaign — 'Glow Everyday.'",
    caption: "Glow every day",
  },
  {
    src: "/goddess-glow/promo/promo-5.webp",
    alt: "Goddess Glow Brightening Body Cream campaign — 'Real Glow. Everyday.'",
    caption: "Real glow, every day",
  },
]

const AUTOPLAY_MS = 5000

export function GlowCampaign() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const prefersReducedMotion = useRef(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  // Track the active slide so we can lift it above its neighbours
  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi])

  // Autoplay — paused on hover/focus, and never runs for reduced-motion users
  useEffect(() => {
    if (!emblaApi) return
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    prefersReducedMotion.current = media.matches
    if (media.matches || isPaused) return

    const timer = setInterval(() => {
      emblaApi.scrollNext()
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [emblaApi, isPaused])

  // Arrow-key support when the carousel has focus
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  return (
    <section className="relative py-24 sm:py-32 lg:py-40 bg-[#121110] overflow-hidden noise-overlay">
      {/* Boundary hairline against the section above */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#F0A500]/30 to-transparent" />

      {/* Warm spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F0A500]/[0.07] via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
            <SectionLabel color="gold" className="mb-6">
              The Campaign
            </SectionLabel>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FAFAF8] mb-6 leading-[1.1]"
            >
              Real Glow. <span className="text-[#F0A500]">Every Day.</span>
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-24 h-px bg-gradient-to-r from-[#F0A500] to-[#D4AF37] mb-6 mx-auto origin-center"
            />

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-[#A8A6A1] text-base sm:text-lg leading-relaxed"
            >
              Scenes from the Goddess Glow Brightening Body Cream campaign — one simple
              ritual, worn by women who carry their radiance everywhere.
            </motion.p>
          </div>
        </div>

        {/* Carousel
            Deliberately not wrapped in a framer-motion entrance animation: animating
            opacity/transform over Embla's own transformed track left the slides
            un-rasterized until an unrelated repaint occurred. */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
          <div
            className="overflow-hidden px-4 lg:px-8 focus-visible:outline-none"
            ref={emblaRef}
            role="group"
            aria-roledescription="carousel"
            aria-label="Goddess Glow campaign gallery"
            tabIndex={0}
            onKeyDown={onKeyDown}
          >
            <div className="flex -ml-4 sm:-ml-6 lg:-ml-8 py-2">
              {campaignSlides.map((slide, index) => {
                const isActive = index === selectedIndex
                return (
                  <div
                    key={slide.src}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${slide.caption} — ${index + 1} of ${campaignSlides.length}`}
                    className="pl-4 sm:pl-6 lg:pl-8 min-w-0 flex-[0_0_80%] sm:flex-[0_0_58%] lg:flex-[0_0_38%] xl:flex-[0_0_34%]"
                  >
                    <div
                      /* Transition opacity/colour only — animating `transform` here
                         left the dimmed slides un-rasterized in Chrome. */
                      className={`relative aspect-square overflow-hidden border bg-[#1B1A17] transition-[opacity,border-color,box-shadow] duration-500 ease-out ${
                        isActive
                          ? "border-[#F0A500]/40 opacity-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"
                          : "border-[#FAFAF8]/10 opacity-40 shadow-none"
                      }`}
                    >
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 58vw, 38vw"
                        className="object-cover select-none"
                        draggable={false}
                        priority={index < 2}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Arrows — desktop only; touch users swipe */}
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous campaign image"
            className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-12 h-12 border border-[#FAFAF8]/25 bg-[#0F0E0C]/70 backdrop-blur-sm text-[#FAFAF8] hover:bg-[#F0A500] hover:text-[#0F0E0C] hover:border-[#F0A500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A500] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121110] transition-all duration-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next campaign image"
            className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-12 h-12 border border-[#FAFAF8]/25 bg-[#0F0E0C]/70 backdrop-blur-sm text-[#FAFAF8] hover:bg-[#F0A500] hover:text-[#0F0E0C] hover:border-[#F0A500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A500] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121110] transition-all duration-300"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Caption + indicators */}
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mt-10 flex flex-col items-center gap-6">
            <p aria-live="polite" className="text-[#FAFAF8]/70 text-sm uppercase tracking-[0.2em] text-center">
              {campaignSlides[selectedIndex].caption}
            </p>

            <div className="flex items-center gap-3">
              {campaignSlides.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => scrollTo(index)}
                  aria-label={`Go to ${slide.caption}`}
                  aria-current={index === selectedIndex}
                  className="group py-3 focus-visible:outline-none"
                >
                  <span
                    className={`block h-px transition-all duration-500 ${
                      index === selectedIndex
                        ? "w-10 bg-[#F0A500]"
                        : "w-5 bg-[#FAFAF8]/30 group-hover:bg-[#FAFAF8]/60 group-focus-visible:bg-[#F0A500]"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-4"
            >
              <MagneticButton>
                <Button
                  asChild
                  size="lg"
                  className="bg-[#F0A500] text-[#0F0E0C] hover:bg-[#F0A500]/90 font-semibold text-xs sm:text-sm uppercase tracking-[0.15em] px-8 sm:px-10 py-6 sm:py-7 transition-all duration-300 shadow-[0_0_40px_rgba(240,165,0,0.25)] touch-manipulation"
                >
                  <Link href="/goddess-glow/">
                    Shop Goddess Glow
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

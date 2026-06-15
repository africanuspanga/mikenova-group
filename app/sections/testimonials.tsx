"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { SectionLabel } from "@/app/components/animation/section-label"

const testimonials = [
  {
    name: "James Msuya",
    service: "Furniture & Interior Décor",
    quote:
      "MIKENOVA GROUP transformed our office space with their exceptional furniture division. The attention to detail and quality is unmatched.",
  },
  {
    name: "Florah Temba",
    service: "Cosmetics & Beauty Services",
    quote:
      "Their cosmetics division introduced me to luxury beauty products I never knew existed. The personalized service at their salon is world-class.",
  },
  {
    name: "Janeth Sanga",
    service: "Pharmacy Services",
    quote:
      "As a business owner, I rely on MIKENOVA's pharmacy services for all our medical supplies. Their reliability and quality standards give me peace of mind.",
  },
  {
    name: "Hamza Sharif",
    service: "Civil Engineering & Construction",
    quote:
      "The construction division delivered our commercial building ahead of schedule with impeccable engineering. True professionals in every sense.",
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length)
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="py-24 sm:py-32 lg:py-40 bg-[#0F0E0C] relative overflow-hidden noise-overlay">
      {/* Spotlight gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F0A500]/5 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-20">
          <SectionLabel color="gold" className="mb-6">
            Client Voices
          </SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FAFAF8] leading-[1.1]"
          >
            The MIKENOVA Standard
          </motion.h2>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center min-h-[300px] sm:min-h-[280px] flex flex-col items-center justify-center">
            <Quote className="h-12 w-12 sm:h-16 sm:w-16 text-[#F0A500]/20 mb-8" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <p className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#FAFAF8] leading-[1.4] mb-8">
                  &ldquo;{testimonials[current].quote}&rdquo;
                </p>

                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-[#F0A500] text-[#F0A500]" />
                  ))}
                </div>

                <h3 className="font-serif text-lg sm:text-xl text-[#F0A500] mb-1">
                  {testimonials[current].name}
                </h3>
                <p className="text-[#A8A6A1] text-sm uppercase tracking-[0.2em]">
                  {testimonials[current].service}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={prev}
              className="p-3 border border-[#3A3835] hover:border-[#F0A500] text-[#FAFAF8]/70 hover:text-[#F0A500] transition-all duration-300 touch-manipulation"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`h-2 transition-all duration-300 touch-manipulation ${
                    index === current ? "bg-[#F0A500] w-8" : "bg-[#3A3835] w-2 hover:bg-[#F0A500]/50"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-3 border border-[#3A3835] hover:border-[#F0A500] text-[#FAFAF8]/70 hover:text-[#F0A500] transition-all duration-300 touch-manipulation"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

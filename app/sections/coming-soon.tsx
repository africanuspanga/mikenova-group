"use client"

import { motion } from "framer-motion"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionLabel } from "@/app/components/animation/section-label"
import { comingSoonProducts, notifyMeLink } from "@/lib/coming-soon"

export function ComingSoon() {
  return (
    <section className="py-24 sm:py-32 bg-[#FAFAF8]">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-16">
          <SectionLabel color="dark" className="mb-6">
            Coming Soon
          </SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1B1A17] mb-6 leading-[1.1]"
          >
            New to the House
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[#6B6A67] text-base sm:text-lg leading-relaxed"
          >
            Two new skincare products are on their way. Be the first to know when they arrive.
          </motion.p>
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {comingSoonProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="bg-white border border-[#E8E6E1] luxury-card group"
            >
              <div className="relative aspect-square bg-white overflow-hidden flex items-center justify-center p-8 sm:p-10">
                <span className="absolute top-4 left-4 z-10 bg-[#1B1A17] text-[#F0A500] text-[10px] font-semibold tracking-[0.2em] uppercase px-3 py-1.5">
                  Coming Soon
                </span>
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6 sm:p-8 border-t border-[#E8E6E1]">
                <p className="text-xs text-[#6B6A67] mb-2 tracking-[0.2em] uppercase">{product.tagline}</p>
                <h3 className="font-serif text-xl sm:text-2xl text-[#1B1A17] mb-3">{product.name}</h3>
                <p className="text-sm text-[#6B6A67] leading-relaxed mb-6">{product.description}</p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#1B1A17] text-[#1B1A17] hover:bg-[#1B1A17] hover:text-[#FAFAF8] font-semibold text-xs uppercase tracking-[0.15em] py-5 transition-all duration-300 touch-manipulation"
                >
                  <a href={notifyMeLink(product.name)} target="_blank" rel="noopener noreferrer">
                    <Bell className="mr-2 h-4 w-4" />
                    Notify Me
                  </a>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

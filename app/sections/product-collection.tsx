"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionLabel } from "@/app/components/animation/section-label"
import { MagneticButton } from "@/app/components/animation/magnetic-button"
import { LuxuryProductCard } from "@/app/components/animation/luxury-product-card"
import { defaultProducts, getProducts, type Product } from "@/lib/products-store"

export function ProductCollection() {
  const [products, setProducts] = useState<Product[]>(defaultProducts)

  useEffect(() => {
    setProducts(getProducts())
  }, [])

  return (
    <section className="py-24 sm:py-32 lg:py-40 bg-[#F5F3EE]">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <SectionLabel color="dark" className="mb-6">
            Available Now
          </SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1B1A17] mb-6 leading-[1.1]"
          >
            The Collection
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[#6B6A67] text-base sm:text-lg leading-relaxed"
          >
            Dermatologist-approved skincare crafted for radiant, healthy, glowing skin.
          </motion.p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {products.map((product, index) => (
            <LuxuryProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-16 lg:mt-20"
        >
          <MagneticButton>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[#1B1A17] text-[#1B1A17] hover:bg-[#1B1A17] hover:text-[#FAFAF8] font-semibold text-xs sm:text-sm uppercase tracking-[0.15em] px-8 sm:px-10 py-6 sm:py-7 transition-all duration-300 touch-manipulation"
            >
              <Link href="/goddess-glow/">
                View Full Collection
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"
import type { Product } from "@/lib/products-store"

interface LuxuryProductCardProps {
  product: Product
  index?: number
}

export function LuxuryProductCard({ product, index = 0 }: LuxuryProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="group"
    >
      <Link href={`/goddess-glow`} className="block">
        <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-[#EDEAE4]">
          <Image
            src={product.images[currentImageIndex] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Discount Badge */}
          <div className="absolute top-4 left-4 bg-[#E53935] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-lg">
            {discount}% Off
          </div>

          {/* Quick Shop Button */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <div className="w-full bg-[#F0A500] text-[#0F0E0C] hover:bg-[#F0A500]/90 font-semibold text-xs uppercase tracking-[0.15em] py-5 flex items-center justify-center touch-manipulation">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Shop Now
            </div>
          </div>

          {/* Image Navigation */}
          {product.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 touch-manipulation"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4 text-[#1B1A17]" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 touch-manipulation"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4 text-[#1B1A17]" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrentImageIndex(idx)
                    }}
                    className={`h-1.5 transition-all duration-300 touch-manipulation ${
                      idx === currentImageIndex ? "bg-[#F0A500] w-6" : "bg-white/60 w-1.5"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-serif text-lg sm:text-xl text-[#1B1A17] group-hover:text-[#F0A500] transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-[#6B6A67] text-sm line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-lg font-semibold text-[#1B1A17]">
              TZS {product.price.toLocaleString()}
            </span>
            <span className="text-sm text-[#999] line-through">
              TZS {product.originalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

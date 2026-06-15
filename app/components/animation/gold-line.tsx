"use client"

import { motion } from "framer-motion"

interface GoldLineProps {
  className?: string
  delay?: number
  width?: string
}

export function GoldLine({ className = "", delay = 0, width = "80px" }: GoldLineProps) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.4, 0, 0.2, 1] }}
      style={{ width, transformOrigin: "left" }}
      className={`h-px bg-gradient-to-r from-[#F0A500] to-[#D4AF37] ${className}`}
    />
  )
}

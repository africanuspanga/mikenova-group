"use client"

import { motion } from "framer-motion"

interface SectionLabelProps {
  children: React.ReactNode
  className?: string
  color?: "gold" | "cream" | "dark"
}

export function SectionLabel({ children, className = "", color = "gold" }: SectionLabelProps) {
  const colorClasses = {
    gold: "text-[#F0A500]",
    cream: "text-[#FAFAF8]/80",
    dark: "text-[#1B1A17]/70",
  }

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`inline-block text-xs font-semibold uppercase tracking-[0.25em] ${colorClasses[color]} ${className}`}
    >
      {children}
    </motion.span>
  )
}

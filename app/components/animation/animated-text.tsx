"use client"

import { motion } from "framer-motion"

interface AnimatedTextProps {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div"
}

export function AnimatedText({ children, className = "", delay = 0, as: Tag = "div" }: AnimatedTextProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      <Tag className={className}>{children}</Tag>
    </motion.div>
  )
}

interface AnimatedWordsProps {
  text: string
  className?: string
  delay?: number
}

export function AnimatedWords({ text, className = "", delay = 0 }: AnimatedWordsProps) {
  const words = text.split(" ")

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay },
    }),
  }

  const child = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },
  }

  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={child} className="mr-[0.25em] inline-block">
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}

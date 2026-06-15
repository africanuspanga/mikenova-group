"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Divisions" },
    { href: "/products", label: "Products" },
    { href: "/goddess-glow", label: "Goddess Glow" },
    { href: "/blog", label: "Journal" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0F0E0C]/95 backdrop-blur-md border-b border-[#F0A500]/20"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo-new.png"
              alt="MIKENOVA GROUP"
              width={280}
              height={90}
              className="h-12 lg:h-14 w-auto brightness-0 invert transition-all duration-300 group-hover:opacity-90"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FAFAF8]/80 hover:text-[#F0A500] transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-[#FAFAF8]/80 hover:text-[#F0A500] hover:bg-transparent"
            >
              <Link href="/goddess-glow">
                <ShoppingBag className="h-4 w-4 mr-2" />
                SHOP
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-[#F0A500] text-[#0F0E0C] hover:bg-[#F0A500]/90 font-semibold text-[11px] uppercase tracking-[0.15em] px-6 transition-all duration-300"
            >
              <Link href="/contact">Contact</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-[#F0A500] hover:bg-white/5 touch-manipulation"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[#0F0E0C]/98 backdrop-blur-md border-t border-[#F0A500]/20 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-8">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="block py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#FAFAF8]/90 hover:text-[#F0A500] transition-colors border-b border-[#3A3835]/50"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-8 flex flex-col gap-4">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#F0A500] text-[#F0A500] hover:bg-[#F0A500] hover:text-[#0F0E0C] font-semibold uppercase tracking-[0.15em] touch-manipulation"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/goddess-glow">Shop Goddess Glow</Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-[#F0A500] text-[#0F0E0C] hover:bg-[#F0A500]/90 font-semibold uppercase tracking-[0.15em] touch-manipulation"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navigation

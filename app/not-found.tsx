"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, ShoppingBag, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1B1A17] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <Link href="/" className="inline-block mb-8">
          <Image src="/logo-new.png" alt="MIKENOVA GROUP" width={180} height={60} className="mx-auto" />
        </Link>

        {/* 404 Text */}
        <h1 className="text-8xl sm:text-9xl font-bold text-[#C9A227] mb-4">404</h1>

        <h2 className="text-2xl sm:text-3xl font-semibold text-[#FAFAF8] mb-4">Page Not Found</h2>

        <p className="text-[#FAFAF8]/70 mb-8 text-base sm:text-lg">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-[#C9A227] hover:bg-[#B8922A] text-[#1B1A17] font-semibold px-6 py-3">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-[#1B1A17] px-6 py-3 bg-transparent"
          >
            <Link href="/goddess-glow">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shop Goddess Glow
            </Link>
          </Button>
        </div>

        {/* Back Link */}
        <button
          onClick={() => typeof window !== "undefined" && window.history.back()}
          className="mt-8 inline-flex items-center text-[#FAFAF8]/60 hover:text-[#C9A227] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go back to previous page
        </button>
      </div>
    </div>
  )
}

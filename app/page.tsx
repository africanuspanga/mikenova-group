"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  TrendingUp,
  Users,
  Award,
  Building2,
  ShoppingCart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Quote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

interface Product {
  id: string
  name: string
  price: number
  originalPrice: number
  description: string
  images: string[]
}

const goddessGlowProducts: Product[] = [
  {
    id: "body-cream",
    name: "Goddess Glow Body Cream",
    price: 65000,
    originalPrice: 81250,
    description: "Brightening body cream that reveals smooth, even, radiant skin. Dermatologist approved formula.",
    images: ["/goddess-glow/Body-cream 2.png", "/goddess-glow/Body cream -main.png"],
  },
  {
    id: "body-oil",
    name: "Goddess Glow Body Oil",
    price: 45000,
    originalPrice: 56250,
    description: "Luxurious body oil that nourishes and gives your skin a luminous, healthy glow.",
    images: ["/goddess-glow/body-oil-hero.jpeg", "/goddess-glow/body-oil-product.jpeg"],
  },
  {
    id: "bar-soap",
    name: "Goddess Glow Bar Soap",
    price: 15000,
    originalPrice: 18750,
    description: "Natural brightening bar soap infused with fruit extracts. Cleanses and brightens.",
    images: ["/goddess-glow/bar-soap-1.jpeg", "/goddess-glow/bar-soap-2.jpeg"],
  },
]

const brandPartners = [
  { src: "/brands/tommy-hilfiger.png", alt: "Tommy Hilfiger", href: "https://global.tommy.com/" },
  { src: "/brands/hm.png", alt: "H&M", href: "https://www2.hm.com/" },
  { src: "/brands/chanel.png", alt: "Chanel", href: "https://www.chanel.com/" },
  { src: "/brands/sephora.png", alt: "Sephora", href: "https://www.sephora.com/" },
  { src: "/brands/gucci.png", alt: "Gucci", href: "https://www.gucci.com/" },
  { src: "/brands/loreal.png", alt: "L'Oréal", href: "https://www.loreal.com/" },
  { src: "/brands/hermes.png", alt: "Hermès", href: "https://www.hermes.com/" },
  { src: "/brands/zara.png", alt: "Zara", href: "https://www.zara.com/" },
  { src: "/brands/deldar.webp", alt: "Deldar", href: "https://del-dar.com/" },
  { src: "/brands/orca.png", alt: "Orca", href: "https://www.orca-coolers.com/" },
  { src: "/brands/empress-furniture.jpg", alt: "Empress Furniture", href: "https://empressfurniture.com/" },
  { src: "/brands/palmers.jpg", alt: "Palmer's", href: "https://www.palmers.com/" },
  { src: "/brands/istikbal.png", alt: "İstikbal", href: "https://www.istikbal.com.tr/" },
  { src: "/brands/cerave.png", alt: "CeraVe", href: "https://www.cerave.com/" },
  { src: "/brands/la-roche-posay.png", alt: "La Roche-Posay", href: "https://www.laroche-posay.com/" },
  { src: "/brands/brand-logo.avif", alt: "Brand Partner", href: null },
]

function HomeProductCard({ product }: { product: Product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  return (
    <Card className="!bg-white overflow-hidden group border-0 shadow-modern hover:shadow-modern-hover transition-all duration-500">
      <div className="relative h-[280px] sm:h-[300px] md:h-[350px] overflow-hidden">
        <Image
          src={product.images[currentImageIndex] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Discount Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#E53935] text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-bold shadow-lg">
          -{discount}% OFF
        </div>
        {/* Image Navigation */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#1B1A17]" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-[#1B1A17]" />
            </button>
            {/* Dots Indicator */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? "bg-[#F0A500] w-4" : "bg-white/50"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <CardContent className="p-4 sm:p-6">
        <h3 className="font-serif text-lg sm:text-xl text-[#1B1A17] mb-2">{product.name}</h3>
        <p className="text-[#4A4A4A] text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <span className="text-xl sm:text-2xl font-bold text-[#1B1A17]">TZS {product.price.toLocaleString()}</span>
          <span className="text-sm sm:text-base text-[#999] line-through">
            TZS {product.originalPrice.toLocaleString()}
          </span>
        </div>
        <Button
          asChild
          className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1B1A17] font-semibold py-4 sm:py-5 text-sm sm:text-base transition-all duration-300"
        >
          <Link href="/goddess-glow#shop">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Shop Now
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Scroll reveal effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
          }
        })
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    )

    const revealElements = document.querySelectorAll(".reveal")
    revealElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollWidth = container.scrollWidth
    const clientWidth = container.clientWidth
    let scrollPosition = 0

    const scroll = () => {
      scrollPosition += 1
      if (scrollPosition >= scrollWidth - clientWidth) {
        scrollPosition = 0
      }
      container.scrollLeft = scrollPosition
    }

    const interval = setInterval(scroll, 30)
    return () => clearInterval(interval)
  }, [])

  const featuredProducts = {
    cosmetics: [
      { name: "Luxury Face Serum", brand: "Premium Brand" },
      { name: "Gold Infused Moisturizer", brand: "Elite Cosmetics" },
      { name: "Diamond Eye Cream", brand: "Luxury Line" },
    ],
    fashion: [
      { name: "Designer Leather Boots", brand: "Fashion House" },
      { name: "Luxury Handbag", brand: "Premium Label" },
      { name: "Silk Evening Dress", brand: "Couture Brand" },
    ],
    furniture: [
      { name: "Executive Office Chair", brand: "Premium Furniture" },
      { name: "Luxury Dining Table", brand: "Elite Home" },
      { name: "Designer Sofa Set", brand: "Luxury Living" },
    ],
    pharmacy: [
      { name: "Premium Supplements", brand: "Health Plus" },
      { name: "Advanced Vitamins", brand: "Wellness Pro" },
      { name: "Medical Grade Products", brand: "Care Elite" },
    ],
    dispensary: [
      { name: "Wellness Package", brand: "Health First" },
      { name: "Medical Supplies Kit", brand: "Care Pro" },
      { name: "Premium Health Items", brand: "Wellness Elite" },
    ],
  }

  const divisions = [
    {
      title: "COSMETICS & BEAUTY",
      description: "Luxury skincare, fragrances, and beauty services",
      category: "cosmetics",
    },
    {
      title: "FASHION & ACCESSORIES",
      description: "Designer clothing, shoes, and premium accessories",
      category: "fashion",
    },
    {
      title: "HOME & FURNITURE",
      description: "Exclusive furnishings and interior décor",
      category: "furniture",
    },
    {
      title: "PHARMACY SERVICES",
      description: "Trusted medical supplies and health products",
      category: "pharmacy",
    },
    {
      title: "DISPENSARY",
      description: "Premium health access and wellness solutions",
      category: "dispensary",
    },
  ]

  const testimonials = [
    {
      name: "James Msuya",
      quote:
        "MIKENOVA GROUP transformed our office space with their exceptional furniture division. The attention to detail and quality is unmatched.",
      service: "Furniture & Interior Décor",
    },
    {
      name: "Florah Temba",
      quote:
        "Their cosmetics division introduced me to luxury beauty products I never knew existed. The personalized service at their salon is world-class.",
      service: "Cosmetics & Beauty Services",
    },
    {
      name: "Janeth Sanga",
      quote:
        "As a business owner, I rely on MIKENOVA's pharmacy services for all our medical supplies. Their reliability and quality standards give me peace of mind.",
      service: "Pharmacy Services",
    },
    {
      name: "Hamza Sharif",
      quote:
        "The construction division delivered our commercial building ahead of schedule with impeccable engineering. True professionals in every sense.",
      service: "Civil Engineering & Construction",
    },
  ]

  const latestArrivals = [
    {
      name: "Crème de la Mer",
      brand: "La Mer",
      category: "Cosmetics",
      image: "/arrivals/la-mer-cream.avif",
      description: "Iconic luxury moisturizing cream",
    },
    {
      name: "Oud Wood Eau de Parfum",
      brand: "Tom Ford",
      category: "Cosmetics",
      image: "/arrivals/tom-ford-oud-wood.jpg",
      description: "Premium fragrance with gold accents",
    },
    {
      name: "Submariner Watch",
      brand: "Rolex",
      category: "Fashion",
      image: "/arrivals/rolex-submariner.jpg",
      description: "Luxury timepiece with metal bracelet",
    },
    {
      name: "So Kate Pumps",
      brand: "Christian Louboutin",
      category: "Fashion",
      image: "/arrivals/louboutin-pumps.avif",
      description: "Signature red sole high heels",
    },
    {
      name: "Lounge Chair & Ottoman",
      brand: "Eames",
      category: "Furniture",
      image: "/arrivals/eames-lounge-chair.jpg",
      description: "Iconic mid-century modern design",
    },
    {
      name: "Ashwagandha GoldPlus",
      brand: "Himalaya Wellness",
      category: "Pharmacy",
      image: "/arrivals/himalaya-ashwagandha.webp",
      description: "Premium herbal supplement",
    },
    {
      name: "Prenatal Multi + DHA",
      brand: "Nature Made",
      category: "Pharmacy",
      image: "/arrivals/nature-made-prenatal.jpg",
      description: "Medical-grade prenatal vitamins",
    },
    {
      name: "Evolv Blood Pressure Monitor",
      brand: "Omron",
      category: "Dispensary",
      image: "/arrivals/omron-blood-pressure.webp",
      description: "Premium wireless health monitoring",
    },
  ]

  return (
    <div className="min-h-screen bg-[#1B1A17]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          poster="/goddess-glow/natural-beauty.png"
        >
          <source src="/Goddess%20Glow%20BG.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B1A17]/80 via-[#1B1A17]/60 to-[#1B1A17]/90" />
        <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 inline-block">
              <div className="h-px w-24 bg-[#F0A500] mx-auto mb-6" />
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#F0A500] mb-8 text-balance animate-fade-in leading-tight">
              MIKENOVA GROUP
            </h1>
            <p className="text-xl md:text-2xl text-[#FAFAF8]/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
              Where precision and prestige are integrated into every life sector.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#F0A500] text-[#1B1A17] hover:bg-[#F0A500]/90 font-medium tracking-wider text-lg px-8 py-6 transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(240,165,0,0.3)]"
            >
              <Link href="/contact">
                GET IN TOUCH
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="h-8 w-8 text-[#F0A500]/60" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#252320] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F0A500]/30 to-transparent" />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Building2, num: "12", label: "SPECIALIZED DIVISIONS" },
              { icon: Award, num: "15+", label: "YEARS OF EXCELLENCE" },
              { icon: Users, num: "10K+", label: "SATISFIED CLIENTS" },
              { icon: TrendingUp, num: "500+", label: "PREMIUM PRODUCTS" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center reveal reveal-delay-${index + 1} ${
                  index < 3 ? "md:border-r md:border-[#3A3835]" : ""
                }`}
              >
                <div className="flex items-center justify-center mb-3">
                  <stat.icon className="h-8 w-8 text-[#F0A500]" />
                </div>
                <div className="font-serif text-4xl md:text-5xl text-[#F0A500] mb-2">{stat.num}</div>
                <div className="text-sm text-[#A8A6A1] tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection Section */}
      <section className="py-28 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-20 reveal">
            <div className="h-px w-16 bg-[#F0A500] mx-auto mb-6" />
            <h2 className="font-serif text-4xl md:text-5xl text-[#F0A500] mb-4">Featured Collection</h2>
            <p className="text-lg text-[#1B1A17]/70 max-w-2xl mx-auto leading-relaxed">
              Discover our curated selection of premium products across all divisions
            </p>
          </div>

          {[
            { title: "Cosmetics & Beauty", key: "cosmetics" as const },
            { title: "Fashion & Accessories", key: "fashion" as const },
            { title: "Home & Furniture", key: "furniture" as const },
            { title: "Pharmacy Services", key: "pharmacy" as const },
            { title: "Dispensary", key: "dispensary" as const },
          ].map((category, catIndex) => (
            <div key={category.key} className="mb-20 last:mb-0 reveal">
              <h3 className="font-serif text-2xl md:text-3xl text-[#F0A500] mb-10 text-center">
                {category.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts[category.key].map((product, index) => (
                  <Card
                    key={index}
                    className="bg-white border-[#D4D2CC] hover:shadow-modern-hover transition-all duration-500 overflow-hidden group"
                  >
                    <div className="h-80 bg-white flex items-center justify-center p-8">
                      <Image
                        src={
                          index === 0
                            ? `/products/${
                                category.key === "cosmetics"
                                  ? "luxury-face-serum-new.png"
                                  : category.key === "fashion"
                                    ? "designer-leather-boots.jpg"
                                    : category.key === "furniture"
                                      ? "executive-office-chair.webp"
                                      : category.key === "pharmacy"
                                        ? "premium-supplement-bottles.avif"
                                        : "wellness-package-kit.jpg"
                              }`
                            : index === 1
                              ? `/products/${
                                  category.key === "cosmetics"
                                    ? "gold-moisturizer.jpg"
                                    : category.key === "fashion"
                                      ? "luxury-handbag-new.jpg"
                                      : category.key === "furniture"
                                        ? "luxury-dining-table.webp"
                                        : category.key === "pharmacy"
                                          ? "advanced-vitamin-packaging.jpg"
                                          : "medical-supplies-kit.webp"
                                }`
                              : `/products/${
                                  category.key === "cosmetics"
                                    ? "diamond-eye-cream.png"
                                    : category.key === "fashion"
                                      ? "silk-evening-dress-new.png"
                                      : category.key === "furniture"
                                        ? "designer-sofa-set.webp"
                                        : category.key === "pharmacy"
                                          ? "medical-grade-health-products.jpg"
                                          : "premium-health-monitoring-devices.jpg"
                                }`
                        }
                        alt={product.name}
                        width={400}
                        height={400}
                        className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500 drop-shadow-lg"
                      />
                    </div>
                    <CardContent className="p-6">
                      <p className="text-xs text-[#6B6A67] mb-2 tracking-wider uppercase">{product.brand}</p>
                      <h4 className="font-serif text-lg text-[#1B1A17] mb-4">{product.name}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-[#F0A500] text-[#F0A500] hover:bg-[#F0A500] hover:text-[#1B1A17] font-medium tracking-wider bg-transparent transition-all duration-300"
                      >
                        INQUIRE
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center mt-16 reveal">
            <Button
              asChild
              size="lg"
              className="bg-[#F0A500] text-[#1B1A17] hover:bg-[#F0A500]/90 font-medium tracking-wider transition-all duration-300 hover:scale-105"
            >
              <Link href="/products">
                VIEW ALL PRODUCTS
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Goddess Glow Collection */}
      <section className="py-20 sm:py-24 md:py-28 bg-[#FDFBF7]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 reveal">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-medium tracking-wider text-xs sm:text-sm uppercase">Shop Now</span>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#D4AF37]" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl text-[#1B1A17] mb-3 sm:mb-4">
              Goddess Glow Collection
            </h2>
            <p className="text-[#4A4A4A] text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 leading-relaxed">
              Discover our signature skincare line for radiant, glowing skin
            </p>
            <div className="inline-block bg-[#E53935] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold mt-4 shadow-lg">
              Limited Time: 20% OFF All Products!
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {goddessGlowProducts.map((product) => (
              <div key={product.id} className="reveal">
                <HomeProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-14 reveal">
            <Button
              asChild
              size="lg"
              className="bg-[#1B1A17] hover:bg-[#2a2925] text-[#FAFAF8] font-medium tracking-wider px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-modern hover:shadow-modern-hover"
            >
              <Link href="/goddess-glow">
                View Full Collection & Buy
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Product Section */}
      <section className="relative py-28 bg-[#1B1A17] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F0A500]/40 to-transparent" />
        <div className="absolute inset-0 opacity-10">
          <Image src="/goddess-glow/natural-beauty.png" alt="Background" fill className="object-cover" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] overflow-hidden shadow-2xl group reveal">
              <Image
                src="/goddess-glow/hero-beach.png"
                alt="Goddess Glow Brightening Body Cream"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B1A17]/40 to-transparent" />
            </div>
            <div className="text-center lg:text-left reveal reveal-delay-2">
              <div className="inline-block bg-[#F0A500]/10 border border-[#F0A500] px-4 py-2 rounded-full mb-6">
                <span className="text-[#F0A500] text-sm font-medium tracking-wider uppercase">Featured Product</span>
              </div>
              <h2 className="font-serif text-4xl md:text-6xl text-[#F0A500] mb-6 leading-tight">Goddess Glow</h2>
              <p className="text-2xl md:text-3xl text-[#FAFAF8] mb-4 font-light">Brightening Body Cream</p>
              <p className="text-lg text-[#A8A6A1] mb-8 leading-relaxed max-w-xl">
                Experience the skincare secret trusted by thousands of women across Africa. Reveal your natural radiance
                with our premium brightening formula that fades dark spots, evens skin tone, and restores your youthful
                glow.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#F0A500] text-[#1B1A17] hover:bg-[#F0A500]/90 font-medium tracking-wider text-lg px-10 py-6 transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(240,165,0,0.25)]"
              >
                <Link href="/goddess-glow">
                  LEARN MORE
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Divisions Section */}
      <section className="py-28 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-20 reveal">
            <div className="h-px w-16 bg-[#F0A500] mx-auto mb-6" />
            <h2 className="font-serif text-4xl md:text-5xl text-[#F0A500] mb-4">Our Divisions</h2>
            <p className="text-lg text-[#A8A6A1] max-w-2xl mx-auto leading-relaxed">
              Explore our five signature categories of excellence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {divisions.map((division, index) => (
              <Card
                key={index}
                className="bg-[#252320] border-[#3A3835] hover:border-[#F0A500] transition-all duration-500 group overflow-hidden reveal"
              >
                <div className="h-64 relative overflow-hidden">
                  <Image
                    src={
                      index === 0
                        ? "/divisions/luxury-cosmetics-display.avif"
                        : index === 1
                          ? "/divisions/designer-clothing-display.jpg"
                          : index === 2
                            ? "/divisions/luxury-furniture-arrangement.jpg"
                            : index === 3
                              ? "/divisions/modern-pharmacy-interior.jpg"
                              : "/divisions/medical-dispensary.webp"
                    }
                    alt={division.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B1A17] via-[#1B1A17]/50 to-transparent" />
                </div>
                <CardContent className="p-8 relative">
                  <div className="absolute left-0 top-0 w-1 h-0 bg-[#F0A500] group-hover:h-full transition-all duration-500" />
                  <h3 className="font-serif text-xl text-[#F0A500] mb-3 group-hover:translate-x-2 transition-transform duration-300">
                    {division.title}
                  </h3>
                  <p className="text-[#A8A6A1] text-sm leading-relaxed mb-4">{division.description}</p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full border-[#F0A500] text-[#F0A500] hover:bg-[#F0A500] hover:text-[#1B1A17] font-medium tracking-wider bg-transparent transition-all duration-300"
                  >
                    <Link href={`/products?category=${division.category}`}>EXPLORE</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Partners Section */}
      <section className="py-28 bg-[#252320] border-y border-[#F0A500]/20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 reveal">
            <div className="h-px w-16 bg-[#F0A500] mx-auto mb-6" />
            <h3 className="font-serif text-2xl md:text-3xl text-[#F0A500]">Our Brand Partners</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {brandPartners.map((brand, index) => (
              <div key={index} className={`reveal reveal-delay-${(index % 4) + 1}`}>
                {brand.href ? (
                  <a
                    href={brand.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-500 flex items-center justify-center p-4 group shadow-modern hover:shadow-modern-hover hover:-translate-y-1"
                  >
                    <Image
                      src={brand.src}
                      alt={brand.alt}
                      width={120}
                      height={120}
                      className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  </a>
                ) : (
                  <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] flex items-center justify-center p-4 group">
                    <Image
                      src={brand.src}
                      alt={brand.alt}
                      width={120}
                      height={120}
                      className="object-contain w-full h-full"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Arrivals Section */}
      <section className="py-28 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-20 reveal">
            <div className="h-px w-16 bg-[#F0A500] mx-auto mb-6" />
            <h2 className="font-serif text-4xl md:text-5xl text-[#F0A500] mb-4">Latest Arrivals</h2>
            <p className="text-lg text-[#1B1A17]/70 max-w-2xl mx-auto leading-relaxed">
              Discover our newest additions to the collection
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {latestArrivals.map((product, index) => (
              <Card
                key={index}
                className="bg-white border-[#D4D2CC] hover:shadow-modern-hover transition-all duration-500 overflow-hidden group relative reveal"
              >
                <div className="absolute top-4 right-4 z-10 bg-[#F0A500] text-[#1B1A17] text-xs font-bold px-3 py-1 tracking-wider shadow-md">
                  NEW
                </div>
                <div className="aspect-square bg-white flex items-center justify-center overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500 drop-shadow-lg"
                  />
                </div>
                <CardContent className="p-6">
                  <p className="text-xs text-[#6B6A67] mb-2 tracking-wider uppercase">{product.brand}</p>
                  <h4 className="font-serif text-lg text-[#1B1A17] mb-2">{product.name}</h4>
                  <p className="text-xs text-[#A8A6A1] mb-4">{product.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#F0A500] text-[#F0A500] hover:bg-[#F0A500] hover:text-[#1B1A17] font-medium tracking-wider bg-transparent transition-all duration-300"
                  >
                    INQUIRE
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-28 bg-[#1B1A17] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F0A500]/30 to-transparent" />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-20 reveal">
            <div className="h-px w-16 bg-[#F0A500] mx-auto mb-6" />
            <h2 className="font-serif text-4xl md:text-5xl text-[#F0A500] mb-4">Client Testimonials</h2>
            <p className="text-lg text-[#A8A6A1] max-w-2xl mx-auto leading-relaxed">
              Hear from those who have experienced the MIKENOVA standard
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-[#FAFAF8] border-[#E8E6E1] hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 reveal"
              >
                <CardContent className="p-8 text-center relative">
                  <Quote className="h-8 w-8 text-[#F0A500]/20 mx-auto mb-4" />
                  <h3 className="font-serif text-xl text-[#1B1A17] mb-2">{testimonial.name}</h3>
                  <p className="text-sm text-[#F0A500] mb-6 tracking-wide">{testimonial.service}</p>

                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 fill-[#F0A500]"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-[#1B1A17]/80 text-sm leading-relaxed italic">{testimonial.quote}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

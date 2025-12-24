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
    price: 55000,
    originalPrice: 68750,
    description: "Brightening body cream that reveals smooth, even, radiant skin. Dermatologist approved formula.",
    images: ["/goddess-glow/body-cream-beach.png", "/goddess-glow/body-cream-hand.jpeg"],
  },
  {
    id: "body-oil",
    name: "Goddess Glow Body Oil",
    price: 30000,
    originalPrice: 37500,
    description: "Luxurious body oil that nourishes and gives your skin a luminous, healthy glow.",
    images: ["/goddess-glow/body-oil-hero.jpeg", "/goddess-glow/body-oil-product.jpeg"],
  },
  {
    id: "bar-soap",
    name: "Goddess Glow Bar Soap",
    price: 10000,
    originalPrice: 12500,
    description: "Natural brightening bar soap infused with fruit extracts. Cleanses and brightens.",
    images: ["/goddess-glow/bar-soap-1.jpeg", "/goddess-glow/bar-soap-2.jpeg"],
  },
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
    <Card className="!bg-white overflow-hidden group border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-[280px] sm:h-[300px] md:h-[350px] overflow-hidden">
        <Image
          src={product.images[currentImageIndex] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Discount Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#E53935] text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-bold">
          -{discount}% OFF
        </div>
        {/* Image Navigation */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#1B1A17]" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
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
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? "bg-white w-4" : "bg-white/50"
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
          className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1B1A17] font-semibold py-4 sm:py-5 text-sm sm:text-base"
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

      <section
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url(/images/hero-20background-20image.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#1B1A17]/70" />
        <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#F0A500] mb-8 text-balance animate-fade-in">
              MIKENOVA GROUP
            </h1>
            <p className="text-xl md:text-2xl text-[#FAFAF8] mb-12 max-w-3xl mx-auto leading-relaxed">
              Where precision and prestige are integrated into every life sector.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#F0A500] text-[#1B1A17] hover:bg-[#F0A500]/90 font-medium tracking-wider text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
            >
              <Link href="/contact">
                GET IN TOUCH
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#252320]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Building2 className="h-8 w-8 text-[#F0A500]" />
              </div>
              <div className="font-serif text-4xl md:text-5xl text-[#F0A500] mb-2">12</div>
              <div className="text-sm text-[#A8A6A1] tracking-wider">SPECIALIZED DIVISIONS</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-8 w-8 text-[#F0A500]" />
              </div>
              <div className="font-serif text-4xl md:text-5xl text-[#F0A500] mb-2">15+</div>
              <div className="text-sm text-[#A8A6A1] tracking-wider">YEARS OF EXCELLENCE</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-[#F0A500]" />
              </div>
              <div className="font-serif text-4xl md:text-5xl text-[#F0A500] mb-2">10K+</div>
              <div className="text-sm text-[#A8A6A1] tracking-wider">SATISFIED CLIENTS</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-[#F0A500]" />
              </div>
              <div className="font-serif text-4xl md:text-5xl text-[#F0A500] mb-2">500+</div>
              <div className="text-sm text-[#A8A6A1] tracking-wider">PREMIUM PRODUCTS</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-[#F0A500] mb-4">Featured Collection</h2>
            <p className="text-lg text-[#1B1A17] max-w-2xl mx-auto">
              Discover our curated selection of premium products across all divisions
            </p>
          </div>

          <div className="mb-16">
            <h3 className="font-serif text-2xl md:text-3xl text-[#F0A500] mb-8 text-center">Cosmetics & Beauty</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.cosmetics.map((product, index) => (
                <Card
                  key={index}
                  className="bg-white border-[#D4D2CC] hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="h-80 bg-gradient-to-br from-[#FAFAF8] via-white to-[#F5F5F0] flex items-center justify-center p-8">
                    <Image
                      src={
                        index === 0
                          ? "/products/luxury-face-serum-new.png"
                          : index === 1
                            ? "/products/gold-moisturizer.jpg"
                            : "/products/diamond-eye-cream.png"
                      }
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
                    />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-xs text-[#6B6A67] mb-2 tracking-wider uppercase">{product.brand}</p>
                    <h4 className="font-serif text-lg text-[#1B1A17] mb-4">{product.name}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-[#F0A500] text-[#F0A500] hover:bg-[#F0A500] hover:text-[#1B1A17] font-medium tracking-wider bg-transparent"
                    >
                      INQUIRE
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h3 className="font-serif text-2xl md:text-3xl text-[#F0A500] mb-8 text-center">Fashion & Accessories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.fashion.map((product, index) => (
                <Card
                  key={index}
                  className="bg-white border-[#D4D2CC] hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="h-80 bg-gradient-to-br from-[#FAFAF8] via-white to-[#F5F5F0] flex items-center justify-center p-8">
                    <Image
                      src={
                        index === 0
                          ? "/products/designer-leather-boots.jpg"
                          : index === 1
                            ? "/products/luxury-handbag-new.jpg"
                            : "/products/silk-evening-dress-new.png"
                      }
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
                    />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-xs text-[#6B6A67] mb-2 tracking-wider uppercase">{product.brand}</p>
                    <h4 className="font-serif text-lg text-[#1B1A17] mb-4">{product.name}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-[#F0A500] text-[#F0A500] hover:bg-[#F0A500] hover:text-[#1B1A17] font-medium tracking-wider bg-transparent"
                    >
                      INQUIRE
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h3 className="font-serif text-2xl md:text-3xl text-[#F0A500] mb-8 text-center">Home & Furniture</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.furniture.map((product, index) => (
                <Card
                  key={index}
                  className="bg-white border-[#D4D2CC] hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="h-80 bg-gradient-to-br from-[#FAFAF8] via-white to-[#F5F5F0] flex items-center justify-center p-8">
                    <Image
                      src={
                        index === 0
                          ? "/products/executive-office-chair.webp"
                          : index === 1
                            ? "/products/luxury-dining-table.webp"
                            : "/products/designer-sofa-set.webp"
                      }
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
                    />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-xs text-[#6B6A67] mb-2 tracking-wider uppercase">{product.brand}</p>
                    <h4 className="font-serif text-lg text-[#1B1A17] mb-4">{product.name}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-[#F0A500] text-[#F0A500] hover:bg-[#F0A500] hover:text-[#1B1A17] font-medium tracking-wider bg-transparent"
                    >
                      INQUIRE
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h3 className="font-serif text-2xl md:text-3xl text-[#F0A500] mb-8 text-center">Pharmacy Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.pharmacy.map((product, index) => (
                <Card
                  key={index}
                  className="bg-white border-[#D4D2CC] hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="h-80 bg-gradient-to-br from-[#FAFAF8] via-white to-[#F5F5F0] flex items-center justify-center p-8">
                    <Image
                      src={
                        index === 0
                          ? "/products/premium-supplement-bottles.avif"
                          : index === 1
                            ? "/products/advanced-vitamin-packaging.jpg"
                            : "/products/medical-grade-health-products.jpg"
                      }
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
                    />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-xs text-[#6B6A67] mb-2 tracking-wider uppercase">{product.brand}</p>
                    <h4 className="font-serif text-lg text-[#1B1A17] mb-4">{product.name}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-[#F0A500] text-[#F0A500] hover:bg-[#F0A500] hover:text-[#1B1A17] font-medium tracking-wider bg-transparent"
                    >
                      INQUIRE
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h3 className="font-serif text-2xl md:text-3xl text-[#F0A500] mb-8 text-center">Dispensary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.dispensary.map((product, index) => (
                <Card
                  key={index}
                  className="bg-white border-[#D4D2CC] hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="h-80 bg-gradient-to-br from-[#FAFAF8] via-white to-[#F5F5F0] flex items-center justify-center p-8">
                    <Image
                      src={
                        index === 0
                          ? "/products/wellness-package-kit.jpg"
                          : index === 1
                            ? "/products/medical-supplies-kit.webp"
                            : "/products/premium-health-monitoring-devices.jpg"
                      }
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
                    />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-xs text-[#6B6A67] mb-2 tracking-wider uppercase">{product.brand}</p>
                    <h4 className="font-serif text-lg text-[#1B1A17] mb-4">{product.name}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-[#F0A500] text-[#F0A500] hover:bg-[#F0A500] hover:text-[#1B1A17] font-medium tracking-wider bg-transparent"
                    >
                      INQUIRE
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="bg-[#F0A500] text-[#1B1A17] hover:bg-[#F0A500]/90 font-medium tracking-wider"
            >
              <Link href="/products">
                VIEW ALL PRODUCTS
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-medium tracking-wider text-xs sm:text-sm uppercase">Shop Now</span>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#D4AF37]" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl text-[#1B1A17] mb-3 sm:mb-4">
              Goddess Glow Collection
            </h2>
            <p className="text-[#4A4A4A] text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
              Discover our signature skincare line for radiant, glowing skin
            </p>
            <div className="inline-block bg-[#E53935] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold mt-3 sm:mt-4">
              Limited Time: 20% OFF All Products!
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {goddessGlowProducts.map((product) => (
              <HomeProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Button
              asChild
              size="lg"
              className="bg-[#1B1A17] hover:bg-[#2a2925] text-[#FAFAF8] font-medium tracking-wider px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base"
            >
              <Link href="/goddess-glow">
                View Full Collection & Buy
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-[#1B1A17] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/goddess-glow/natural-beauty.png" alt="Background" fill className="object-cover" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="/goddess-glow/hero-beach.png"
                alt="Goddess Glow Brightening Body Cream"
                fill
                className="object-cover"
              />
            </div>
            <div className="text-center lg:text-left">
              <div className="inline-block bg-[#F0A500]/10 border border-[#F0A500] px-4 py-2 rounded-full mb-6">
                <span className="text-[#F0A500] text-sm font-medium tracking-wider uppercase">Featured Product</span>
              </div>
              <h2 className="font-serif text-4xl md:text-6xl text-[#F0A500] mb-6">Goddess Glow</h2>
              <p className="text-2xl md:text-3xl text-[#FAFAF8] mb-4 font-light">Brightening Body Cream</p>
              <p className="text-lg text-[#A8A6A1] mb-8 leading-relaxed max-w-xl">
                Experience the skincare secret trusted by thousands of women across Africa. Reveal your natural radiance
                with our premium brightening formula that fades dark spots, evens skin tone, and restores your youthful
                glow.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-[#F0A500] text-[#1B1A17] hover:bg-[#F0A500]/90 font-medium tracking-wider text-lg px-10 py-6 transition-all duration-300 hover:scale-105"
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

      <section className="py-24 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-[#F0A500] mb-4">Our Divisions</h2>
            <p className="text-lg text-[#A8A6A1] max-w-2xl mx-auto">
              Explore our five signature categories of excellence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {divisions.map((division, index) => (
              <Card
                key={index}
                className="bg-[#252320] border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 group overflow-hidden"
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
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B1A17] via-[#1B1A17]/50 to-transparent" />
                </div>
                <CardContent className="p-8">
                  <h3 className="font-serif text-xl text-[#F0A500] mb-3 group-hover:scale-105 transition-transform">
                    {division.title}
                  </h3>
                  <p className="text-[#A8A6A1] text-sm leading-relaxed mb-4">{division.description}</p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full border-[#F0A500] text-[#F0A500] hover:bg-[#F0A500] hover:text-[#1B1A17] font-medium tracking-wider bg-transparent"
                  >
                    <Link href={`/products?category=${division.category}`}>EXPLORE</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#252320] border-y border-[#F0A500]/20">
        <div className="container mx-auto px-4 lg:px-8">
          <h3 className="font-serif text-2xl md:text-3xl text-[#F0A500] text-center mb-12">Our Brand Partners</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/tommy-hilfiger.png"
                alt="Tommy Hilfiger"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/hm.png"
                alt="H&M"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/chanel.png"
                alt="Chanel"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/sephora.png"
                alt="Sephora"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/gucci.png"
                alt="Gucci"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/loreal.png"
                alt="L'Oréal"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/hermes.png"
                alt="Hermès"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/zara.png"
                alt="Zara"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/deldar.webp"
                alt="Deldar"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/orca.png"
                alt="Orca"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/empress-furniture.jpg"
                alt="Empress Furniture"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/palmers.jpg"
                alt="Palmer's"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/istikbal.png"
                alt="İstikbal"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/cerave.png"
                alt="CeraVe"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/la-roche-posay.png"
                alt="La Roche-Posay"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="aspect-square bg-[#FAFAF8] border border-[#3A3835] hover:border-[#F0A500] transition-all duration-300 flex items-center justify-center p-4 group">
              <Image
                src="/brands/brand-logo.avif"
                alt="Brand Partner"
                width={120}
                height={120}
                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-[#F0A500] mb-4">Latest Arrivals</h2>
            <p className="text-lg text-[#1B1A17] max-w-2xl mx-auto">Discover our newest additions to the collection</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {latestArrivals.map((product, index) => (
              <Card
                key={index}
                className="bg-white border-[#D4D2CC] hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
              >
                <div className="absolute top-4 right-4 z-10 bg-[#F0A500] text-[#1B1A17] text-xs font-bold px-3 py-1 tracking-wider">
                  NEW
                </div>
                <div className="aspect-square bg-white flex items-center justify-center">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
                  />
                </div>
                <CardContent className="p-6">
                  <p className="text-xs text-[#6B6A67] mb-2 tracking-wider uppercase">{product.brand}</p>
                  <h4 className="font-serif text-lg text-[#1B1A17] mb-2">{product.name}</h4>
                  <p className="text-xs text-[#A8A6A1] mb-4">{product.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#F0A500] text-[#F0A500] hover:bg-[#F0A500] hover:text-[#1B1A17] font-medium tracking-wider bg-transparent"
                  >
                    INQUIRE
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#1B1A17]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-[#F0A500] mb-4">Client Testimonials</h2>
            <p className="text-lg text-[#A8A6A1] max-w-2xl mx-auto">
              Hear from those who have experienced the MIKENOVA standard
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-[#FAFAF8] border-[#E8E6E1] hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardContent className="p-8 text-center">
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

                  <p className="text-[#1B1A17] text-sm leading-relaxed">{testimonial.quote}</p>
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

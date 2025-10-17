"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all")

  const categories = [
    { id: "all", label: "ALL PRODUCTS" },
    { id: "cosmetics", label: "COSMETICS" },
    { id: "fashion", label: "FASHION" },
    { id: "furniture", label: "FURNITURE" },
    { id: "pharmacy", label: "PHARMACY" },
    { id: "dispensary", label: "DISPENSARY" },
  ]

  const products = [
    // Cosmetics
    {
      name: "Luxury Face Serum",
      category: "cosmetics",
      brand: "Premium Skincare",
      image: "/products/luxury-face-serum-new.png",
    },
    {
      name: "Gold Infused Moisturizer",
      category: "cosmetics",
      brand: "Elite Beauty",
      image: "/products/gold-moisturizer.jpg",
    },
    {
      name: "Diamond Eye Cream",
      category: "cosmetics",
      brand: "Luxury Cosmetics",
      image: "/products/diamond-eye-cream.png",
    },
    {
      name: "Premium Face Mask",
      category: "cosmetics",
      brand: "Beauty Elite",
      image: "/arrivals/la-mer-cream.avif",
    },
    {
      name: "Anti-Aging Serum",
      category: "cosmetics",
      brand: "Premium Care",
      image: "/products/anti-aging-serum.webp", // replaced duplicate with new anti-aging serum image
    },
    {
      name: "Luxury Perfume",
      category: "cosmetics",
      brand: "Fragrance House",
      image: "/arrivals/tom-ford-oud-wood.jpg",
    },
    // Fashion
    {
      name: "Designer Leather Boots",
      category: "fashion",
      brand: "Fashion Elite",
      image: "/products/designer-leather-boots.jpg",
    },
    {
      name: "Luxury Handbag",
      category: "fashion",
      brand: "Premium Label",
      image: "/products/luxury-handbag-new.jpg",
    },
    {
      name: "Silk Evening Dress",
      category: "fashion",
      brand: "Couture Brand",
      image: "/products/silk-evening-dress-new.png",
    },
    {
      name: "Cashmere Coat",
      category: "fashion",
      brand: "Luxury Fashion",
      image: "/products/cashmere-coat.webp", // replaced duplicate with new cashmere coat image
    },
    {
      name: "Designer Sunglasses",
      category: "fashion",
      brand: "Premium Eyewear",
      image: "/arrivals/rolex-submariner.jpg",
    },
    {
      name: "Leather Wallet",
      category: "fashion",
      brand: "Elite Accessories",
      image: "/products/leather-wallet.jpg", // replaced duplicate with new leather wallet image
    },
    // Furniture
    {
      name: "Executive Office Chair",
      category: "furniture",
      brand: "Premium Furniture",
      image: "/products/executive-office-chair.webp",
    },
    {
      name: "Luxury Dining Table",
      category: "furniture",
      brand: "Elite Home",
      image: "/products/luxury-dining-table.webp",
    },
    {
      name: "Designer Sofa Set",
      category: "furniture",
      brand: "Luxury Living",
      image: "/products/designer-sofa-set.webp",
    },
    {
      name: "Modern Coffee Table",
      category: "furniture",
      brand: "Contemporary Design",
      image: "/products/modern-coffee-table.jpg", // replaced with new modern coffee table image
    },
    {
      name: "Luxury Bed Frame",
      category: "furniture",
      brand: "Premium Bedroom",
      image: "/products/designer-sofa-set.webp",
    },
    {
      name: "Designer Bookshelf",
      category: "furniture",
      brand: "Elite Storage",
      image: "/products/luxury-dining-table.webp",
    },
    // Pharmacy
    {
      name: "Premium Supplements",
      category: "pharmacy",
      brand: "Health Plus",
      image: "/products/premium-supplement-bottles.avif",
    },
    {
      name: "Advanced Vitamins",
      category: "pharmacy",
      brand: "Wellness Pro",
      image: "/products/advanced-vitamin-packaging.jpg",
    },
    {
      name: "Medical Grade Products",
      category: "pharmacy",
      brand: "Care Elite",
      image: "/products/medical-grade-health-products.jpg",
    },
    {
      name: "Immunity Boosters",
      category: "pharmacy",
      brand: "Health First",
      image: "/arrivals/himalaya-ashwagandha.webp",
    },
    {
      name: "Pain Relief Medication",
      category: "pharmacy",
      brand: "Medical Care",
      image: "/products/medical-grade-health-products.jpg",
    },
    {
      name: "Prescription Medicines",
      category: "pharmacy",
      brand: "Pharma Elite",
      image: "/arrivals/nature-made-prenatal.jpg",
    },
    // Dispensary
    {
      name: "Wellness Package",
      category: "dispensary",
      brand: "Health First",
      image: "/products/wellness-package-kit.jpg",
    },
    {
      name: "Medical Supplies Kit",
      category: "dispensary",
      brand: "Care Pro",
      image: "/products/medical-supplies-kit.webp",
    },
    {
      name: "Premium Health Items",
      category: "dispensary",
      brand: "Wellness Elite",
      image: "/products/premium-health-monitoring-devices.jpg",
    },
    {
      name: "First Aid Kit",
      category: "dispensary",
      brand: "Emergency Care",
      image: "/products/medical-supplies-kit.webp",
    },
    {
      name: "Health Monitoring Devices",
      category: "dispensary",
      brand: "Medical Tech",
      image: "/arrivals/omron-blood-pressure.webp",
    },
    {
      name: "Wellness Supplements",
      category: "dispensary",
      brand: "Health Pro",
      image: "/products/wellness-package-kit.jpg",
    },
  ]

  const filteredProducts = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-[#1B1A17]">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#1B1A17]">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#F0A500] text-center mb-4">
            Our Collection
          </h1>
          <p className="font-serif text-xl md:text-2xl text-[#FAFAF8] text-center italic max-w-3xl mx-auto">
            Handpicked premium products across all divisions. Every item meets the MIKENOVA standard of excellence.
          </p>
        </div>
      </section>

      <section className="py-8 bg-[#252320] sticky top-20 z-40 border-y border-[#F0A500]/20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={
                  activeCategory === category.id
                    ? "bg-[#F0A500] text-[#1B1A17] hover:bg-[#F0A500]/90 font-medium tracking-wider transition-all duration-300"
                    : "border-[#F0A500] text-[#F0A500] hover:bg-[#F0A500] hover:text-[#1B1A17] font-medium tracking-wider transition-all duration-300"
                }
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-[#6B6A67]">
              Showing {filteredProducts.length} {activeCategory === "all" ? "products" : `${activeCategory} products`}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <Card
                key={index}
                className="bg-white border-[#D4D2CC] hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="aspect-square bg-white relative overflow-hidden flex items-center justify-center p-8">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <p className="text-xs text-[#6B6A67] mb-2 tracking-wider uppercase">{product.brand}</p>
                  <h3 className="font-serif text-lg text-[#1B1A17] mb-4 min-h-[3.5rem]">{product.name}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-[#F0A500] text-[#F0A500] hover:bg-[#F0A500] hover:text-[#1B1A17] font-medium tracking-wider transition-all duration-300 bg-transparent"
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
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-5xl text-[#F0A500] mb-6">Can't Find What You're Looking For?</h2>
            <p className="text-lg text-[#A8A6A1] mb-10 leading-relaxed">
              Contact us directly to inquire about specific products or custom orders.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#F0A500] text-[#1B1A17] hover:bg-[#F0A500]/90 font-medium tracking-wider text-lg px-10 py-6 transition-all duration-300 hover:scale-105"
            >
              <Link href="/contact">
                CONTACT US
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

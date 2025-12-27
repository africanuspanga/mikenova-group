"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  Shield,
  Leaf,
  MessageCircle,
  Building2,
  QrCode,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { getProducts, type Product } from "@/lib/products-store"

interface CartItem extends Product {
  quantity: number
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product) => void }) {
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
      <div className="relative h-[300px] sm:h-[350px] overflow-hidden">
        <Image
          src={product.images[currentImageIndex] || "/placeholder.svg?height=400&width=400&query=skincare product"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Discount Badge */}
        <div className="absolute top-4 left-4 bg-[#E53935] text-white px-3 py-1 rounded-full text-sm font-bold">
          -{discount}%
        </div>

        {/* Image Navigation - Always visible on mobile */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-[#1B1A17]" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-[#1B1A17]" />
            </button>
            {/* Image Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? "bg-[#F0A500] w-4" : "bg-white/70"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <CardContent className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-[#1B1A17] mb-2">{product.name}</h3>
        <p className="text-[#1B1A17]/70 text-sm mb-4 line-clamp-2">{product.description}</p>

        {/* Pricing */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl sm:text-2xl font-bold text-[#1B1A17]">TZS {product.price.toLocaleString()}</span>
          <span className="text-[#1B1A17]/50 line-through text-sm">TZS {product.originalPrice.toLocaleString()}</span>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={() => onAddToCart(product)}
          className="w-full bg-[#F0A500] hover:bg-[#F0A500]/90 text-[#1B1A17] font-semibold py-5 sm:py-6 text-base"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Ongeza Kwenye Cart
        </Button>
      </CardContent>
    </Card>
  )
}

export default function GoddessGlowPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "bank" | "lipa-namba" | null>(null)
  const [showConfirmationForm, setShowConfirmationForm] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  // Confirmation form state
  const [confirmationForm, setConfirmationForm] = useState({
    name: "",
    phone: "",
    location: "",
    description: "",
    transactionId: "",
  })

  // New states for managing cart and product images
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [showLipaNamba, setShowLipaNamba] = useState(false)
  const [confirmationData, setConfirmationData] = useState({
    name: "",
    phone: "",
    location: "",
    description: "",
    transactionId: "",
  })

  useEffect(() => {
    const fetchedProducts = getProducts()
    setProducts(fetchedProducts)
    setAllProducts(fetchedProducts) // Set allProducts as well
    // Initialize currentImageIndex for each product
    const initialImageIndex = fetchedProducts.reduce(
      (acc, product) => {
        acc[product.id] = 0
        return acc
      },
      {} as { [key: string]: number },
    )
    setCurrentImageIndex(initialImageIndex)
  }, [])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleWhatsAppOrder = () => {
    const orderDetails = cart
      .map((item) => `${item.name} x${item.quantity} = TZS ${(item.price * item.quantity).toLocaleString()}`)
      .join("\n")

    const message = `Habari! Nataka kuorder:\n\n${orderDetails}\n\nJumla: TZS ${cartTotal.toLocaleString()}`
    const whatsappUrl = `https://wa.me/255675622238?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleConfirmationSubmit = () => {
    const { name, phone, location, description, transactionId } = confirmationData

    if (!name || !phone || !location || !transactionId) {
      alert("Tafadhali jaza taarifa zote zinazohitajika")
      return
    }

    const orderDetails = cart
      .map((item) => `${item.name} x${item.quantity} = TZS ${(item.price * item.quantity).toLocaleString()}`)
      .join("\n")

    const paymentType =
      paymentMethod === "bank" ? "Bank Transfer (NBC)" : paymentMethod === "lipa-namba" ? "Lipa Namba" : "Unknown"

    const message = `THIBITISHO LA MALIPO - GODDESS GLOW\n\n📦 Order:\n${orderDetails}\n\n💰 Jumla: TZS ${cartTotal.toLocaleString()}\n\n💳 Njia ya Malipo: ${paymentType}\n🧾 Transaction ID: ${transactionId}\n\n👤 Jina: ${name}\n📱 Simu: ${phone}\n📍 Eneo: ${location}\n📝 Maelezo: ${description || "Hakuna"}`

    const whatsappUrl = `https://wa.me/255675622238?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")

    // Reset
    setShowConfirmationForm(false)
    setConfirmationData({ name: "", phone: "", location: "", description: "", transactionId: "" })
    setPaymentMethod(null)
    setIsCartOpen(false)
    setCart([])
    setShowPaymentOptions(false)
    setShowBankDetails(false)
    setShowLipaNamba(false)
  }

  // New functions for image navigation within ProductCard
  const nextImage = (productId: string, imageCount: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [productId]: (prev[productId] + 1) % imageCount,
    }))
  }

  const prevImage = (productId: string, imageCount: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [productId]: (prev[productId] - 1 + imageCount) % imageCount,
    }))
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Navigation component */}
      <Navigation />

      {/* Hero Section */}
      <section
        className="relative text-[#FAFAF8] py-16 sm:py-24 lg:py-32 overflow-hidden pt-28 sm:pt-32"
        style={{
          backgroundImage: "url(/goddess-glow/body-oil-hero.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-[#1B1A17]/70" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Visible logo */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <Image
                src="/logo-new.png"
                alt="MIKENOVA GROUP"
                width={280}
                height={90}
                className="h-16 sm:h-20 lg:h-24 w-auto"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-2 bg-[#F0A500]/20 border border-[#F0A500]/30 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6">
              <Sparkles className="w-4 h-4 text-[#F0A500]" />
              <span className="text-xs sm:text-sm text-[#F0A500] font-medium">Premium Skincare Collection</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="text-[#F0A500]">Goddess Glow</span>
              <br />
              <span className="text-[#FAFAF8]">Brightening Collection</span>
            </h1>

            <p className="text-base sm:text-xl text-[#FAFAF8]/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
              Gundua siri ya ngozi inayong&apos;aa na bidhaa zetu za asili. Brightening cream, oil, na soap zilizoundwa
              kutoa matokeo ya kushangaza.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button
                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-[#F0A500] hover:bg-[#F0A500]/90 text-[#1B1A17] font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Nunua Sasa
              </Button>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-[#FAFAF8] text-[#FAFAF8] bg-transparent hover:bg-[#FAFAF8]/10 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
                >
                  Rudi Nyumbani
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B1A17] mb-4">
              Kuhusu <span className="text-[#F0A500]">Goddess Glow</span>
            </h2>
            <p className="text-[#1B1A17]/70 text-base sm:text-lg leading-relaxed">
              Furahia ngozi inayong&apos;aa na bidhaa zetu bora kuanzia Goddess Glow Body Cream, Goddess Glow Body Oil
              na Goddess Glow Bar Soap.
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-12 sm:py-20 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-[#1B1A17] mb-3 sm:mb-4">Bidhaa Zetu</h2>
            <p className="text-[#1B1A17]/60 max-w-2xl mx-auto text-sm sm:text-base px-4">
              Chagua bidhaa unayoipenda na uongeze kwenye kikapu chako
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {allProducts.map((product) => (
              <Card
                key={product.id}
                className="!bg-white overflow-hidden group hover:shadow-xl transition-all duration-300 border-[#F0A500]/20"
              >
                <div className="relative aspect-square overflow-hidden">
                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 z-10 bg-[#E53935] text-white text-xs font-bold px-2 py-1 rounded">
                    -20%
                  </div>

                  {/* Product Image */}
                  <Image
                    src={product.images[currentImageIndex[product.id] || 0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Image Navigation - Always visible on mobile */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={() => prevImage(product.id, product.images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#1B1A17]" />
                      </button>
                      <button
                        onClick={() => nextImage(product.id, product.images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#1B1A17]" />
                      </button>

                      {/* Image Dots */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {product.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              setCurrentImageIndex((prev) => ({
                                ...prev,
                                [product.id]: idx,
                              }))
                            }
                            className={`w-2 h-2 rounded-full transition-all ${
                              (currentImageIndex[product.id] || 0) === idx ? "bg-[#F0A500] w-4" : "bg-white/70"
                            }`}
                            aria-label={`Go to image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-[#1B1A17] mb-2">{product.name}</h3>
                  <p className="text-[#1B1A17]/60 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <span className="text-xl sm:text-2xl font-bold text-[#F0A500]">
                      TZS {product.price.toLocaleString()}
                    </span>
                    <span className="text-sm sm:text-base text-[#1B1A17]/40 line-through">
                      TZS {Math.round(product.price * 1.2).toLocaleString()}
                    </span>
                  </div>

                  <Button
                    onClick={() => addToCart(product)}
                    className="w-full bg-[#1B1A17] hover:bg-[#1B1A17]/90 text-[#FAFAF8] font-medium py-4 sm:py-5 text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Ongeza Kwenye Kikapu
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 bg-[#1B1A17]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#FAFAF8] mb-8 sm:mb-12">
            Kwa Nini <span className="text-[#F0A500]">Goddess Glow?</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Star, title: "Ubora wa Juu", desc: "Viambato bora vilivyochaguliwa kwa uangalifu" },
              { icon: Shield, title: "Salama", desc: "Imethibitishwa na wataalamu wa ngozi" },
              { icon: Leaf, title: "Asili", desc: "Viambato vya asili bila kemikali kali" },
              { icon: Check, title: "Matokeo", desc: "Matokeo yanayoonekana ndani ya wiki 2-4" },
            ].map((benefit, idx) => (
              <div key={idx} className="text-center p-4 sm:p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[#F0A500]/20 rounded-full mb-3 sm:mb-4">
                  <benefit.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#F0A500]" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#FAFAF8] mb-1 sm:mb-2">{benefit.title}</h3>
                <p className="text-[#FAFAF8]/60 text-xs sm:text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 sm:py-20 bg-[#FAFAF8]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B1A17] mb-3 sm:mb-4">
              Tazama <span className="text-[#F0A500]">Video Yetu</span>
            </h2>
            <p className="text-[#1B1A17]/60 text-sm sm:text-base">Gundua zaidi kuhusu bidhaa zetu za Goddess Glow</p>
          </div>

          <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
            <video controls className="w-full h-full object-cover" poster="/goddess-glow/body-oil-hero.jpeg">
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/promo%20video-XwIGcoZzWkdIGf3tXnbTNxVgHCMqtX.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Floating Cart Button - Mobile optimized */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#F0A500] text-[#1B1A17] p-3 sm:p-4 rounded-full shadow-2xl hover:bg-[#F0A500]/90 transition-all hover:scale-110"
        aria-label="Open cart"
      >
        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#E53935] text-white text-xs w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-bold">
            {cartCount}
          </span>
        )}
      </button>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsCartOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-lg sm:mx-4 max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col rounded-t-2xl sm:rounded-2xl">
            {/* Cart Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#F0A500]/20">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1B1A17]">Kikapu Chako</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-[#F0A500]/10 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#1B1A17]" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {cart.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-[#1B1A17]/20 mx-auto mb-4" />
                  <p className="text-[#1B1A17]/60">Kikapu chako ni tupu</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-[#FAFAF8] rounded-xl">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.images[0] || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#1B1A17] text-sm sm:text-base truncate">{item.name}</h3>
                        <p className="text-[#F0A500] font-bold text-sm sm:text-base">
                          TZS {item.price.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 bg-[#1B1A17] text-white rounded"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <span className="w-6 sm:w-8 text-center text-[#1B1A17] font-medium text-sm sm:text-base">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 bg-[#1B1A17] text-white rounded"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto p-1 text-[#E53935] hover:bg-[#E53935]/10 rounded"
                            aria-label="Remove item"
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-[#F0A500]/20 p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <span className="text-base sm:text-lg font-medium text-[#1B1A17]">Jumla:</span>
                  <span className="text-xl sm:text-2xl font-bold text-[#F0A500]">TZS {cartTotal.toLocaleString()}</span>
                </div>

                {!showPaymentOptions ? (
                  <Button
                    onClick={() => setShowPaymentOptions(true)}
                    className="w-full bg-[#F0A500] hover:bg-[#F0A500]/90 text-[#1B1A17] font-semibold py-5 sm:py-6 text-base sm:text-lg"
                  >
                    Endelea Kulipa
                  </Button>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-center text-[#1B1A17]/70 mb-2 sm:mb-3 text-sm sm:text-base">
                      Chagua njia ya malipo:
                    </p>

                    {/* WhatsApp */}
                    <Button
                      onClick={handleWhatsAppOrder}
                      className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white font-medium py-4 sm:py-5 text-sm sm:text-base"
                    >
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Agiza kupitia WhatsApp
                    </Button>

                    {/* Bank Transfer */}
                    <Button
                      onClick={() => setShowBankDetails(!showBankDetails)}
                      className="w-full bg-[#1B1A17] hover:bg-[#1B1A17]/90 text-[#FAFAF8] font-medium py-4 sm:py-5 text-sm sm:text-base"
                    >
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Lipa kupitia Benki
                    </Button>

                    {showBankDetails && (
                      <div className="bg-[#FAFAF8] p-3 sm:p-4 rounded-xl space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-3 mb-3">
                          <Image
                            src="/goddess-glow/nbc-logo.png"
                            alt="NBC Bank"
                            width={60}
                            height={40}
                            className="h-8 sm:h-10 w-auto"
                          />
                          <span className="font-semibold text-[#1B1A17] text-sm sm:text-base">
                            National Bank of Commerce
                          </span>
                        </div>
                        <div className="space-y-1 text-xs sm:text-sm">
                          <p className="text-[#1B1A17]">
                            <span className="text-[#1B1A17]/60">Account:</span>{" "}
                            <span className="font-mono font-bold">048174113791</span>
                          </p>
                          <p className="text-[#1B1A17]">
                            <span className="text-[#1B1A17]/60">Name:</span>{" "}
                            <span className="font-bold">MICHAEL C ELIA</span>
                          </p>
                        </div>
                        <button
                          onClick={() => setShowConfirmationForm(true)}
                          className="text-[#F0A500] text-xs sm:text-sm font-medium hover:underline mt-2"
                        >
                          Malipo yamekamilika? Bofya hapa!
                        </button>
                      </div>
                    )}

                    {/* Lipa Namba */}
                    <Button
                      onClick={() => setShowLipaNamba(!showLipaNamba)}
                      className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#1B1A17] font-medium py-4 sm:py-5 text-sm sm:text-base"
                    >
                      <QrCode className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Lipa Namba (Scan QR)
                    </Button>

                    {showLipaNamba && (
                      <div className="bg-[#FAFAF8] p-3 sm:p-4 rounded-xl">
                        <div className="relative aspect-square max-w-[200px] sm:max-w-[250px] mx-auto">
                          <Image
                            src="/goddess-glow/lipa-namba.png"
                            alt="Lipa Namba QR Code"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <p className="text-center text-[#1B1A17]/70 text-xs sm:text-sm mt-2">Scan QR code kulipa</p>
                        <button
                          onClick={() => setShowConfirmationForm(true)}
                          className="block w-full text-center text-[#F0A500] text-xs sm:text-sm font-medium hover:underline mt-2"
                        >
                          Malipo yamekamilika? Bofya hapa!
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Confirmation Form Modal */}
      {showConfirmationForm && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowConfirmationForm(false)} />
          <div className="relative bg-white w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-[#1B1A17]">Thibitisha Malipo</h3>
                <button
                  onClick={() => setShowConfirmationForm(false)}
                  className="p-2 hover:bg-[#F0A500]/10 rounded-full"
                  aria-label="Close form"
                >
                  <X className="w-5 h-5 text-[#1B1A17]" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B1A17] mb-1">Jina Lako</label>
                  <Input
                    value={confirmationData.name}
                    onChange={(e) => setConfirmationData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ingiza jina lako"
                    className="bg-white text-[#1B1A17] border-[#F0A500]/30 placeholder:text-[#1B1A17]/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1B1A17] mb-1">Namba ya Simu</label>
                  <Input
                    value={confirmationData.phone}
                    onChange={(e) => setConfirmationData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="0712 345 678"
                    className="bg-white text-[#1B1A17] border-[#F0A500]/30 placeholder:text-[#1B1A17]/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1B1A17] mb-1">Mahali Unapoishi</label>
                  <Input
                    value={confirmationData.location}
                    onChange={(e) => setConfirmationData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Mfano: Kinondoni, Dar es Salaam"
                    className="bg-white text-[#1B1A17] border-[#F0A500]/30 placeholder:text-[#1B1A17]/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1B1A17] mb-1">Maelezo ya Ziada</label>
                  <Textarea
                    value={confirmationData.description}
                    onChange={(e) => setConfirmationData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Maelezo mengine kuhusu order yako..."
                    rows={2}
                    className="bg-white text-[#1B1A17] border-[#F0A500]/30 placeholder:text-[#1B1A17]/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1B1A17] mb-1">Transaction ID / Reference</label>
                  <Input
                    value={confirmationData.transactionId}
                    onChange={(e) => setConfirmationData((prev) => ({ ...prev, transactionId: e.target.value }))}
                    placeholder="Namba ya muamala"
                    className="bg-white text-[#1B1A17] border-[#F0A500]/30 placeholder:text-[#1B1A17]/40"
                  />
                </div>

                <Button
                  onClick={handleConfirmationSubmit}
                  className="w-full bg-[#F0A500] hover:bg-[#F0A500]/90 text-[#1B1A17] font-semibold py-5 sm:py-6 text-sm sm:text-base mt-2"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Tuma Uthibitisho
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer component */}
      <Footer />
    </div>
  )
}

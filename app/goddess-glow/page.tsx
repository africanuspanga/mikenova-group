"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Sparkles,
  Shield,
  Droplets,
  Sun,
  Play,
  CheckCircle,
  Clock,
} from "lucide-react"
import { getProducts, type Product } from "@/lib/products-store"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AuthenticityGuide } from "@/app/sections/authenticity-guide"
import { toast, Toaster } from "sonner"

interface CartItem extends Product {
  quantity: number
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product) => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
  }, [product.images.length])

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }, [product.images.length])

  return (
    <Card className="!bg-white overflow-hidden group border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-[280px] sm:h-[320px] md:h-[350px] overflow-hidden">
        <Image
          src={product.images[currentImageIndex] || "/placeholder.svg?height=400&width=400&query=skincare product"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Discount Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#E53935] text-white px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-bold">
          -{discount}%
        </div>

        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white active:bg-white p-2.5 sm:p-2 rounded-full shadow-lg transition-all touch-manipulation"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 sm:w-5 sm:h-5 text-[#1B1A17]" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white active:bg-white p-2.5 sm:p-2 rounded-full shadow-lg transition-all touch-manipulation"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 sm:w-5 sm:h-5 text-[#1B1A17]" />
            </button>
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 sm:gap-2">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full transition-all touch-manipulation ${
                    idx === currentImageIndex ? "bg-[#F0A500] w-5 sm:w-4" : "bg-white/70"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <CardContent className="p-4 sm:p-5 md:p-6">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1B1A17] mb-1.5 sm:mb-2">{product.name}</h3>
        <p className="text-[#1B1A17]/70 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{product.description}</p>

        {/* Pricing */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#1B1A17]">
            TZS {product.price.toLocaleString()}
          </span>
          <span className="text-[#1B1A17]/50 line-through text-xs sm:text-sm">
            TZS {product.originalPrice.toLocaleString()}
          </span>
        </div>

        <Button
          onClick={() => onAddToCart(product)}
          className="w-full bg-[#F0A500] hover:bg-[#F0A500]/90 active:bg-[#F0A500]/80 text-[#1B1A17] font-semibold py-4 sm:py-5 md:py-6 text-sm sm:text-base touch-manipulation"
        >
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  )
}

export default function GoddessGlowPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [showConfirmationForm, setShowConfirmationForm] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [confirmationData, setConfirmationData] = useState({
    name: "",
    phone: "",
    location: "",
    description: "",
    transactionId: "",
  })

  useEffect(() => {
    const loadedProducts = getProducts()
    setProducts(loadedProducts)
  }, [])

  const addToCart = useCallback((product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        toast.success(`${product.name} - Quantity increased!`, {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          position: "top-center",
          duration: 2000,
        })
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      toast.success(`${product.name} added to cart!`, {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        position: "top-center",
        duration: 2000,
      })
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== id))
    } else {
      setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
    toast.success("Item removed", {
      position: "top-center",
      duration: 1500,
    })
  }, [])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleWhatsAppOrder = useCallback(() => {
    const orderDetails = cart
      .map((item) => `• ${item.name} x${item.quantity} - TZS ${(item.price * item.quantity).toLocaleString()}`)
      .join("\n")
    const message = `🛒 *New Order - Goddess Glow*\n\n${orderDetails}\n\n💰 *Total: TZS ${cartTotal.toLocaleString()}*\n\nI would like to purchase these products.`
    window.open(`https://wa.me/255623821175?text=${encodeURIComponent(message)}`, "_blank")
  }, [cart, cartTotal])

  const handleConfirmationSubmit = useCallback(() => {
    if (!confirmationData.name || !confirmationData.phone || !confirmationData.location) {
      toast.error("Please fill all required information")
      return
    }

    const orderDetails = cart.map((item) => `• ${item.name} x${item.quantity}`).join("\n")
    const message = `✅ *Payment Confirmation - Goddess Glow*\n\n👤 *Name:* ${confirmationData.name}\n📱 *Phone:* ${confirmationData.phone}\n📍 *Location:* ${confirmationData.location}\n\n🛒 *Products:*\n${orderDetails}\n\n💰 *Total:* TZS ${cartTotal.toLocaleString()}\n\n💳 *Payment Method:* Bank Transfer\n🔢 *Transaction ID:* ${confirmationData.transactionId || "N/A"}\n\n📝 *Details:* ${confirmationData.description || "None"}`
    window.open(`https://wa.me/255623821175?text=${encodeURIComponent(message)}`, "_blank")

    setShowConfirmationForm(false)
    setConfirmationData({
      name: "",
      phone: "",
      location: "",
      description: "",
      transactionId: "",
    })
    toast.success("Thank you! We will contact you soon.")
  }, [cart, cartTotal, confirmationData])

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Toaster richColors />
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[75vh] sm:min-h-[80vh] flex items-center justify-center pt-24 sm:pt-28 md:pt-32">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/goddess-glow/body-oil-hero.jpeg"
            alt="Goddess Glow Products"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1B1A17]/80 via-[#1B1A17]/60 to-[#1B1A17]/80" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
          {/* Logo */}
          <div className="mb-5 sm:mb-6 md:mb-8">
            <Image
              src="/logo-new.png"
              alt="MIKENOVA GROUP"
              width={180}
              height={60}
              className="mx-auto w-[120px] sm:w-[150px] md:w-[180px] h-auto"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#FAFAF8] mb-3 sm:mb-4 md:mb-6 leading-tight">
            <span className="text-[#F0A500]">Goddess Glow</span>
            <br />
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal">Brightening Collection</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#FAFAF8]/90 max-w-3xl mx-auto mb-5 sm:mb-6 md:mb-8 leading-relaxed px-2">
            Enhance your skin with our premium Goddess Glow products. Brightening cream, oil, and soap for a radiant
            glow.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Button
              onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-[#F0A500] hover:bg-[#F0A500]/90 active:bg-[#F0A500]/80 text-[#1B1A17] font-semibold px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg touch-manipulation"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Shop Now
            </Button>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="border-[#FAFAF8] text-[#FAFAF8] hover:bg-[#FAFAF8]/10 active:bg-[#FAFAF8]/20 px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg w-full bg-transparent touch-manipulation"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section - Shorter */}
      <section className="py-10 sm:py-12 md:py-16 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1B1A17] mb-3 sm:mb-4 md:mb-6">
              About Goddess Glow
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#1B1A17]/80 leading-relaxed">
              Discover our premium Goddess Glow products that bring out the best in your skin.
            </p>
          </div>
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop" className="py-10 sm:py-16 md:py-20 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#1B1A17] mb-2 sm:mb-3 md:mb-4">
              Our <span className="text-[#F0A500]">Products</span>
            </h2>
            <p className="text-[#1B1A17]/70 text-xs sm:text-sm md:text-base max-w-2xl mx-auto px-2">
              Choose your favorite products and add them to your cart. Enjoy premium quality at unbeatable prices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
            {/* Coming Soon Card - Shower Gel */}
            <Card className="!bg-white overflow-hidden group border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-[280px] sm:h-[320px] md:h-[350px] overflow-hidden">
                <Image
                  src="/goddess-glow/Goddess Glow - Shower Gel.png"
                  alt="Goddess Glow Shower Gel - Coming Soon"
                  fill
                  className="object-cover blur-sm scale-110"
                />
                <div className="absolute inset-0 bg-[#1B1A17]/60 flex flex-col items-center justify-center">
                  <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-[#F0A500] mb-3" />
                  <span className="text-[#FAFAF8] text-xl sm:text-2xl md:text-3xl font-bold tracking-wider">
                    COMING SOON
                  </span>
                  <div className="mt-3 h-px w-16 bg-[#F0A500]" />
                </div>
              </div>
              <CardContent className="p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1B1A17] mb-1.5 sm:mb-2">
                  Goddess Glow Shower Gel
                </h3>
                <p className="text-[#1B1A17]/70 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                  Our newest shower gel formulation is on its way. Stay tuned for the launch!
                </p>
                <Button
                  disabled
                  className="w-full bg-[#1B1A17]/20 text-[#1B1A17]/40 font-semibold py-4 sm:py-5 md:py-6 text-sm sm:text-base cursor-not-allowed"
                >
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
            {/* Coming Soon Card - Sunscreen */}
            <Card className="!bg-white overflow-hidden group border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-[280px] sm:h-[320px] md:h-[350px] overflow-hidden">
                <Image
                  src="/images/GODDESS GLOW SUNSCREEN .jpeg"
                  alt="Goddess Glow Sunscreen - Coming Soon"
                  fill
                  className="object-cover blur-sm scale-110"
                />
                <div className="absolute inset-0 bg-[#1B1A17]/60 flex flex-col items-center justify-center">
                  <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-[#F0A500] mb-3" />
                  <span className="text-[#FAFAF8] text-xl sm:text-2xl md:text-3xl font-bold tracking-wider">
                    COMING SOON
                  </span>
                  <div className="mt-3 h-px w-16 bg-[#F0A500]" />
                </div>
              </div>
              <CardContent className="p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1B1A17] mb-1.5 sm:mb-2">
                  Goddess Glow Sunscreen
                </h3>
                <p className="text-[#1B1A17]/70 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                  Premium sunscreen with broad spectrum protection. Launching soon!
                </p>
                <Button
                  disabled
                  className="w-full bg-[#1B1A17]/20 text-[#1B1A17]/40 font-semibold py-4 sm:py-5 md:py-6 text-sm sm:text-base cursor-not-allowed"
                >
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-b from-[#1B1A17] to-[#2A2825]">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FAFAF8] text-center mb-6 sm:mb-8 md:mb-12">
            Why <span className="text-[#F0A500]">Goddess Glow?</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[
              {
                icon: Sparkles,
                title: "Premium Quality",
                desc: "Our products are of the highest quality",
              },
              {
                icon: Shield,
                title: "100% Safe",
                desc: "No harmful chemicals",
              },
              {
                icon: Droplets,
                title: "Long-lasting Moisture",
                desc: "Hydrates your skin for days",
              },
              {
                icon: Sun,
                title: "UVA Protection",
                desc: "Protects your skin from UV rays",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="!bg-white/5 border-[#F0A500]/20 text-center p-3 sm:p-4 md:p-6 hover:bg-white/10 transition-colors"
              >
                <item.icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#F0A500] mx-auto mb-2 sm:mb-3 md:mb-4" />
                <h3 className="font-bold text-[#FAFAF8] mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">{item.title}</h3>
                <p className="text-[#FAFAF8]/70 text-[10px] sm:text-xs md:text-sm leading-tight">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-[#1B1A17]">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FAFAF8] text-center mb-6 sm:mb-8 md:mb-12">
            Watch <span className="text-[#F0A500]">Our Video</span>
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
              {!isVideoPlaying ? (
                <div className="relative w-full h-full">
                  <Image src="/goddess-glow/body-cream-beach.png" alt="Video thumbnail" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      className="bg-[#F0A500] hover:bg-[#F0A500]/90 active:bg-[#F0A500]/80 text-[#1B1A17] p-4 sm:p-5 md:p-6 rounded-full transition-transform hover:scale-110 active:scale-95 touch-manipulation"
                      aria-label="Play video"
                    >
                      <Play className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12" />
                    </button>
                  </div>
                </div>
              ) : (
                <video
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/promo%20video-XwIGcoZzWkdIGf3tXnbTNxVgHCMqtX.mp4"
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      </section>

      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#F0A500] hover:bg-[#F0A500]/90 active:bg-[#F0A500]/80 text-[#1B1A17] p-3.5 sm:p-4 rounded-full shadow-2xl z-40 transition-transform hover:scale-110 active:scale-95 touch-manipulation"
        aria-label="Open cart"
      >
        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-[#E53935] text-white text-[10px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center animate-pulse">
            {cartCount}
          </span>
        )}
      </button>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsCartOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-lg sm:mx-4 max-h-[100vh] sm:max-h-[90vh] overflow-hidden rounded-t-2xl sm:rounded-2xl flex flex-col">
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {/* Cart Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-white pb-2">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1B1A17]">Your Cart</h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-[#F0A500]/10 active:bg-[#F0A500]/20 rounded-full touch-manipulation"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#1B1A17]" />
                </button>
              </div>

              {/* Cart Items */}
              {cart.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-[#1B1A17]/30 mx-auto mb-3 sm:mb-4" />
                  <p className="text-[#1B1A17]/60 text-sm sm:text-base">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 sm:space-y-4 max-h-[35vh] sm:max-h-[40vh] overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 bg-[#FAFAF8] rounded-xl">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.images[0] || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-semibold text-[#1B1A17] text-xs sm:text-sm md:text-base truncate">
                            {item.name}
                          </h4>
                          <p className="text-[#F0A500] font-bold text-xs sm:text-sm md:text-base">
                            TZS {item.price.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 sm:p-1 bg-[#1B1A17]/10 hover:bg-[#1B1A17]/20 active:bg-[#1B1A17]/30 rounded touch-manipulation"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1B1A17]" />
                            </button>
                            <span className="text-[#1B1A17] font-medium w-6 sm:w-8 text-center text-xs sm:text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 sm:p-1 bg-[#1B1A17]/10 hover:bg-[#1B1A17]/20 active:bg-[#1B1A17]/30 rounded touch-manipulation"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1B1A17]" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto p-1.5 sm:p-1 text-[#E53935] hover:bg-[#E53935]/10 active:bg-[#E53935]/20 rounded touch-manipulation"
                              aria-label="Remove item"
                            >
                              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Total */}
                  <div className="border-t border-[#1B1A17]/10 mt-4 sm:mt-6 pt-4 sm:pt-6">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <span className="text-sm sm:text-base md:text-lg font-medium text-[#1B1A17]">Total:</span>
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#F0A500]">
                        TZS {cartTotal.toLocaleString()}
                      </span>
                    </div>

                    {!showPaymentOptions ? (
                      <Button
                        onClick={() => setShowPaymentOptions(true)}
                        className="w-full bg-[#F0A500] hover:bg-[#F0A500]/90 active:bg-[#F0A500]/80 text-[#1B1A17] font-semibold py-4 sm:py-5 md:py-6 text-sm sm:text-base touch-manipulation"
                      >
                        Proceed to Payment
                      </Button>
                    ) : (
                      <div className="space-y-2.5 sm:space-y-3">
                        <p className="text-[#1B1A17] font-medium text-center mb-2 text-sm sm:text-base">
                          Choose Payment Method:
                        </p>

                        {/* WhatsApp Payment */}
                        <Button
                          onClick={() => {
                            setPaymentMethod("whatsapp")
                            handleWhatsAppOrder()
                          }}
                          className="w-full bg-[#25D366] hover:bg-[#25D366]/90 active:bg-[#25D366]/80 text-white font-semibold py-3.5 sm:py-4 md:py-5 text-sm sm:text-base touch-manipulation"
                        >
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Order via WhatsApp
                        </Button>

                        {/* Bank Transfer */}
                        <Button
                          onClick={() => {
                            setPaymentMethod("bank")
                            setShowBankDetails(true)
                          }}
                          className="w-full bg-[#1B1A17] hover:bg-[#1B1A17]/90 active:bg-[#1B1A17]/80 text-[#FAFAF8] font-semibold py-3.5 sm:py-4 md:py-5 text-sm sm:text-base touch-manipulation"
                        >
                          Pay via Bank Transfer
                        </Button>
                      </div>
                    )}

                    {/* Bank Details */}
                    {showBankDetails && (
                      <div className="mt-4 p-3 sm:p-4 bg-[#FAFAF8] rounded-xl">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <Image
                            src="/goddess-glow/nmb-logo.png"
                            alt="NMB Bank"
                            width={60}
                            height={40}
                            className="object-contain w-[50px] sm:w-[60px] md:w-[70px]"
                          />
                          <div>
                            <p className="font-bold text-[#1B1A17] text-sm sm:text-base">
                              National Microfinance Bank (NMB)
                            </p>
                            <p className="text-xs sm:text-sm text-[#1B1A17]/70">Bank Transfer</p>
                          </div>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                          <p className="text-[#1B1A17]">
                            <span className="font-medium">Account Name:</span> MICHAEL C ELIA
                          </p>
                          <p className="text-[#1B1A17]">
                            <span className="font-medium">Account Number:</span> 23110057723
                          </p>
                          <p className="text-[#1B1A17]">
                            <span className="font-medium">Amount:</span> TZS {cartTotal.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowConfirmationForm(true)}
                          className="w-full mt-3 sm:mt-4 text-[#F0A500] hover:text-[#F0A500]/80 active:text-[#F0A500]/70 font-semibold text-xs sm:text-sm underline touch-manipulation py-2"
                        >
                          Payment completed? Click here!
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Form Modal */}
      {showConfirmationForm && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowConfirmationForm(false)} />
          <div className="relative bg-white w-full sm:max-w-md sm:mx-4 max-h-[100vh] sm:max-h-[90vh] overflow-hidden rounded-t-2xl sm:rounded-2xl flex flex-col">
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-white pb-2">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#1B1A17]">Confirm Payment</h3>
                <button
                  onClick={() => setShowConfirmationForm(false)}
                  className="p-2 hover:bg-[#F0A500]/10 active:bg-[#F0A500]/20 rounded-full touch-manipulation"
                  aria-label="Close form"
                >
                  <X className="w-5 h-5 text-[#1B1A17]" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#1B1A17] mb-1 sm:mb-1.5">
                    Your Name *
                  </label>
                  <Input
                    value={confirmationData.name}
                    onChange={(e) => setConfirmationData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="bg-white text-[#1B1A17] border-[#F0A500]/30 placeholder:text-[#1B1A17]/40 h-11 sm:h-10 text-base sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#1B1A17] mb-1 sm:mb-1.5">
                    Phone Number *
                  </label>
                  <Input
                    value={confirmationData.phone}
                    onChange={(e) => setConfirmationData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="0712 345 678"
                    type="tel"
                    className="bg-white text-[#1B1A17] border-[#F0A500]/30 placeholder:text-[#1B1A17]/40 h-11 sm:h-10 text-base sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#1B1A17] mb-1 sm:mb-1.5">
                    Your Location *
                  </label>
                  <Input
                    value={confirmationData.location}
                    onChange={(e) => setConfirmationData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Example: Kinondoni, Dar es Salaam"
                    className="bg-white text-[#1B1A17] border-[#F0A500]/30 placeholder:text-[#1B1A17]/40 h-11 sm:h-10 text-base sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#1B1A17] mb-1 sm:mb-1.5">
                    Transaction ID / Reference
                  </label>
                  <Input
                    value={confirmationData.transactionId}
                    onChange={(e) => setConfirmationData((prev) => ({ ...prev, transactionId: e.target.value }))}
                    placeholder="Transaction number"
                    className="bg-white text-[#1B1A17] border-[#F0A500]/30 placeholder:text-[#1B1A17]/40 h-11 sm:h-10 text-base sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#1B1A17] mb-1 sm:mb-1.5">
                    Additional Details
                  </label>
                  <Textarea
                    value={confirmationData.description}
                    onChange={(e) => setConfirmationData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Any additional details..."
                    rows={3}
                    className="bg-white text-[#1B1A17] border-[#F0A500]/30 placeholder:text-[#1B1A17]/40 text-base sm:text-sm resize-none"
                  />
                </div>

                <Button
                  onClick={handleConfirmationSubmit}
                  className="w-full bg-[#F0A500] hover:bg-[#F0A500]/90 active:bg-[#F0A500]/80 text-[#1B1A17] font-semibold py-4 sm:py-5 text-sm sm:text-base mt-2 touch-manipulation"
                >
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Submit Confirmation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthenticityGuide />
      <Footer />
    </div>
  )
}

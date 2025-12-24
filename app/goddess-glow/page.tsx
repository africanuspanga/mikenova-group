"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Check,
  Sparkles,
  ShoppingCart,
  Plus,
  Minus,
  X,
  MessageCircle,
  Building2,
  QrCode,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Product {
  id: string
  name: string
  price: number
  originalPrice: number
  description: string
  images: string[]
}

interface CartItem extends Product {
  quantity: number
}

const products: Product[] = [
  {
    id: "body-cream",
    name: "Goddess Glow Body Cream",
    price: 55000,
    originalPrice: 68750,
    description:
      "Brightening body cream that reveals smooth, even, radiant skin. Dermatologist approved formula trusted by thousands.",
    images: ["/goddess-glow/body-cream-beach.png", "/goddess-glow/body-cream-hand.jpeg"],
  },
  {
    id: "body-oil",
    name: "Goddess Glow Body Oil",
    price: 30000,
    originalPrice: 37500,
    description:
      "Luxurious body oil that nourishes and gives your skin a luminous, healthy glow. Perfect for all skin types.",
    images: ["/goddess-glow/body-oil-hero.jpeg", "/goddess-glow/body-oil-product.jpeg"],
  },
  {
    id: "bar-soap",
    name: "Goddess Glow Bar Soap",
    price: 10000,
    originalPrice: 12500,
    description:
      "Natural brightening bar soap infused with fruit extracts. Cleanses and brightens for a refreshed glow.",
    images: ["/goddess-glow/bar-soap-1.jpeg", "/goddess-glow/bar-soap-2.jpeg"],
  },
]

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
      <div className="relative h-[300px] md:h-[350px] overflow-hidden">
        <Image
          src={product.images[currentImageIndex] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Discount Badge */}
        <div className="absolute top-4 left-4 bg-[#E53935] text-white px-3 py-1 rounded-full text-sm font-bold">
          -{discount}% OFF
        </div>
        {/* Image Navigation */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-[#1B1A17]" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-[#1B1A17]" />
            </button>
            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
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
      <CardContent className="p-6">
        <h3 className="font-serif text-xl text-[#1B1A17] mb-2">{product.name}</h3>
        <p className="text-[#4A4A4A] text-sm mb-4 leading-relaxed">{product.description}</p>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold text-[#1B1A17]">TZS {product.price.toLocaleString()}</span>
          <span className="text-base text-[#999] line-through">TZS {product.originalPrice.toLocaleString()}</span>
        </div>
        <Button
          onClick={() => onAddToCart(product)}
          className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#1B1A17] font-semibold py-5"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  )
}

function CartModal({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeFromCart,
  getTotal,
}: {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  updateQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
  getTotal: () => number
}) {
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "bank" | "lipa" | null>(null)
  const [showConfirmationForm, setShowConfirmationForm] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    location: "",
    description: "",
    transaction: "",
  })

  if (!isOpen) return null

  const handleWhatsAppOrder = () => {
    const orderDetails = cartItems
      .map((item) => `${item.name} x${item.quantity} = TZS ${(item.price * item.quantity).toLocaleString()}`)
      .join("\n")
    const total = getTotal()
    const message = `Habari! Ningependa kuagiza:\n\n${orderDetails}\n\nJUMLA: TZS ${total.toLocaleString()}\n\nTafadhali nisaidie kukamilisha order yangu.`
    window.open(`https://wa.me/255675622238?text=${encodeURIComponent(message)}`, "_blank")
  }

  const handleSubmitConfirmation = () => {
    const orderDetails = cartItems
      .map((item) => `${item.name} x${item.quantity} = TZS ${(item.price * item.quantity).toLocaleString()}`)
      .join("\n")
    const total = getTotal()
    const message = `THIBITISHA MALIPO\n\nJina: ${formData.fullName}\nSimu: ${formData.phoneNumber}\nMahali: ${formData.location}\nMaelezo: ${formData.description || "N/A"}\n\nORDER:\n${orderDetails}\n\nJUMLA: TZS ${total.toLocaleString()}\n\nTRANSACTION:\n${formData.transaction}`
    window.open(`https://wa.me/255675622238?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-[#E5E5E5] p-3 sm:p-4 md:p-6 flex items-center justify-between z-10">
          <h2 className="font-serif text-lg sm:text-xl md:text-2xl text-[#1B1A17]">
            {showConfirmationForm ? "Thibitisha Malipo" : paymentMethod ? "Lipa Sasa" : "Your Cart"}
          </h2>
          <button
            onClick={() => {
              if (showConfirmationForm) {
                setShowConfirmationForm(false)
              } else if (paymentMethod) {
                setPaymentMethod(null)
              } else {
                onClose()
              }
            }}
            className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-[#1B1A17]" />
          </button>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {showConfirmationForm ? (
            /* Payment Confirmation Form */
            <div className="space-y-4">
              <p className="text-[#4A4A4A] text-sm mb-4">Jaza fomu hii kuthibitisha malipo yako</p>
              <div>
                <label className="block text-sm font-medium text-[#1B1A17] mb-1">Jina Kamili *</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Jina lako kamili"
                  className="border-[#E5E5E5] text-[#1B1A17] placeholder:text-[#9CA3AF] bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1B1A17] mb-1">Namba ya Simu *</label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+255..."
                  className="border-[#E5E5E5] text-[#1B1A17] placeholder:text-[#9CA3AF] bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1B1A17] mb-1">Mahali Unapoishi *</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Mfano: Dar es Salaam, Kinondoni"
                  className="border-[#E5E5E5] text-[#1B1A17] placeholder:text-[#9CA3AF] bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1B1A17] mb-1">Maelezo</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Maelezo mengine (optional)"
                  className="border-[#E5E5E5] text-[#1B1A17] placeholder:text-[#9CA3AF] bg-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1B1A17] mb-1">Transaction (Copy & Paste) *</label>
                <Textarea
                  value={formData.transaction}
                  onChange={(e) => setFormData({ ...formData, transaction: e.target.value })}
                  placeholder="Copy na paste message ya malipo hapa"
                  className="border-[#E5E5E5] text-[#1B1A17] placeholder:text-[#9CA3AF] bg-white"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleSubmitConfirmation}
                disabled={!formData.fullName || !formData.phoneNumber || !formData.location || !formData.transaction}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-5 mt-4"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Submit Info via WhatsApp
              </Button>
            </div>
          ) : paymentMethod === "bank" ? (
            /* Bank Payment Details */
            <div className="text-center">
              <div className="mb-6">
                <Image
                  src="/goddess-glow/nbc-logo.png"
                  alt="NBC Bank Logo"
                  width={120}
                  height={60}
                  className="mx-auto"
                />
              </div>
              <div className="bg-[#F5F5F5] rounded-xl p-4 sm:p-6 mb-6">
                <p className="text-sm text-[#4A4A4A] mb-2">Account Name</p>
                <p className="font-semibold text-[#1B1A17] text-base sm:text-lg mb-4">MICHAEL C ELIA</p>
                <p className="text-sm text-[#4A4A4A] mb-2">Account Number</p>
                <p className="font-mono font-bold text-xl sm:text-2xl text-[#1B1A17]">048174113791</p>
              </div>
              <p className="text-base sm:text-lg font-semibold text-[#1B1A17] mb-2">
                Jumla: TZS {getTotal().toLocaleString()}
              </p>
              <button
                onClick={() => setShowConfirmationForm(true)}
                className="text-[#D4AF37] hover:text-[#B8962E] font-medium underline mt-4 text-sm sm:text-base"
              >
                Malipo yamekamilika? Bofya hapa!
              </button>
            </div>
          ) : paymentMethod === "lipa" ? (
            /* Lipa Namba Details */
            <div className="text-center">
              <p className="text-[#4A4A4A] mb-4 text-sm sm:text-base">Scan QR Code au tumia Lipa Namba</p>
              <div className="bg-white rounded-xl p-2 sm:p-4 mb-6 inline-block border border-[#E5E5E5]">
                <Image
                  src="/goddess-glow/lipa-namba.png"
                  alt="Lipa Namba QR Code"
                  width={280}
                  height={280}
                  className="mx-auto w-[200px] h-[200px] sm:w-[280px] sm:h-[280px]"
                />
              </div>
              <p className="text-base sm:text-lg font-semibold text-[#1B1A17] mb-2">
                Jumla: TZS {getTotal().toLocaleString()}
              </p>
              <button
                onClick={() => setShowConfirmationForm(true)}
                className="text-[#D4AF37] hover:text-[#B8962E] font-medium underline mt-4 text-sm sm:text-base"
              >
                Malipo yamekamilika? Bofya hapa!
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-[#E5E5E5] mx-auto mb-4" />
              <p className="text-[#4A4A4A]">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3 sm:space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#FAFAF8] rounded-xl">
                    <Image
                      src={item.images[0] || "/placeholder.svg"}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover w-[50px] h-[50px] sm:w-[60px] sm:h-[60px]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[#1B1A17] text-sm sm:text-base truncate">{item.name}</h4>
                      <p className="text-[#D4AF37] font-semibold text-sm sm:text-base">
                        TZS {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 sm:p-1.5 hover:bg-white rounded-full transition-colors"
                      >
                        <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-[#4A4A4A]" />
                      </button>
                      <span className="w-6 sm:w-8 text-center font-medium text-[#1B1A17] text-sm sm:text-base">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 sm:p-1.5 hover:bg-white rounded-full transition-colors"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-[#4A4A4A]" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 sm:p-1.5 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-[#E5E5E5] pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-medium text-[#1B1A17]">Total</span>
                  <span className="text-xl sm:text-2xl font-bold text-[#D4AF37]">
                    TZS {getTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                <p className="text-sm text-[#4A4A4A] font-medium mb-3">Choose Payment Method:</p>
                <Button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-4 sm:py-5 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  WhatsApp Us
                </Button>
                <Button
                  onClick={() => setPaymentMethod("bank")}
                  className="w-full bg-[#1B1A17] hover:bg-[#2d2c28] text-white font-semibold py-4 sm:py-5 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Pay via Bank
                </Button>
                <Button
                  onClick={() => setPaymentMethod("lipa")}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-[#1B1A17] font-semibold py-4 sm:py-5 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                  Pay via Lipa Namba
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GoddessGlowPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const benefits = [
    "Clinically proven formula that helps fade dark spots and scars",
    "Smoothens and softens skin for a silky, touchable feel",
    "Brightens dull areas and restores your natural, healthy glow",
    "Deeply moisturizes to keep your skin nourished all day",
    "Reduces wrinkles and fine lines, leaving a youthful appearance",
    "Detoxifies and repairs skin from harsh product damage",
    "Clears acne and blemishes for an even tone",
    "Removes dark patches underarms, elbows, inner thighs, and knees",
    "Safe and gentle for all skin types and tones",
    "Made with authentic ingredients, trusted by skincare lovers everywhere",
  ]

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setIsCartOpen(true)
  }

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const total = getTotal()
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#D4AF37] hover:bg-[#B8941F] text-[#1B1A17] p-4 rounded-full shadow-2xl flex items-center gap-2 transition-transform hover:scale-105"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="font-bold">{cartCount}</span>
        </button>
      )}

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        getTotal={getTotal}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-end md:items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/goddess-glow/hero-beach.png"
            alt="Goddess Glow Brightening Body Cream"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-16 md:pb-0">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-medium tracking-wider text-xs md:text-sm uppercase">
                Premium Skincare
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-7xl text-white mb-4 md:mb-6 leading-tight">Goddess Glow</h1>
            <p className="text-xl md:text-3xl text-white/90 mb-3 md:mb-4 font-light">Brightening Body Cream</p>
            <p className="text-lg md:text-xl text-white/80 mb-6 md:mb-8 leading-relaxed">
              Reveal Your Natural Radiance
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-black font-medium px-6 md:px-8 py-5 md:py-6 text-base md:text-lg w-full md:w-auto"
            >
              <a href="#shop">Shop Now</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-5xl text-[#1B1A17] mb-6">
              The Skincare Secret Trusted by Thousands
            </h2>
            <p className="text-base md:text-lg text-[#4A4A4A] leading-relaxed">
              Goddess Glow Brightening Body Cream reveals smooth, even, radiant skin using dermatologist approved
              ingredients trusted by thousands of women across Africa.
            </p>
          </div>
        </div>
      </section>

      <section id="shop" className="py-16 md:py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-medium tracking-wider text-sm uppercase">Shop Now</span>
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-[#1B1A17] mb-4">Our Products</h2>
            <p className="text-[#4A4A4A] text-base md:text-lg max-w-2xl mx-auto">
              Discover the complete Goddess Glow collection for your perfect skincare routine
            </p>
            <div className="inline-block bg-[#E53935] text-white px-4 py-2 rounded-full text-sm font-bold mt-4">
              Limited Time: 20% OFF All Products!
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* Image Grid Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg">
              <Image
                src="/goddess-glow/natural-beauty.png"
                alt="Natural radiant beauty"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg">
              <Image
                src="/goddess-glow/wedding-party.png"
                alt="Special occasions beauty"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20 bg-[#FDFBF7]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-5xl text-[#1B1A17] mb-4 text-center">Why You'll Love It</h2>
            <div className="w-20 h-1 bg-[#D4AF37] mx-auto mb-12" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex-shrink-0 mt-1">
                    <Check className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <p className="text-sm md:text-base text-[#4A4A4A] leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#1B1A17]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-5xl text-white mb-4">See the Glow in Action</h2>
            <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
              Watch how Goddess Glow transforms skin and discover why thousands trust our products
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <video
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/promo%20video-XwIGcoZzWkdIGf3tXnbTNxVgHCMqtX.mp4"
                controls
                className="w-full h-full object-cover"
                poster="/goddess-glow/body-cream-beach.png"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Lifestyle Section */}
      <section className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/goddess-glow/luxury-horse.png"
            alt="Luxury lifestyle with Goddess Glow"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-6xl text-white mb-6">The Result</h2>
          <p className="text-lg md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Feel the difference from the very first touch — skin that's visibly softer, brighter, and more radiant. With
            consistent use, Goddess Glow Brightening Body Cream will reveal your natural tone, enhance your glow, and
            give you confidence that shines from within.
          </p>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-medium tracking-wider text-base md:text-lg">
                Authentic. Proven. Trusted.
              </span>
              <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-[#D4AF37]" />
            </div>
            <p className="text-xl md:text-3xl mb-8 leading-relaxed text-[#1B1A17]">
              Backed by real results and loved by countless users, Goddess Glow stands as a symbol of genuine beauty
              care — no harsh chemicals, no false promises, just authentic results.
            </p>
            <p className="text-lg md:text-xl text-[#4A4A4A]">
              Join the growing community that swears by the glow — and make your skin the best it's ever been.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-[#D4AF37] to-[#F0C75E]">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-6xl text-[#1B1A17] mb-6">Ready to Reveal Your Glow?</h2>
          <p className="text-lg md:text-2xl text-[#1B1A17]/80 mb-10 max-w-2xl mx-auto">
            Experience the transformation thousands of women trust. Shop the complete Goddess Glow collection today.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#1B1A17] hover:bg-[#2A2925] text-white font-medium px-8 md:px-12 py-6 md:py-7 text-lg md:text-xl shadow-2xl w-full md:w-auto"
          >
            <a href="#shop">Shop Now</a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

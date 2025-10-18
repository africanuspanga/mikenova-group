import Image from "next/image"
import { Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function GoddessGlowPage() {
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

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />

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
              <a href="https://wa.me/255623821175" target="_blank" rel="noopener noreferrer">
                Order on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-5xl text-[#1B1A17] mb-6">
              The Skincare Secret Trusted by Thousands
            </h2>
            <p className="text-base md:text-lg text-[#4A4A4A] leading-relaxed mb-6">
              Experience the skincare secret trusted by thousands of women across Africa — Goddess Glow Brightening Body
              Cream, the ultimate formula for achieving smooth, flawless, and luminous skin.
            </p>
            <p className="text-base md:text-lg text-[#4A4A4A] leading-relaxed">
              Carefully crafted with authentic, dermatologist-approved ingredients, this rich and luxurious body cream
              works deep within your skin to fade dark spots, even out tone, and restore your youthful glow. Unlike
              ordinary brightening creams, Goddess Glow delivers visible results — radiant, hydrated, and naturally
              beautiful skin that speaks for itself.
            </p>
          </div>
        </div>
      </section>

      {/* Image Grid Section */}
      <section className="py-16 md:py-20 bg-[#FDFBF7]">
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
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-5xl text-[#1B1A17] mb-4 text-center">Why You'll Love It</h2>
            <div className="w-20 h-1 bg-[#D4AF37] mx-auto mb-12" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
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
      <section className="py-16 md:py-20 bg-[#1B1A17] text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-medium tracking-wider text-base md:text-lg">
                Authentic. Proven. Trusted.
              </span>
              <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-[#D4AF37]" />
            </div>
            <p className="text-xl md:text-3xl mb-8 leading-relaxed text-white/90">
              Backed by real results and loved by countless users, Goddess Glow stands as a symbol of genuine beauty
              care — no harsh chemicals, no false promises, just authentic results.
            </p>
            <p className="text-lg md:text-xl text-white/80">
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
            Experience the transformation thousands of women trust. Order your Goddess Glow Brightening Body Cream
            today.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#1B1A17] hover:bg-[#2A2925] text-white font-medium px-8 md:px-12 py-6 md:py-7 text-lg md:text-xl shadow-2xl w-full md:w-auto"
          >
            <a href="https://wa.me/255623821175" target="_blank" rel="noopener noreferrer">
              Contact Us on WhatsApp
            </a>
          </Button>
          <p className="mt-6 text-sm md:text-base text-[#1B1A17]/70">Click to chat with us directly on WhatsApp</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}

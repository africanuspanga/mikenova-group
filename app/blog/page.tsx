import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Journal | MIKENOVA GROUP — Beauty & Skincare Insights",
  description:
    "Expert skincare advice, product guides, and real stories from MIKENOVA GROUP. Your trusted source for authentic beauty wisdom in Tanzania.",
  openGraph: {
    title: "Journal | MIKENOVA GROUP — Beauty & Skincare Insights",
    description:
      "Expert skincare advice, product guides, and real stories from MIKENOVA GROUP.",
    url: "https://www.mikenovagroup.co.tz/blog/",
    siteName: "MIKENOVA GROUP",
    type: "website",
  },
  alternates: {
    canonical: "https://www.mikenovagroup.co.tz/blog/",
  },
}

const blogPosts = [
  {
    slug: "10-signs-your-skin-needs-goddess-glow",
    title: "10 Signs Your Skin Needs Goddess Glow: Are You Missing Out on Radiant Skin?",
    excerpt:
      "Discover the telltale signs that your skin is crying out for Goddess Glow brightening treatment. From dull complexion to stubborn dark spots, learn why vipodozi salama (safe cosmetics) like Goddess Glow are essential for your skin's health.",
    image: "/images/goddess-glow-portrait.png",
    date: "November 20, 2025",
    category: "Skincare Tips",
  },
  {
    slug: "bridal-glow-mikenova",
    title: "Bridal Glow: Preparing for Your Big Day with MIKENOVA GROUP",
    excerpt:
      "Planning a wedding? Discover how MIKENOVA GROUP's Goddess Glow helps brides achieve that coveted bridal radiance. Learn about our pre-wedding skincare packages and special offers for bridal parties.",
    image: "/images/goddess-glow-wedding.png",
    date: "November 18, 2025",
    category: "Bridal Beauty",
  },
  {
    slug: "goddess-glow-vs-competitors",
    title: "Goddess Glow vs. Competitors: Why We're Tanzania's #1 Choice",
    excerpt:
      "Compare Goddess Glow with other brightening products. See why customers prefer our authentic formula over imported alternatives. Featuring real comparison data and customer testimonials.",
    image: "/images/goddess-glow-product.jpg",
    date: "November 15, 2025",
    category: "Product Comparison",
  },
  {
    slug: "complete-skincare-routine-goddess-glow",
    title: "Complete Guide: How to Use Goddess Glow for Maximum Results",
    excerpt:
      "Master the art of application with our comprehensive guide. Learn the best practices for using vipodozi for face and body to achieve that coveted goddess glow with proper technique.",
    image: "/images/goddess-glow-application.png",
    date: "November 12, 2025",
    category: "How-To Guide",
  },
  {
    slug: "skin-brightening-guide",
    title: "The Ultimate Skin Brightening Guide: Science, Safety & Results",
    excerpt:
      "Everything you need to know about safe skin brightening. Learn the science behind brightening cosmetics, safety guidelines, and why dermatologists recommend Goddess Glow.",
    image: "/images/goddess-glow-beach.png",
    date: "November 10, 2025",
    category: "Education",
  },
]

export default function BlogPage() {
  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-[#FAFAF8]">
        {/* Hero Section */}
        <section className="relative bg-[#1B1A17] text-[#FAFAF8] pt-32 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
                Beauty & <span className="text-[#F0A500]">Skincare</span> Insights
              </h1>
              <p className="text-lg md:text-xl text-[#FAFAF8]/80 leading-relaxed">
                Expert advice, product guides, and real stories from our community. Your trusted duka la vipodozi
                (cosmetics shop) bringing you authentic beauty wisdom.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Card
                  key={post.slug}
                  className="overflow-hidden border-[#1B1A17]/10 hover:shadow-xl transition-shadow bg-white"
                >
                  <div className="relative h-64 w-full">
                    <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#F0A500] text-[#1B1A17] px-3 py-1 text-xs font-semibold tracking-wider">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <CardHeader className="space-y-3">
                    <p className="text-sm text-[#1B1A17]/60">{post.date}</p>
                    <h3 className="text-xl font-bold text-[#1B1A17] leading-tight text-balance line-clamp-2">
                      {post.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#1B1A17]/70 leading-relaxed line-clamp-3">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      variant="ghost"
                      className="text-[#F0A500] hover:text-[#F0A500]/80 hover:bg-[#F0A500]/10 p-0 h-auto font-semibold group"
                    >
                      <Link href={`/blog/${post.slug}`}>
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[#1B1A17] text-[#FAFAF8]">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
              Ready to Start Your <span className="text-[#F0A500]">Glow Journey?</span>
            </h2>
            <p className="text-lg text-[#FAFAF8]/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Visit our shop for vipodozi bei ya jumla (wholesale cosmetics prices) and vipodozi na bei zake (cosmetics
              and their prices) in Dar es Salaam.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#F0A500] text-[#1B1A17] hover:bg-[#F0A500]/90 font-semibold tracking-wider px-8"
            >
              <Link href="/goddess-glow/">Shop Goddess Glow</Link>
            </Button>
          </div>
        </section>
      </div>

      <Footer />
    </>
  )
}

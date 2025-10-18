"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, Phone } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Format the message for WhatsApp
    const whatsappMessage = `*New Contact Form Submission*%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Phone:* ${formData.phone}%0A*Subject:* ${formData.subject}%0A*Message:* ${formData.message}`

    // Redirect to WhatsApp with pre-filled message
    window.open(`https://wa.me/255623821175?text=${whatsappMessage}`, "_blank")

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    })
  }

  return (
    <div className="min-h-screen bg-[#1B1A17]">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#1B1A17]">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-serif text-5xl md:text-7xl text-[#F0A500] text-center mb-6">{"Access to MIKENOVA."}</h1>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-[#FAFAF8]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="bg-white border-[#D4D2CC]">
              <CardContent className="p-8">
                <h2 className="font-serif text-3xl text-[#F0A500] mb-6">{"Discreet Inquiries."}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1B1A17] mb-2 tracking-wider">FULL NAME</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="border-[#D4D2CC] focus:border-[#F0A500] focus:ring-[#F0A500]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1A17] mb-2 tracking-wider">
                      EMAIL ADDRESS
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="border-[#D4D2CC] focus:border-[#F0A500] focus:ring-[#F0A500]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1A17] mb-2 tracking-wider">PHONE NUMBER</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="border-[#D4D2CC] focus:border-[#F0A500] focus:ring-[#F0A500]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1A17] mb-2 tracking-wider">SUBJECT</label>
                    <Input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="border-[#D4D2CC] focus:border-[#F0A500] focus:ring-[#F0A500]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1B1A17] mb-2 tracking-wider">MESSAGE</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="border-[#D4D2CC] focus:border-[#F0A500] focus:ring-[#F0A500] min-h-[150px]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#F0A500] text-[#1B1A17] hover:bg-[#F0A500]/90 font-medium tracking-wider"
                    size="lg"
                  >
                    SUBMIT INQUIRY
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white border-[#D4D2CC]">
              <CardContent className="p-8">
                <h2 className="font-serif text-3xl text-[#F0A500] mb-6">{"Our Access Points."}</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-[#F0A500] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-[#1B1A17] mb-1 tracking-wider">ADDRESS</h3>
                      <p className="text-[#6B6A67] leading-relaxed">
                        P.O BOX 20950
                        <br />
                        DAR ES SALAAM
                        <br />
                        Tanzania
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-[#F0A500] flex-shrink-0 mt-1" />
                    <div className="min-w-0">
                      <h3 className="font-medium text-[#1B1A17] mb-1 tracking-wider">EMAIL</h3>
                      <p className="text-[#6B6A67] break-all">mikenovagroup@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-[#F0A500] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-[#1B1A17] mb-1 tracking-wider">PHONE</h3>
                      <p className="text-[#6B6A67]">+255 675 622 238</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-[#F0A500] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-[#1B1A17] mb-1 tracking-wider">WHATSAPP</h3>
                      <a
                        href="https://wa.me/255623821175"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6B6A67] hover:text-[#F0A500] transition-colors"
                      >
                        +255 623 821 175
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

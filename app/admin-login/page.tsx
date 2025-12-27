"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from "lucide-react"
import { login } from "@/lib/products-store"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate a small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (login(email, password)) {
      router.push("/admin/goddess-glow")
    } else {
      setError("Invalid email or password")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#1B1A17] flex items-center justify-center p-4">
      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-[#FAFAF8]/70 hover:text-[#F0A500] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to Home</span>
      </Link>

      <Card className="w-full max-w-md !bg-[#2A2925] border-[#F0A500]/20">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <Link href="/" className="inline-block mx-auto mb-4">
            <Image src="/logo.png" alt="MIKENOVA GROUP" width={120} height={40} className="h-10 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-[#FAFAF8]">Admin Login</h1>
          <p className="text-[#FAFAF8]/60 text-sm mt-1">Sign in to manage Goddess Glow products</p>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#FAFAF8]/80">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FAFAF8]/40" />
                <Input
                  type="email"
                  placeholder="admin@mikenova.co.tz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-[#1B1A17] border-[#F0A500]/20 text-[#FAFAF8] placeholder:text-[#FAFAF8]/40 focus:border-[#F0A500]"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#FAFAF8]/80">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FAFAF8]/40" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-[#1B1A17] border-[#F0A500]/20 text-[#FAFAF8] placeholder:text-[#FAFAF8]/40 focus:border-[#F0A500]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FAFAF8]/40 hover:text-[#F0A500]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#F0A500] hover:bg-[#F0A500]/90 text-[#1B1A17] font-semibold py-6"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

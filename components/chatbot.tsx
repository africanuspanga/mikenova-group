"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function Chatbot() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const hiddenPaths = ["/goddess-glow", "/admin-login", "/admin"]
  const shouldHide = hiddenPaths.some((path) => pathname?.startsWith(path))

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Welcome to MIKENOVA GROUP! I'm Mike — your virtual assistant. How can I help you today? Feel free to ask me about our services, products, or anything else related to MIKENOVA.",
        },
      ])
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100)
    }
  }, [messages.length, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting right now. Please try contacting us directly at +255 675 622 238 or via email at mikenovagroup@gmail.com.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (shouldHide) {
    return null
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-[#F0A500] hover:bg-[#F0A500]/90 shadow-2xl transition-all duration-300 hover:scale-110 animate-bounce p-2"
        aria-label="Chat with Mike"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-[#1B1A17]" />
        ) : (
          <Image
            src="/mike-avatar.png"
            alt="Mike Avatar"
            width={48}
            height={48}
            className="w-full h-full object-contain"
          />
        )}
      </Button>

      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-[#1B1A17] text-[#F0A500] px-4 py-2 rounded-full shadow-lg text-sm font-medium whitespace-nowrap animate-pulse">
          Chat with Mike!
        </div>
      )}

      {isOpen && (
        <Card className="fixed bottom-28 right-6 z-50 w-[calc(100vw-3rem)] max-w-[380px] h-[calc(100vh-10rem)] max-h-[600px] shadow-2xl border-[#F0A500] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 md:w-[380px] md:h-[600px]">
          <div className="bg-gradient-to-r from-[#1B1A17] to-[#252320] p-3 md:p-4 border-b border-[#F0A500]/20 flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative flex-shrink-0">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#F0A500] flex items-center justify-center border-2 border-[#F0A500] overflow-hidden">
                  <Image
                    src="/mike-avatar.png"
                    alt="Mike"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#1B1A17]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#F0A500] text-base md:text-lg truncate">Mike</h3>
                <p className="text-xs text-[#A8A6A1] truncate">MIKENOVA Virtual Assistant</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-[#A8A6A1] hover:text-[#F0A500] hover:bg-[#252320] flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto bg-[#FAFAF8] scroll-smooth"
            style={{
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="p-3 md:p-4 space-y-3 md:space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-3 py-2 md:px-4 md:py-3 ${
                      message.role === "user"
                        ? "bg-[#F0A500] text-[#1B1A17]"
                        : "bg-white text-[#1B1A17] border border-[#D4D2CC] shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-[#1B1A17] border border-[#D4D2CC] rounded-2xl px-4 py-3 shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-[#F0A500]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-3 md:p-4 bg-white border-t border-[#D4D2CC] flex-shrink-0">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 border-[#D4D2CC] focus:border-[#F0A500] focus:ring-[#F0A500] text-[#1B1A17] placeholder:text-[#A8A6A1] text-sm md:text-base"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#F0A500] hover:bg-[#F0A500]/90 text-[#1B1A17] flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  )
}

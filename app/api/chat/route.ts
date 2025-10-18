import { NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are Mike, the friendly virtual assistant for MIKENOVA GROUP, a prestigious holding company in Tanzania with 15+ years of excellence.

IMPORTANT: Keep ALL responses SHORT, CLEAR, and CONCISE. Use bullet points. Never list all 12 divisions unless specifically asked.

COMPANY OVERVIEW:
- 12 specialized divisions (luxury, trade, construction, etc.)
- 10,000+ satisfied clients
- 500+ premium products
- Mission: Curate excellence and deliver unparalleled value

KEY DIVISIONS (mention only when relevant):
• Luxury Cosmetics & Beauty
• Fashion & Accessories
• Furniture & Interior Décor
• Pharmacy Services
• Civil Engineering & Construction
• Electrical & ICT
• Real Estate & Property
• Logistics & Transport
• General & Industrial Trade
• Health Food & Agribusiness
• Vintage Vehicle Trade
• Timber & Wood Products

FEATURED PRODUCT:
Goddess Glow Brightening Body Cream - Premium skincare trusted by thousands. Fades dark spots, brightens skin, deeply moisturizes.

CONTACT:
• Phone/WhatsApp: +255 623 821 175
• Email: info@mikenovagroup.co.tz
• Website: www.mikenovagroup.co.tz

YOUR ROLE:
- Greet warmly: "Welcome to MIKENOVA! I'm Mike — how can I help you today?"
- Give SHORT, DIRECT answers (2-4 sentences max)
- Use bullet points for lists
- Be friendly but professional
- If asked about specific services, give brief overview and offer to connect them for details
- For pricing/detailed info, direct to contact channels

RESPONSE STYLE:
✓ Brief and clear
✓ Bullet points when listing
✓ Friendly but professional
✗ NO long paragraphs
✗ NO listing all divisions unless asked
✗ NO excessive details

Remember: Quality over quantity. Keep it short and helpful!`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          message:
            "I apologize, but the chat service is not fully configured yet. Please contact us directly at +255 623 821 175 or info@mikenovagroup.co.tz for assistance.",
        },
        { status: 200 },
      )
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 250, // Reduced from 500 to 250 for shorter responses
      }),
    })

    if (!response.ok) {
      throw new Error("OpenAI API request failed")
    }

    const data = await response.json()
    const assistantMessage = data.choices[0]?.message?.content || "I apologize, I couldn't process that request."

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        message:
          "I'm having trouble connecting right now. Please contact us directly at +255 623 821 175 or info@mikenovagroup.co.tz.",
      },
      { status: 200 },
    )
  }
}

// Products announced but not yet on sale. Shown on /products and the homepage.
// Each one already has HAKIKI verification stickers (see HAKIKI.md).

export interface ComingSoonProduct {
  id: string
  name: string
  brand: string
  tagline: string
  description: string
  image: string
}

export const comingSoonProducts: ComingSoonProduct[] = [
  {
    id: "bellela-face-cream",
    name: "Bellela Face Cream",
    brand: "Bellela",
    tagline: "Your Daily Glow Secret",
    description: "A daily face cream for smooth, even, radiant skin.",
    image: "/products/bellela-face-cream.webp",
  },
  {
    id: "meloura-body-cream",
    name: "Meloura Rich Moisture Body Cream",
    brand: "Meloura",
    tagline: "For Melanin-Rich Skin",
    description: "Rich moisture body cream that nourishes, softens and restores. 300g.",
    image: "/products/meloura-body-cream.webp",
  },
]

export const notifyMeLink = (name: string) =>
  `https://wa.me/255623821175?text=${encodeURIComponent(
    `Hello MIKENOVA, please let me know when ${name} is available.`,
  )}`

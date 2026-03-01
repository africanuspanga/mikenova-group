// Product store utilities for localStorage persistence

export interface Product {
  id: string
  name: string
  price: number
  originalPrice: number
  description: string
  images: string[]
}

const PRODUCTS_KEY = "goddess-glow-products"
const AUTH_KEY = "goddess-glow-admin-auth"

// Default products
const defaultProducts: Product[] = [
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
  {
    id: "sunscreen",
    name: "Goddess Glow Sunscreen",
    price: 45000,
    originalPrice: 56250,
    description:
      "Premium sunscreen with broad spectrum protection. Shields your skin from harmful UV rays while keeping it moisturized and radiant.",
    images: ["/images/GODDESS GLOW SUNSCREEN .jpeg", "/images/GODDESS GLOW SUNSCREEN  2.jpeg", "/images/GODDESS GLOW SUNSCREEN  3.jpeg"],
  },
  {
    id: "showergel",
    name: "Goddess Glow Showergel",
    price: 35000,
    originalPrice: 43750,
    description:
      "Luxurious shower gel that cleanses and brightens your skin. Infused with nourishing ingredients for a refreshing glow.",
    images: ["/images/goddes glow shower gel.jpeg", "/images/goddess glow shower gel.jpeg"],
  },
]

export function getProducts(): Product[] {
  if (typeof window === "undefined") return defaultProducts

  const stored = localStorage.getItem(PRODUCTS_KEY)
  if (!stored) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts))
    return defaultProducts
  }
  return JSON.parse(stored)
}

export function saveProducts(products: Product[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
}

export function addProduct(product: Omit<Product, "id">): Product {
  const products = getProducts()
  const newProduct: Product = {
    ...product,
    id: `product-${Date.now()}`,
  }
  products.push(newProduct)
  saveProducts(products)
  return newProduct
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) return null

  products[index] = { ...products[index], ...updates }
  saveProducts(products)
  return products[index]
}

export function deleteProduct(id: string): boolean {
  const products = getProducts()
  const filtered = products.filter((p) => p.id !== id)
  if (filtered.length === products.length) return false

  saveProducts(filtered)
  return true
}

// Auth functions
const ADMIN_EMAIL = "admin@mikenova.co.tz"
const ADMIN_PASSWORD = "Mike@Nova@1961"

export function login(email: string, password: string): boolean {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, "authenticated")
    }
    return true
  }
  return false
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(AUTH_KEY) === "authenticated"
}

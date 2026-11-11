# MIKENOVA GROUP - Comprehensive Agent Documentation

> Last updated: 2026-11-10
> This document is the single source of truth for AI agents working on this codebase.

---

## 1. Project Overview

MIKENOVA GROUP is a multi-divisional business portfolio website for a Tanzanian holding company. It serves two primary purposes:

1. **Corporate Showcase** (`/`, `/about`, `/services`, `/products`, `/blog`, `/contact`) — Company info, divisions, brand partners, testimonials
2. **Goddess Glow E-commerce** (`/goddess-glow`, `/admin/*`) — Skincare product store with shopping cart, payment via WhatsApp/Bank Transfer

### Production URL
`https://www.mikenovagroup.co.tz`

### Contact Info (used everywhere)
- **WhatsApp (orders & contact):** `+255 623 821 175`
- **Phone:** `+255 623 821 175`
- **Email:** `mikenovagroup@gmail.com`
- **Address:** P.O BOX 20950, DAR ES SALAAM, Tanzania
- **Bank Transfer:** NMB Bank, Account `23110057723`, Name `MICHAEL C ELIA`

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 15.2.8 (App Router) |
| React | React | 19 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4.1.9 (CSS-based config, NO `tailwind.config.js`) |
| UI Components | shadcn/ui | New York style, `neutral` base |
| UI Primitives | Radix UI | Full suite installed |
| Icons | Lucide React | ^0.454.0 |
| Forms | React Hook Form + Zod | — |
| Themes | next-themes | ^0.4.6 |
| Notifications | sonner | Toast notifications |
| Analytics | @vercel/analytics | — |
| Animation | framer-motion | Scroll reveals, parallax, carousels |
| Package Manager | pnpm | (use `pnpm`, NOT npm/yarn) |

### Key Configuration
- **No `tailwind.config.*` file** — Tailwind v4 uses CSS-based config in `app/globals.css`
- **Images are unoptimized** (`next.config.mjs`: `images: { unoptimized: true }`)
- **Trailing slash enabled** (`next.config.mjs`: `trailingSlash: true`) — All canonical URLs and internal links use trailing slashes
- **Apex domain redirect** (`next.config.mjs`) — `mikenovagroup.co.tz` redirects to `www.mikenovagroup.co.tz`
- **ESLint and TypeScript errors are ignored during builds** (permissive mode)
- **Path alias:** `@/` → project root
- **No `output: 'export'`** — Requires Node.js server (has `/api/chat` route)

---

## 3. Complete Project Structure

```
/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout: fonts, metadata, GTM, Chatbot, Analytics
│   ├── page.tsx                      # Homepage: orchestrates section components
│   ├── globals.css                   # Tailwind v4 theme + custom animations
│   ├── not-found.tsx                 # 404 page
│   ├── sections/                     # Reusable section components
│   │   ├── hero.tsx                  # Multi-video cinematic hero slider
│   │   ├── philosophy.tsx            # Brand story / "House of MIKENOVA"
│   │   ├── flagship-brand.tsx        # Goddess Glow signature brand feature
│   │   ├── product-collection.tsx    # Goddess Glow product grid
│   │   ├── coming-soon.tsx           # Coming-soon products (Bellela, Meloura)
│   │   ├── golden-edition-promo.tsx  # Golden Edition promotional feature
│   │   ├── authenticity-guide.tsx    # Original product authenticity guide
│   │   ├── divisions-showcase.tsx    # 12-division horizontal gallery
│   │   ├── partners-marquee.tsx      # Infinite brand partner marquee
│   │   ├── testimonials.tsx          # Featured testimonial carousel
│   │   └── cta-contact.tsx           # Final editorial CTA
│   ├── hooks/                        # Shared custom hooks
│   ├── components/animation/         # Reusable animation primitives
│   │   ├── section-label.tsx
│   │   ├── animated-text.tsx
│   │   ├── gold-line.tsx
│   │   ├── magnetic-button.tsx
│   │   └── luxury-product-card.tsx
│   │
│   ├── about/
│   │   ├── layout.tsx                # Metadata wrapper
│   │   └── page.tsx                  # About page: mission, vision, values
│   │
│   ├── services/
│   │   ├── layout.tsx                # Metadata wrapper
│   │   └── page.tsx                  # Services page: 12 divisions grid
│   │
│   ├── products/
│   │   ├── layout.tsx                # Metadata wrapper
│   │   └── page.tsx                  # Product catalog: 36 inquiry-based products, filterable
│   │
│   ├── goddess-glow/
│   │   ├── layout.tsx                # Heavy SEO metadata (Swahili keywords)
│   │   └── page.tsx                  # E-commerce store (~663 lines, "use client")
│   │
│   ├── blog/
│   │   ├── layout.tsx                # Metadata wrapper
│   │   ├── page.tsx                  # Blog listing: 5 posts
│   │   └── [slug]/
│   │       ├── layout.tsx            # Dynamic metadata per post
│   │       └── page.tsx              # Blog post detail (~1165 lines, hardcoded HTML content)
│   │
│   ├── videos/
│   │   ├── layout.tsx                # Metadata wrapper
│   │   └── page.tsx                  # YouTube channel video gallery
│   │
│   ├── contact/
│   │   ├── layout.tsx                # Metadata wrapper
│   │   └── page.tsx                  # Contact form (submits via WhatsApp)
│   │
│   ├── admin-login/
│   │   └── page.tsx                  # Admin login form ("use client")
│   │
│   ├── admin/
│   │   └── goddess-glow/
│   │       └── page.tsx              # Admin dashboard ("use client")
│   │
│   └── api/
│       └── chat/
│           └── route.ts              # OpenAI GPT-4o-mini chatbot API
│
├── components/
│   ├── ui/                           # shadcn/ui components (ONLY 4 files!)
│   │   ├── button.tsx                # Button with CVA variants
│   │   ├── card.tsx                  # Card + CardHeader + CardTitle + CardContent + CardFooter + CardAction
│   │   ├── input.tsx                 # Styled input
│   │   └── textarea.tsx              # Styled textarea
│   ├── chatbot.tsx                   # Floating AI chat widget
│   ├── footer.tsx                    # Site footer (4 columns)
│   ├── navigation.tsx                # Fixed top nav with mobile hamburger
│   └── theme-provider.tsx            # next-themes wrapper
│
├── lib/
│   ├── utils.ts                      # `cn()` utility (clsx + tailwind-merge)
│   ├── products-store.ts             # Product data model + localStorage CRUD + admin auth
│   └── coming-soon.ts                # Coming-soon products, shared by /products and homepage
│
├── public/                           # Static assets (see full listing below)
│   ├── arrivals/                     # 8 new arrival images
│   ├── brands/                       # 16 partner brand logos
│   ├── divisions/                    # 5 division display images
│   ├── goddess-glow/                 # 14 Goddess Glow images + marketing
│   ├── images/                       # 11 general/product images
│   ├── products/                     # 23 product catalog images
│   ├── services/                     # 12 service category images
│   ├── favicon.png                   # Site favicon
│   ├── logo-new.png                  # Main logo (280×90, displayed at h-14)
│   ├── mike-avatar.png               # Chatbot avatar
│   ├── hero-bg.jpg                   # Homepage hero background
│   ├── robots.txt                    # Crawler rules
│   └── sitemap.xml                   # Sitemap (7 URLs)
│
├── styles/
│   └── globals.css                   # OLD/DEFAULT file — NOT used by app
│
├── next.config.mjs                   # Next.js config
├── package.json                      # Dependencies
├── pnpm-lock.yaml                    # Lockfile
├── tsconfig.json                     # TypeScript config
├── components.json                   # shadcn/ui config
└── postcss.config.mjs                # PostCSS config (@tailwindcss/postcss)
```

---

## 4. Color Scheme & Design System

### Brand Colors (HARD RULE: Never change these)

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary Gold** | `#F0A500` | Buttons, accents, highlights, CTAs (use sparingly) |
| **Secondary Gold** | `#D4AF37` | Alternate gold, subtle foil highlights |
| **Deep Background** | `#0F0E0C` | Primary dark sections (hero, flagship, divisions, CTA) |
| **Dark Background** | `#1B1A17` | Secondary dark sections, cards, footer |
| **Light Background** | `#FAFAF8` | Primary light content areas |
| **Warm Ivory** | `#F5F3EE` | Secondary light sections, product grid background |
| **Card Dark** | `#252320` | Cards on dark backgrounds |
| **Border Dark** | `#3A3835` | Borders on dark backgrounds |
| **Muted Text** | `#A8A6A1` | Secondary text on dark |
| **Muted Text 2** | `#6B6A67` | Secondary text on light, footer copyright |
| **Text Dark** | `#1B1A17` | Body text on light backgrounds |
| **Text Light** | `#FAFAF8` | Text on dark backgrounds |
| **Discount Red** | `#E53935` | Discount badges, sale indicators |
| **WhatsApp Green** | `#25D366` | WhatsApp order button |

### CSS Variables (from `app/globals.css`)

```css
:root {
  --background: #fafaf8;
  --foreground: #1b1a17;
  --card: #ffffff;
  --card-foreground: #1b1a17;
  --primary: #f0a500;
  --primary-foreground: #1b1a17;
  --secondary: #1b1a17;
  --secondary-foreground: #fafaf8;
  --muted: #e8e6e1;
  --muted-foreground: #6b6a67;
  --accent: #f0a500;
  --accent-foreground: #1b1a17;
  --border: #d4d2cc;
  --input: #d4d2cc;
  --ring: #f0a500;
  --radius: 0rem;        /* SHARP edges — luxury aesthetic */
}
```

### Custom Utility Classes (defined in `app/globals.css`)

```css
.animate-fade-in     /* Fade in + slide up, 1s ease-out */
.animate-ken-burns  /* Slow scale 1 → 1.08 over 20s (hero video) */
.animate-marquee     /* Infinite horizontal scroll (partners) */
.hover-glow          /* Gold box-shadow on hover */
.luxury-card-hover   /* translateY(-8px) + deep shadow on hover */
.luxury-card         /* Premium card lift with soft shadow */
.noise-overlay       /* Subtle grain texture overlay */
.magnetic-button     /* Spring-based magnetic hover wrapper */
.border-gradient-gold /* Gold gradient border image */
.scrollbar-hide      /* Hide scrollbar (webkit + firefox) */
```

### Fonts
- **Sans:** Montserrat (variable: `--font-sans`)
- **Serif:** Playfair Display (variable: `--font-serif`)
- **Mono:** Geist Mono (variable: `--font-mono`)

Apply serif with `font-serif`, sans with `font-sans`.

---

## 5. Route Inventory

| Route | File | Type | Description |
|-------|------|------|-------------|
| `/` | `app/page.tsx` | Server | Homepage: multi-video hero, philosophy, Goddess Glow flagship, collection, Golden Edition promo, authenticity guide, divisions, partners, testimonials, CTA |
| `/about` | `app/about/page.tsx` | Server | About: company overview, mission/vision, 4 core values |
| `/services` | `app/services/page.tsx` | Server | Services: 12 divisions with descriptions |
| `/products` | `app/products/page.tsx` | Client | Product catalog: inquiry products + coming-soon products (from `lib/coming-soon.ts`), category filter |
| `/goddess-glow` | `app/goddess-glow/page.tsx` | **Client** | E-commerce: product grid, cart, payment flow |
| `/blog` | `app/blog/page.tsx` | Server | Blog listing: 5 posts |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Server | Blog post: 8 hardcoded posts with HTML content |
| `/videos` | `app/videos/page.tsx` | Server | Videos: YouTube channel gallery with modal player |
| `/contact` | `app/contact/page.tsx` | Server | Contact form (submits via WhatsApp) |
| `/admin-login` | `app/admin-login/page.tsx` | **Client** | Admin login page |
| `/admin/goddess-glow` | `app/admin/goddess-glow/page.tsx` | **Client** | Admin dashboard: CRUD products |
| `/api/chat` | `app/api/chat/route.ts` | API | OpenAI GPT-4o-mini chatbot |
| `/*` | `app/not-found.tsx` | Server | 404 page |

### Why some pages are `"use client"`
Any page/component that reads from `localStorage` (products, cart, admin auth) MUST be a Client Component. The server cannot access `localStorage`.

---

## 6. Shared Components

### Navigation (`components/navigation.tsx`)
- Fixed top, `z-50`, transparent on hero, dark glassmorphic bg on scroll
- Logo: `/logo-new.png` (h-12 on mobile, h-14 on desktop, white inverted)
- Desktop: horizontal nav links + SHOP + CONTACT button
- Mobile: animated hamburger drawer with Shop + Contact CTAs
- **navLinks array:** `[{href: "/", label: "Home"}, {href: "/about", label: "About"}, {href: "/services", label: "Divisions"}, {href: "/products", label: "Products"}, {href: "/goddess-glow", label: "Goddess Glow"}, {href: "/videos", label: "Videos"}, {href: "/blog", label: "Journal"}]`
- Uses Framer Motion for entrance and mobile menu animations

### Footer (`components/footer.tsx`)
- 4-column grid: About | Quick Links | Divisions | Contact
- Quick Links: Home, About, Services, Products, Goddess Glow, Contact
- Divisions: Beauty & Cosmetics, Fashion & Accessories, Home Furniture, Pharmacy Services, Real Estate
- Contact: Address, email, phone, WhatsApp link

### Chatbot (`components/chatbot.tsx`)
- Floating bottom-right button (bounces on load)
- Hidden on `/goddess-glow`, `/admin-login`, `/admin/*`
- Connects to `/api/chat` (OpenAI GPT-4o-mini)
- Avatar: `/mike-avatar.png`
- Auto-scrolls, loading spinner, fallback error message

---

## 7. UI Components (`components/ui/`)

Only 4 shadcn/ui components exist. **Do NOT assume others are available.** If you need Dialog, Select, Sheet, Toast, etc., you must install them.

### Button (`button.tsx`)
```tsx
import { Button } from "@/components/ui/button"
// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon, icon-sm, icon-lg
// asChild: boolean (use with next/link)
<Button variant="outline" size="sm" asChild><Link href="/">Text</Link></Button>
```

### Card System (`card.tsx`)
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card"
```

### Input (`input.tsx`)
```tsx
import { Input } from "@/components/ui/input"
// Standard HTML input props, styled with gold focus ring
```

### Textarea (`textarea.tsx`)
```tsx
import { Textarea } from "@/components/ui/textarea"
// Standard HTML textarea props, styled with gold focus ring
```

---

## 8. Data Architecture

### CRITICAL: No Database
**Everything is client-side.** No Prisma, no Supabase, no database. Product data lives entirely in `localStorage`.

### Product Data Flow

```
lib/products-store.ts (defaultProducts[]) ──► localStorage ("goddess-glow-products")
                                              ▲                    │
                                              │                    ▼
                                     Admin Page (/admin/goddess-glow)  Goddess Glow Shop (/goddess-glow)
                                     (add/edit/delete via FileReader)   (read via getProducts())
                                              │
                                              └──────────── Homepage (/)
                                                            (read via getProducts())
```

### Product Interface (`lib/products-store.ts`)
```typescript
export interface Product {
  id: string           // "body-cream" or auto-generated "product-${Date.now()}"
  name: string
  price: number        // Sale price in TZS
  originalPrice: number // "Original" price (25% markup = 20% discount display)
  description: string
  images: string[]     // ["/goddess-glow/image.jpeg", "/images/image.jpeg"]
}
```

### localStorage Keys
| Key | Data | Written By |
|-----|------|------------|
| `"goddess-glow-products"` | Product array | `products-store.ts` functions, Admin page |
| `"goddess-glow-admin-auth"` | `"authenticated"` string | `login()` function |

### CRUD Functions (`lib/products-store.ts`)
```typescript
export const defaultProducts: Product[]  // Exported default catalog
getProducts(): Product[]        // Reads localStorage, falls back to defaults
saveProducts(products): void    // Writes to localStorage
addProduct(product): Product    // Generates ID, appends, saves
updateProduct(id, updates): Product | null  // Merges updates
deleteProduct(id): boolean      // Removes product
```

### Admin Auth (`lib/products-store.ts`)
```typescript
login(email, password): boolean   // Hardcoded: admin@mikenova.co.tz / Mike@Nova@1961
logout(): void
isAuthenticated(): boolean
```

### Cart State
- Cart is **pure React state** (`useState`) in `/goddess-glow/page.tsx`
- **NOT persisted to localStorage** — cart is lost on page refresh
- This is intentional (keeps it simple)

---

## 9. E-commerce System (`/goddess-glow`)

### Page Architecture (`app/goddess-glow/page.tsx`)
The page is a single large Client Component (~663 lines) containing:

1. **ProductCard** (local component) — Image carousel, discount badge, add-to-cart button
2. **Hero Section** — Background image, title, CTA buttons
3. **About Section** — Brief description
4. **Shop Section** — Product grid using `getProducts()`
5. **Benefits Section** — 4 benefit cards (dark bg)
6. **Video Section** — Embedded video with play button overlay
7. **Floating Cart Button** — Fixed bottom-right with item count badge
8. **Cart Modal** — Slide-up overlay with items, quantities, remove, total
9. **Payment Options** — WhatsApp or Bank Transfer
10. **Bank Details Panel** — NMB bank info
11. **Confirmation Form Modal** — Name, phone, location, transaction ID
12. **Authenticity Guide** — Original vs Fake Goddess Glow product comparison

### Payment Flow
```
Add to Cart → Floating cart button (item count)
  → Click cart → Cart modal opens
    → "Proceed to Payment"
      → Choose method:
        ├─ WhatsApp: Opens wa.me link with pre-filled order
        └─ Bank Transfer: Shows bank details
           → "Payment completed? Click here!"
             → Confirmation form
               → Submits via WhatsApp message
```

### Discount Calculation
```typescript
const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
// Prices are set with 25% markup: originalPrice = price * 1.25
// This displays as 20% OFF
```

---

## 10. Blog System (`/blog`)

### Structure
- **Blog listing** (`/blog/page.tsx`): Grid of 5 posts with image, title, excerpt, date
- **Blog post** (`/blog/[slug]/page.tsx`): Individual post with hero image, key takeaways, HTML content

### Blog Data Model
```typescript
type BlogPost = {
  slug: string
  title: string
  excerpt: string
  image: string
  date: string
  readTime: string
  category: string
  keyTakeaways: string[]
  content: string  // HTML STRING!
}
```

### CRITICAL: Blog Content is HTML Strings
All blog content is stored as **raw HTML strings** inside `blogContent` record in `/blog/[slug]/page.tsx`. It is NOT MDX, NOT CMS content. The HTML uses custom CSS classes like:
- `lead-paragraph`
- `content-section`
- `highlight-box`
- `quote-callout`
- `info-box`
- `stats-grid`
- `testimonial-card`
- `timeline-section`
- `week-card`
- `step-card`
- `routine-section`

These classes are styled via inline `<style jsx>` in the page component.

### Available Blog Posts (8 total)
| Slug | Title |
|------|-------|
| `10-signs-your-skin-needs-goddess-glow` | 10 Signs Your Skin Needs Goddess Glow |
| `science-behind-goddess-glow` | The Science Behind Goddess Glow |
| `dark-spots-be-gone-real-stories` | Dark Spots Be Gone: Real Stories |
| `complete-skincare-routine-goddess-glow` | Complete Guide: How to Use Goddess Glow |
| `30-day-journey-glowing-skin` | 30-Day Journey to Glowing Skin |
| `bridal-glow-mikenova` | Bridal Glow: Preparing for Your Big Day |
| `goddess-glow-vs-competitors` | Goddess Glow vs. Competitors |
| `skin-brightening-guide` | The Ultimate Skin Brightening Guide |

### SEO Strategy
Blog posts are heavily optimized for Swahili beauty keywords: `vipodozi`, `duka la vipodozi`, `vipodozi bei rahisi`, `vipodozi salama`, `vipodozi Dar es Salaam`, etc.

---

## 11. Chatbot System (`/api/chat`)

### API Route (`app/api/chat/route.ts`)
- **Method:** POST
- **Body:** `{ messages: Array<{role, content}> }`
- **Model:** `gpt-4o-mini`
- **Max tokens:** 250
- **Temperature:** 0.7
- **System prompt:** "Mike" — virtual assistant for MIKENOVA GROUP
- **Requires:** `OPENAI_API_KEY` env var
- **Fallback:** Friendly error with contact info if key missing

### Chatbot Widget (`components/chatbot.tsx`)
- Floating button bottom-right
- Hidden on `/goddess-glow`, `/admin-login`, `/admin/*`
- Expands into chat modal when clicked
- Avatar: `/mike-avatar.png`

---

## 12. Public Assets Reference

### Root Level
| File | Purpose |
|------|---------|
| `/favicon.png` | Site favicon |
| `/logo-new.png` | Main logo (280×90) |
| `/logo.png` | Alternative logo |
| `/golden-edition.png` | Goddess Glow Golden Edition promo image |
| `/mike-avatar.png` | Chatbot avatar |
| `/hero-bg.jpg` | Hero background |
| `/apple-icon.png` | Apple touch icon |
| `/placeholder.jpg` | Generic placeholder |
| `/placeholder.svg` | SVG placeholder |
| `/robots.txt` | Crawler rules (blocks /admin, /admin-login, /api) |
| `/sitemap.xml` | Sitemap (7 URLs) |
| `/FAKE.png` | Counterfeit Goddess Glow product reference image (legacy) |
| `/OG.PNG` | Authentic Goddess Glow product reference image |
| `/goddess-glow-authenticity-guide.png` | Full Original vs Fake comparison infographic (legacy) |
| `/grok-video-9737b2fa-c651-4e1b-a6c8-7066aed9170e.mp4` | Hero background video #1 — Golden Edition |
| `/Goddess%20Glow%20BG.mp4` | Hero background video #2 — Goddess Glow |
| `/the-golden-editoon%20promo.mp4` | Golden Edition promo video (currently unused) |
| `/New Goddess Glow.PNG` | New Goddess Glow Body Cream product packaging |
| `/New model goddess glow.png` | Model holding Goddess Glow Body Cream |

### `/public/goddess-glow/` (14 files)
| File | Purpose |
|------|---------|
| `body-cream-beach.png` | Body Cream product image |
| `body-cream-hand.jpeg` | Body Cream product image |
| `body-oil-hero.jpeg` | Body Oil product + hero image |
| `body-oil-product.jpeg` | Body Oil product image |
| `bar-soap-1.jpeg` | Bar Soap product image |
| `bar-soap-2.jpeg` | Bar Soap product image |
| `hero-beach.png` | Marketing/hero image |
| `luxury-horse.png` | Marketing image |
| `natural-beauty.png` | Marketing image (used as bg) |
| `wedding-party.png` | Marketing image |
| `lipa-namba.png` | Mobile payment graphic |
| `nbc-logo.png` | NBC Bank logo |
| `nmb-logo.png` | NMB Bank logo |

### `/public/images/` (11 files)
| File | Purpose |
|------|---------|
| `GODDESS GLOW SUNSCREEN .jpeg` | Sunscreen image |
| `GODDESS GLOW SUNSCREEN  2.jpeg` | Sunscreen image |
| `GODDESS GLOW SUNSCREEN  3.jpeg` | Sunscreen image |
| `goddes glow shower gel.jpeg` | Showergel image (note: typo "goddes") |
| `goddess glow shower gel.jpeg` | Showergel image |
| `goddess-glow-application.png` | Blog image |
| `goddess-glow-beach.png` | Blog image |
| `goddess-glow-portrait.png` | Blog image |
| `goddess-glow-product.jpg` | Blog image |
| `goddess-glow-wedding.png` | Blog image |

### `/public/products/` (23 files)
Product catalog images for the inquiry-based `/products` page.

### `/public/services/` (12 files)
Service category images for `/services` page.

### `/public/divisions/` (5 files)
Division display images for homepage divisions grid.

### `/public/brands/` (16 files)
Partner brand logos for homepage brand partners section.

### `/public/arrivals/` (8 files)
Legacy arrival images (currently unused after homepage redesign).

---

## 13. Common Patterns & Code Snippets

### Image Carousel Pattern (used on product cards)
```tsx
const [currentImageIndex, setCurrentImageIndex] = useState(0)

// Navigation
const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)

// In JSX
<div className="relative h-[280px] overflow-hidden">
  <Image src={product.images[currentImageIndex]} alt={product.name} fill className="object-cover" />
  <button onClick={prevImage}><ChevronLeft /></button>
  <button onClick={nextImage}><ChevronRight /></button>
  <div className="flex gap-2">
    {product.images.map((_, idx) => (
      <button key={idx} onClick={() => setCurrentImageIndex(idx)}
        className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? "bg-[#F0A500] w-4" : "bg-white/70"}`}
      />
    ))}
  </div>
</div>
```

### Modal/Overlay Pattern
```tsx
{isOpen && (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
    <div className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
    <div className="relative bg-white w-full sm:max-w-lg sm:mx-4 rounded-t-2xl sm:rounded-2xl">
      {/* Content */}
    </div>
  </div>
)}
```

### WhatsApp Link Pattern
```tsx
const message = `Hello, I'd like to inquire about...`
window.open(`https://wa.me/255623821175?text=${encodeURIComponent(message)}`, "_blank")
```

### Toast Notification Pattern
```tsx
import { toast, Toaster } from "sonner"

// In JSX (at top level of page)
<Toaster richColors />

// Usage
toast.success("Item added to cart!", {
  icon: <CheckCircle className="w-5 h-5 text-green-500" />,
  position: "top-center",
  duration: 2000,
})
toast.error("Please fill all required fields")
```

### Mobile-First Responsive Pattern
All components use mobile-first responsive classes:
```tsx
// Base styles apply to mobile, sm/md/lg apply to larger screens
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
<button className="p-3.5 sm:p-4 text-sm sm:text-base">
```

### Touch-Friendly Interactive Elements
ALL interactive elements MUST have `touch-manipulation` class:
```tsx
<button className="touch-manipulation">Click me</button>
```

---

## 14. How To Guides

### Add a New Page
1. Create folder: `app/[page-name]/`
2. Create `page.tsx` (and `layout.tsx` if needed)
3. Add link to `components/navigation.tsx` in `navLinks` array
4. Add link to `components/footer.tsx` in Quick Links section
5. Add to `public/sitemap.xml` if applicable

### Add a Goddess Glow Product
1. Add product images to `public/images/` or `public/goddess-glow/`
2. Edit `lib/products-store.ts` — add to `defaultProducts` array:
```typescript
{
  id: "unique-id",
  name: "Product Name",
  price: 45000,
  originalPrice: 56250,  // price * 1.25
  description: "Product description here",
  images: ["/images/product-image.jpeg", "/images/product-image-2.jpeg"]
}
```
3. Clear browser localStorage (`"goddess-glow-products"`) or test in incognito

### Coming-Soon Products
`lib/coming-soon.ts` lists announced products (currently Bellela Face Cream, Meloura Rich Moisture Body Cream and Meloura Brightening Body Serum). They show on `/products` (Coming Soon badge, WhatsApp "Notify Me") and in the homepage `ComingSoon` section. When one goes on sale, remove it from that list and add it to the shop. All three already have HAKIKI stickers: batches `Q4-2026-BELLELA-FACE`, `Q4-2026-MELOURA-300` and `Q4-2026-MELOURA-SERUM-100`, under the HAKIKI company now named "MIKENOVA GROUP" (slug still `goddess-glow`). Sticker runs are ordered as the planned quantity plus 200 for bottles and cans damaged in production; the unused remainder is voided at reconciliation. On 2026-11-11 the owner ordered more for the new line, added as exact sticker counts (no extra +200) onto the same unactivated batches: Bellela 5,200 → 20,200, Meloura Serum 5,200 → 20,200, Meloura Body Cream 5,200 → 25,200 (15,000 plus an extra 5,000). The new labels are in `print/final print/<product>/pdf-topup-2026-11-11/`, starting at label 5,201; the older `pdf/` files are unchanged.

### Update Contact Information
Update in ALL of these files:
- `components/footer.tsx`
- `app/contact/page.tsx`
- `app/goddess-glow/page.tsx` (WhatsApp number for orders)
- `app/api/chat/route.ts` (chatbot system prompt)

### Add a Blog Post
1. Edit `app/blog/[slug]/page.tsx`
2. Add new entry to `blogContent` record with a unique slug
3. Add post to `app/blog/page.tsx` listing array
4. Add to `app/blog/[slug]/layout.tsx` if needed

### Update Navigation
Edit `components/navigation.tsx` — modify `navLinks` array:
```typescript
const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/about", label: "ABOUT" },
  // ...add your link here
]
```

### Update Footer Links
Edit `components/footer.tsx`:
- Quick Links: modify the array in the second column
- Divisions: modify the `<ul>` in the third column
- Contact: modify the `<ul>` in the fourth column

### Install New shadcn/ui Components
```bash
# Example: install dialog and select
npx shadcn@latest add dialog select
```

---

## 15. Important Gotchas & Warnings

### ⚠️ Image filename inconsistencies
Several image files have typos or extra spaces:
- `"GODDESS GLOW SUNSCREEN .jpeg"` (trailing space)
- `"GODDESS GLOW SUNSCREEN  2.jpeg"` (double space)
- `"goddes glow shower gel.jpeg"` (missing second 's')

Always reference the EXACT filename as stored. Use tab-completion or `ls` to verify.

### ⚠️ Sitemap references outdated image filenames
`public/sitemap.xml` references `body-cream-1.jpeg` and `body-oil-1.jpeg` which no longer exist. Current filenames are `body-cream-beach.png` and `body-oil-hero.jpeg`.

### ⚠️ Two different gold colors
- `#F0A500` is the PRIMARY gold — use as the main accent for CTAs, hover states, and key lines
- `#D4AF37` (Champagne Gold) is a secondary accent for subtle highlights and foil effects
- Do NOT introduce a third gold. Default to `#F0A500` for new gold elements.
- **Design rule:** Gold should be an accent, not the default color for every heading.

### ⚠️ Admin images are stored as base64 in localStorage
When admin uploads images, `FileReader.readAsDataURL()` stores base64 strings directly in the product object. This can bloat localStorage quickly. There is NO server-side image handling.

### ⚠️ No image optimization
`next.config.mjs` has `images: { unoptimized: true }`. Next.js Image Optimization API is disabled. Images are served as static files.

### ⚠️ Cart is NOT persisted
The shopping cart is pure React state. Refreshing the page clears the cart. This is intentional but important to know.

### ⚠️ No real backend
- No database, no CMS, no REST API for products
- Only backend is `/api/chat` which calls OpenAI
- All product data is static or localStorage

### ⚠️ Admin auth is client-side only
Credentials are hardcoded in plaintext in `lib/products-store.ts`. This is NOT secure for production but works for the current use case.

### ⚠️ `styles/globals.css` is NOT used
The active global CSS is `app/globals.css`. `styles/globals.css` is an old/default file.

### ⚠️ Root layout has `className="dark"`
The `<html>` element in `app/layout.tsx` has `className="dark"`, forcing dark mode. The `next-themes` ThemeProvider exists but the root is hardcoded to dark.

### ⚠️ GTM ID is hardcoded
Google Tag Manager ID `GTM-MMPKG2F7` is hardcoded in `app/layout.tsx`.

### ⚠️ Google Search Console verification
Meta verification token `0P0--FJbylHfizoCQREuyNgyfURig8g-D2qiUcCcA-8` is in root metadata.

---

## 16. Build & Deploy

```bash
# Development
pnpm dev

# Build
pnpm build

# Production
pnpm start

# Lint
pnpm lint
```

### Environment Variables
| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Yes | Chatbot. If missing, chatbot falls back to contact info. |
| `YOUTUBE_API_KEY` | No | YouTube Data API v3 key for `/videos` duration and view counts. Page works without it (shows title, thumbnail, description, date from RSS). |
| `CRON_SECRET` | Recommended | Protects `/api/hakiki/keepalive/`, the daily Vercel Cron (`vercel.json`) that queries Supabase so the free plan never pauses for 7 days of inactivity. |

---

## 17. File Checklist When Making Changes

Use this checklist to ensure consistency:

- [ ] Color scheme maintained (`#F0A500`, `#1B1A17`, `#FAFAF8`)
- [ ] Mobile-first responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- [ ] `touch-manipulation` on all interactive elements
- [ ] Sharp edges (`rounded-none` or no rounding, matching `--radius: 0rem`)
- [ ] Fonts: headings use `font-serif`, body uses `font-sans`
- [ ] WhatsApp number is `+255 623 821 175`
- [ ] Bank details: NMB Bank, `23110057723`, `MICHAEL C ELIA`
- [ ] Prices in TZS with `.toLocaleString()` formatting
- [ ] Discount calculation: `Math.round(((original - price) / original) * 100)`
- [ ] If adding products: update `defaultProducts` in `lib/products-store.ts` (homepage auto-syncs via `getProducts()`)
- [ ] If adding pages: update navigation AND footer
- [ ] Test both mobile and desktop views

---

## 18. Quick Reference: All Default Products

```typescript
// From lib/products-store.ts
export const defaultProducts = [
  {
    id: "body-cream",
    name: "Goddess Glow Body Cream",
    price: 65000,
    originalPrice: 81250,
    description: "Brightening body cream that reveals smooth, even, radiant skin. Dermatologist approved formula trusted by thousands.",
    images: ["/New Goddess Glow.PNG", "/New model goddess glow.png"],
  },
  {
    id: "body-oil",
    name: "Goddess Glow Body Oil",
    price: 45000,
    originalPrice: 56250,
    description: "Luxurious body oil that nourishes and gives your skin a luminous, healthy glow. Perfect for all skin types.",
    images: ["/goddess-glow/body-oil-hero.jpeg", "/goddess-glow/body-oil-product.jpeg"],
  },
  {
    id: "bar-soap",
    name: "Goddess Glow Bar Soap",
    price: 15000,
    originalPrice: 18750,
    description: "Natural brightening bar soap infused with fruit extracts. Cleanses and brightens for a refreshed glow.",
    images: ["/goddess-glow/bar-soap-1.jpeg", "/goddess-glow/bar-soap-2.jpeg"],
  },
]
```

---

*End of AGENTS.md — When modifying files/styles/structures mentioned here, update this document to keep it current.*

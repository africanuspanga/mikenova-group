# MIKENOVA GROUP - Agent Documentation

## Project Overview

MIKENOVA GROUP is a multi-divisional business portfolio website featuring:
- **Main Corporate Site**: Company information, services, about, blog, contact
- **Goddess Glow Store**: E-commerce page for skincare products with shopping cart and checkout

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x with custom theme
- **UI Components**: Radix UI primitives + custom shadcn/ui components
- **State Management**: React hooks + localStorage for product persistence
- **Icons**: Lucide React
- **Notifications**: Sonner toast

## Project Structure

```
/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page
│   ├── about/             # About page
│   ├── services/          # Services page
│   ├── products/          # Products catalog (inquiry-based)
│   ├── goddess-glow/      # E-commerce store with cart
│   ├── blog/              # Blog with MDX content
│   ├── contact/           # Contact form
│   ├── admin/             # Admin pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── navigation.tsx    # Site navigation
│   └── footer.tsx        # Site footer
├── lib/                   # Utilities and stores
│   ├── utils.ts          # Utility functions
│   └── products-store.ts # Product data & localStorage
├── public/               # Static assets
│   ├── images/           # Product images
│   ├── goddess-glow/     # Goddess Glow product images
│   ├── products/         # Product catalog images
│   └── blog/             # Blog images
└── styles/               # Global styles
```

## Color Scheme

- **Primary Gold**: `#F0A500` - Buttons, accents, highlights
- **Dark Background**: `#1B1A17` - Headers, dark sections
- **Light Background**: `#FAFAF8` - Main content areas
- **Text Dark**: `#1B1A17` - Body text on light backgrounds
- **Text Light**: `#FAFAF8` - Text on dark backgrounds
- **Muted Text**: `#A8A6A1`, `#6B6A67` - Secondary text

## Goddess Glow Product System

### Product Data Model

```typescript
interface Product {
  id: string           // Unique identifier (e.g., "body-cream")
  name: string         // Product display name
  price: number        // Sale price in TZS
  originalPrice: number // Original price (for discount display)
  description: string  // Product description
  images: string[]     // Array of image paths
}
```

### Default Products (in lib/products-store.ts)

| ID | Name | Price (TZS) | Original Price (TZS) |
|----|------|-------------|---------------------|
| body-cream | Goddess Glow Body Cream | 55,000 | 68,750 |
| body-oil | Goddess Glow Body Oil | 30,000 | 37,500 |
| bar-soap | Goddess Glow Bar Soap | 10,000 | 12,500 |
| sunscreen | Goddess Glow Sunscreen | 45,000 | 56,250 |
| showergel | Goddess Glow Showergel | 35,000 | 43,750 |

### Product Images Location

Place product images in:
- `public/images/` - For general product images
- `public/goddess-glow/` - For Goddess Glow specific images

Reference format in code:
- `/images/image-name.jpeg` - For images in public/images/
- `/goddess-glow/image-name.jpeg` - For images in public/goddess-glow/

### E-commerce Features

The `/goddess-glow` page includes:
1. **Product Grid**: Displays all products with image carousel
2. **Shopping Cart**: Fixed floating cart button with item count
3. **Cart Modal**: View items, update quantities, remove items
4. **Payment Options**:
   - WhatsApp Order (direct message)
   - Bank Transfer (NMB Bank: 23110057723, MICHAEL C ELIA)
5. **Payment Confirmation Form**: Name, phone, location, transaction ID

### Shopping Flow

1. User clicks "Add to Cart" on product
2. Cart icon shows item count (fixed bottom-right)
3. User clicks cart to view items
4. User clicks "Proceed to Payment"
5. Choose payment method:
   - **WhatsApp**: Opens WhatsApp with pre-filled order message
   - **Bank Transfer**: Shows bank details + confirmation form
6. After bank payment, user fills confirmation form
7. Form submits via WhatsApp message

## Adding New Products

To add a new Goddess Glow product:

1. **Add product images** to `public/images/` or `public/goddess-glow/`

2. **Update `lib/products-store.ts`** - Add to `defaultProducts` array:

```typescript
{
  id: "unique-id",
  name: "Product Name",
  price: 45000,
  originalPrice: 56250, // 25% markup for discount display
  description: "Product description here",
  images: ["/images/product-image.jpeg", "/images/product-image-2.jpeg"]
}
```

3. **Clear localStorage** (products are cached there) - or use incognito mode to test

## Admin Panel

- **URL**: `/admin-login` → `/admin/goddess-glow`
- **Purpose**: Manage Goddess Glow products (add, edit, delete)
- **Auth**: localStorage-based authentication

## Common Tasks

### Add a new page

1. Create folder in `app/[page-name]/`
2. Create `page.tsx` and `layout.tsx`
3. Add link to `components/navigation.tsx`
4. Add link to `components/footer.tsx`

### Update site navigation

Edit `components/navigation.tsx` - modify `navLinks` array.

### Update footer links

Edit `components/footer.tsx` - modify Quick Links section.

### Change contact information

Update in:
- `components/footer.tsx`
- `app/contact/page.tsx`
- `app/goddess-glow/page.tsx` (WhatsApp number for orders)

## Build & Deploy

```bash
# Development
pnpm dev

# Build
pnpm build

# Start production
pnpm start
```

## Notes for Agents

- Always maintain the existing color scheme (`#F0A500`, `#1B1A17`, `#FAFAF8`)
- Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Test both mobile and desktop views
- When adding products, include multiple images if available
- Product prices should be in Tanzanian Shillings (TZS)
- WhatsApp number for orders: +255 623 821 175
- Bank details for transfers: NMB Bank, 23110057723, MICHAEL C ELIA

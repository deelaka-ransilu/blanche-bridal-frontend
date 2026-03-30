# CONTEXT.md — Phase 1: Project Setup
> This file is trimmed to ONLY what Phase 1 needs.
> For later phases, update this file to show only what that phase needs.
> Do NOT paste the entire original plan — keep it short and focused.

---

## Project Overview

Bridal boutique e-commerce platform.
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui (amber), Aceternity UI
- **Backend (later):** Spring Boot 3, PostgreSQL — not touched in Phase 1
- **Strategy:** Build full frontend with mock data first. Real backend swapped in later.

---

## Color Theme (configure in Phase 1)

```css
/* Map these to CSS variables in globals.css */
--cream-base:     #F8F4E3;   /* page backgrounds */
--soft-beige:     #E9D9B6;   /* secondary backgrounds, hover */
--warm-tan:       #D9C4A0;   /* borders, dividers */
--muted-gold:     #C49C74;   /* accents, icons */
--rose-gold:      #A86A4B;   /* primary buttons, CTAs */
--deep-brown:     #5B3E26;   /* headings */
--rich-espresso:  #120C08;   /* primary text, footer */
```

---

## Folder Structure to Create in Phase 1

```
/app
  /(public)
    /page.tsx                     # placeholder
    /catalog/page.tsx
    /dress/[id]/page.tsx
    /accessory/[id]/page.tsx
    /booking/page.tsx
    /login/page.tsx
    /register/page.tsx
    /inquiry/page.tsx
    layout.tsx

  /(customer)
    /dashboard/page.tsx
    /appointments/page.tsx
    /rentals/page.tsx
    /orders/page.tsx
    /cart/page.tsx
    /checkout/page.tsx
    /profile/page.tsx
    /receipts/page.tsx
    layout.tsx

  /(admin)
    /admin/dashboard/page.tsx
    /admin/inventory/page.tsx
    /admin/categories/page.tsx
    /admin/rentals/page.tsx
    /admin/appointments/page.tsx
    /admin/orders/page.tsx
    /admin/customers/page.tsx
    /admin/employees/page.tsx
    /admin/inquiries/page.tsx
    /admin/reports/page.tsx
    /admin/receipts/page.tsx
    layout.tsx

  layout.tsx                      # root layout with ThemeProvider
  globals.css

/components
  /ui                             # shadcn auto-generates this
  /aceternity                     # copy-paste Aceternity components here
  /shared                         # Navbar, Footer (empty for now)
  /admin                          # (empty for now)
  /customer                       # (empty for now)
  /products                       # (empty for now)

/lib
  /utils.ts                       # cn() helper (shadcn generates this)
  /mock-data.ts                   # seed data — build in Phase 1
  /api.ts                         # mock/real toggle — set up in Phase 1
  /auth.ts                        # NextAuth config — skeleton only in Phase 1
  /store.ts                       # Zustand cart store — skeleton only

/types
  /index.ts                       # core TypeScript interfaces — set up in Phase 1

/middleware.ts                    # route protection skeleton
/.env.example                     # committed, no real values
/.env.local                       # NOT committed, real values
```

---

## Phase 1 Task List (in order)

1. `npx create-next-app@latest bridal-boutique --typescript --tailwind --app`
2. `cd bridal-boutique`
3. `npx shadcn@latest init` — choose **amber** palette when prompted
4. Install shadcn components:
   ```bash
   npx shadcn@latest add button input form table dialog dropdown-menu \
     avatar badge card calendar popover select textarea toast sheet \
     separator scroll-area progress skeleton sonner
   ```
5. Install shadcn block templates:
   ```bash
   npx shadcn@latest add dashboard-01
   npx shadcn@latest add sidebar-07
   npx shadcn@latest add sidebar-12
   npx shadcn@latest add login-04
   ```
6. Install third-party packages:
   ```bash
   npm install next-auth
   npm install cloudinary next-cloudinary
   npm install googleapis
   npm install @react-pdf/renderer
   npm install zustand
   npm install zod react-hook-form @hookform/resolvers
   npm install resend
   npm install @vercel/analytics
   npm install next-pwa sharp
   npm install next-sitemap
   ```
7. Configure `tailwind.config.ts` with bridal palette CSS variables
8. Configure `globals.css` with CSS variable mappings (colors above)
9. Create all folders and placeholder `page.tsx` files
10. Create `middleware.ts` route protection skeleton
11. Copy Aceternity components into `/components/aceternity` (see list below)
12. Create `.env.example` (all variable names, empty values)
13. Create `.env.local` (real dev values, do NOT commit)
14. Create `lib/mock-data.ts` with initial seed data
15. Create `lib/api.ts` with mock/real toggle
16. Create `types/index.ts` with core interfaces
17. Create root `app/layout.tsx` with ThemeProvider
18. Create group layouts: `(public)/layout.tsx`, `(admin)/layout.tsx`, `(customer)/layout.tsx`
19. Run `npm run dev` — must start with zero errors and zero TypeScript errors

---

## Aceternity Components Needed (copy from aceternity.com/components)

| Component | Where Used Later |
|-----------|-----------------|
| `HeroSections` | Landing page |
| `Spotlight` | Login, Register |
| `FloatingDock` | Customer/Admin nav |
| `ResizableNavbar` | Public navbar |
| `FocusCards` | Featured dresses |
| `BentoGrid` | Dashboard stats |
| `Carousel` | Dress/accessory gallery |
| `GlowingEffect` | CTAs, Pay button |
| `GridAndDotBackgrounds` | Page backgrounds |
| `Loader` | Loading states |
| `ContainerTextFlip` | Booking date display |

In Phase 1 just copy the source files in. Do not wire them up yet.

---

## Core TypeScript Interfaces (for types/index.ts)

```typescript
export type UserRole = 'CUSTOMER' | 'ADMIN'
export type ProductType = 'DRESS' | 'ACCESSORY'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
export type RentalStatus = 'ACTIVE' | 'OVERDUE' | 'RETURNED'
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type InquiryStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'

export interface User {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  phone?: string
  profileImage?: string
  createdAt: string
}

export interface CustomerMeasurements {
  bust?: number
  waist?: number
  hips?: number
  height?: number
  notes?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  type: ProductType
  categoryId: string
  rentalPrice?: number
  purchasePrice?: number
  stock: number
  sizes: string[]
  images: string[]
  isAvailable: boolean
  createdAt: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  comment?: string
  status: ReviewStatus
  createdAt: string
  user?: Pick<User, 'firstName' | 'lastName' | 'profileImage'>
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  totalAmount: number
  notes?: string
  items: OrderItem[]
  createdAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  size?: string
  product?: Pick<Product, 'name' | 'images'>
}

export interface Rental {
  id: string
  userId: string
  productId: string
  orderId: string
  rentalStart: string
  rentalEnd: string
  returnDate?: string
  status: RentalStatus
  depositAmount: number
  balanceDue: number
  notes?: string
}

export interface Appointment {
  id: string
  userId: string
  productId?: string
  appointmentDate: string
  timeSlot: string
  status: AppointmentStatus
  notes?: string
  googleEventId?: string
}

export interface Payment {
  id: string
  orderId: string
  payhereOrderId: string
  amount: number
  currency: string
  status: string
  method?: string
  paidAt?: string
}

export interface Inquiry {
  id: string
  userId?: string
  name: string
  email: string
  phone?: string
  message: string
  imageUrls: string[]
  status: InquiryStatus
  createdAt: string
}

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  size?: string
  isRental: boolean
  rentalStart?: string
  rentalEnd?: string
}
```

---

## lib/api.ts Pattern to Set Up

```typescript
// lib/api.ts
// Toggle: when NEXT_PUBLIC_API_URL is set, use real backend. Otherwise use mock.

const USE_MOCK = !process.env.NEXT_PUBLIC_API_URL

function simulateDelay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Example — add one function per resource in later phases
export async function getProducts() {
  if (USE_MOCK) {
    await simulateDelay(300)
    const { mockProducts } = await import('./mock-data')
    return mockProducts
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}
```

In Phase 1, set up the file structure and the toggle pattern. Actual mock functions are added phase by phase.

---

## middleware.ts Skeleton

```typescript
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = req.nextUrl.pathname.startsWith('/admin')

    if (isAdmin && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  },
  { pages: { signIn: '/login' } }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/orders/:path*',
    '/appointments/:path*',
    '/rentals/:path*',
    '/cart/:path*',
    '/checkout/:path*',
    '/profile/:path*',
    '/receipts/:path*'
  ]
}
```

---

## API Response Shape (all mock data must match this)

```typescript
// Every API response — mock and real — must follow this shape
interface ApiSuccess<T> {
  success: true
  data: T
  pagination?: { page: number; size: number; total: number; totalPages: number }
}

interface ApiError {
  success: false
  error: { code: string; message: string; status: number; fields?: Record<string, string> }
}
```

---

## Git Workflow for Phase 1

```bash
# You should already be on feat/fe-setup
# Commit often — small focused commits

git add .
git commit -m "chore: scaffold Next.js + shadcn setup"

git commit -m "chore: configure tailwind bridal palette"

git commit -m "feat(setup): create folder structure + page placeholders"

git commit -m "feat(setup): add middleware route protection skeleton"

git commit -m "feat(setup): add types, mock-data skeleton, api toggle"

# When Phase 1 is fully done:
git push origin feat/fe-setup
# Open PR → develop → squash merge → delete branch
# Then PR develop → main → tag v0.1-setup
```

---

## What Phase 2 Will Need From Phase 1

The next chat (Phase 2 — Auth) will need you to paste these files:
- `app/layout.tsx`
- `app/(public)/layout.tsx`
- `lib/auth.ts` (skeleton)
- `middleware.ts`
- `types/index.ts`
- `tailwind.config.ts`

Make sure these are complete and working before starting Phase 2.

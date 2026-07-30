# Blanche Bridal — Frontend

The customer-facing and admin web app for **Blanche Bridal**, a Smart Bridal
Assistance system for a Sri Lankan bridal boutique. It handles the product
catalog, custom dress orders (7-stage production pipeline), dress rentals
(fitting + handover, two-payment model), appointment booking, payments via
PayHere, PDF receipts, and role-based access for Admin / Employee / Customer.

This is the frontend half of the system. The backend (Spring Boot, PostgreSQL)
lives in a sibling repo, `blanche-bridal-backend`.

## Tech stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Auth:** NextAuth.js (Credentials + Google OAuth), wrapping a Spring Boot
  JWT access/refresh token pair
- **Data fetching:** Server Actions (`lib/actions/*.ts`) calling authenticated
  helpers in `lib/api/*.ts`

## Project structure

```
src/
├── app/            Routes — folder path = URL path.
│   ├── admin/      Admin dashboard (protected, role: ADMIN)
│   ├── employee/   Employee views (protected, role: EMPLOYEE)
│   ├── my/         Customer account area (protected, any logged-in customer)
│   └── api/        Route Handlers (NextAuth catch-all, login proxy)
├── components/     React components, organized by feature area
├── lib/
│   ├── actions/    Server Actions ("use server") — what forms call
│   ├── api/        Lower-level HTTP helpers (client.ts, server.ts, auth.ts…)
│   ├── auth.ts     NextAuth config
│   └── auth-guard.ts   Server-side role guard for protected layouts
├── types/          TypeScript types mirroring backend DTOs
└── middleware.ts   Runs before every /admin, /employee, /my request —
                     proactively refreshes a stale access token
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The backend must be
running separately (default `http://localhost:8080`) — see `.env` for the
`NEXT_PUBLIC_API_URL`, `NEXTAUTH_SECRET`, and Google OAuth credentials this
app expects.

## Auth architecture (read this before touching login/session code)

There are **two token systems layered on top of each other**:

1. **The backend's tokens** — a short-lived JWT access token (15 min) and a
   long-lived, rotating refresh token stored as an httpOnly cookie.
2. **NextAuth's own session** — a separate JWT, stored in its own cookie,
   which wraps the backend's access token as a field (`backendToken`) inside
   it. NextAuth is what gives us `getServerSession()` / `useSession()` and a
   uniform login shape across Credentials and Google OAuth — the actual API
   calls still use the backend token underneath.

**Login (`/login`) flow:**
`login/page.tsx` → `lib/api/auth.ts`'s `login()` → `/api/proxy-auth/login`
(a Next.js Route Handler, same-origin) → backend `/api/auth/login`. The proxy
route exists so the backend's `Set-Cookie: refreshToken=...` lands on *this
app's* domain, avoiding cross-origin cookie issues. The returned access token
is then handed to NextAuth via `signIn("credentials", …)`, which builds
NextAuth's own session JWT around it.

**Google OAuth** skips the proxy — NextAuth's `signIn` callback calls the
backend's `/api/auth/google` directly and forwards the `Set-Cookie` itself,
since that callback already runs in a writable server context.

**Token refresh** is split across two places, because Next.js only allows
cookie writes from Middleware, Server Actions, or Route Handlers — never
during a plain Server Component render:

- `middleware.ts` — runs before every protected route, checks if the access
  token is near expiry, and if so refreshes it against the backend and
  rewrites both the refresh-token cookie and the NextAuth session cookie.
  This is the primary refresh path.
- `lib/auth.ts`'s `jwt()` callback — a fallback for edge cases where a Server
  Component finds an expired token anyway. Cookie writes here may silently
  no-op (expected), since middleware is trusted to fix it on the next
  request. Concurrent refresh attempts for the same token are de-duplicated
  in-memory, since the backend's refresh token is single-use and rotates on
  every call.

**Making authenticated requests server-side:** use
`apiRequestWithRefresh` / `fetchWithRefresh` from `lib/api/server.ts` inside
Server Actions or Route Handlers only — they attach
`Authorization: Bearer <backendToken>` and retry once via refresh on a
401/403.

## Deploy

Deployed on [Vercel](https://vercel.com). See the
[Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying)
for details.
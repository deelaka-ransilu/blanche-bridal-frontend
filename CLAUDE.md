# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Development Commands

**Start development server:**
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

**Build for production:**
```bash
npm run build
```

**Start production server (after build):**
```bash
npm run start
```

**Lint codebase:**
```bash
npm run lint
```

**Fix lint issues automatically:**
```bash
npm run lint -- --fix
```

**Type checking (without emitting):**
```bash
npx tsc --noEmit
```

**Note:** No unit test framework is configured yet. Vitest/Jest could be added if needed.

---

## 🏗️ Architecture Overview

### Stack

- **Framework:** Next.js 16.2 (App Router)
- **Language:** TypeScript (strict mode)
- **Auth:** NextAuth 4 (Credentials + Google OAuth)
- **UI Library:** shadcn/ui (Radix UI primitives, Radix Luma theme)
- **Styling:** Tailwind CSS v4
- **Forms:** React Hook Form + Zod validation
- **Toasts:** Sonner
- **Icons:** Hugeicons React
- **Charts:** Recharts
- **Backend:** Spring Boot (expected at `NEXT_PUBLIC_API_URL`, default `http://localhost:8080`)
- **State Mgmt:** React Context (SessionProvider from NextAuth)

### Project Structure

```
src/
├── app/                         # Next.js App Router
│   ├── api/auth/[...nextauth]/ # NextAuth route handler
│   ├── dashboard/              # Customer dashboard (role-based route groups)
│   ├── admin/dashboard/        # Admin-only pages
│   ├── employee/dashboard/     # Employee-only pages
│   ├── superadmin/dashboard/   # Superadmin-only pages
│   ├── my/                     # Authenticated user pages (profile, measurements, …)
│   ├── login/                  # Login page (public)
│   ├── register/               # Registration page (public)
│   ├── layout.tsx              # Root layout — SessionProvider, fonts, theme
│   ├── page.tsx                # Home page
│   └── globals.css             # Tailwind CSS imports + theme tokens (OKLCH)
├── components/
│   ├── ui/                     # shadcn/ui components (buttons, inputs, cards, …)
│   ├── shared/                 # SessionProvider wrapper
│   ├── layouts/                # DashboardLayout, Sidebar, Header components
│   └── features/               # Feature-scoped components (auth, users)
├── features/
│   ├── auth/components/        # LoginForm, RegisterForm
│   └── users/components/       # ProfileForm (reusable across roles)
├── lib/
│   ├── api/
│   │   ├── client.ts           # `apiRequest` wrapper (fetch-based, adds JWT)
│   │   └── auth.ts             # Auth service layer (login, register, googleAuth, etc.)
│   ├── auth.ts                 # NextAuth config (providers, callbacks, session strategy)
│   └── utils.ts                # cn() helper (clsx + tailwind-merge)
├── hooks/                      # Custom React hooks (use-mobile)
├── types/
│   ├── index.ts                # Core types (User, AuthResponse, Measurements, ApiResponse)
│   └── next-auth.d.ts          # NextAuth session/user type extensions
└── proxy.ts                    # Dev proxy config (optional, for API proxying)
```

---

## 🔐 Authentication & Authorization

### NextAuth Configuration (`src/lib/auth.ts`)

| Provider | Mechanism |
|----------|-----------|
| Google | OAuth 2.0 — sends Google ID token to backend (`/api/auth/google`) for verification and session creation |
| Credentials | Email/password — calls `POST /api/auth/login` on backend, receives JWT |

**Session Strategy:** JWT
- `maxAge: 24 hours` (matches backend expiry)
- Callbacks: `signIn` → `jwt` → `session` — these wire backend-issued JWT (`backendToken`) and user role into the NextAuth session object.

**Session payload:**
```ts
{
  user: {
    email: string;
    role: "SUPERADMIN" | "ADMIN" | "EMPLOYEE" | "CUSTOMER";
    backendToken: string;    // backend-issued JWT (sent as Authorization: Bearer …)
    firstName: string;
  }
}
```

**Logout:** `signOut({ callbackUrl: "/login" })` — clears NextAuth session and redirects to login.

---

## 🛣️ Routing & Access Control

**Public routes**
- `/` — landing page
- `/login` — auth pages (NextAuth redirects here on sign-in failure)
- `/register` — registration

**Role-based route groups**
| Route | Required role | Notes |
|-------|---------------|-------|
| `/dashboard` | any authenticated user | Customer dashboard entry point |
| `/admin/*` | `ADMIN` | Admin management |
| `/employee/*` | `EMPLOYEE` | Employee workflows |
| `/superadmin/*` | `SUPERADMIN` | Superadmin features |
| `/my/*` | any authenticated user | Profile, measurements, orders, etc. |

**Route protection pattern:**
Role checks live in the page component or in layout components (e.g., `DashboardLayout`). If a user lacks the required role they should be redirected to `/login`.

---

## 📡 API Layer

### Request wrapper (`src/lib/api/client.ts`)

```ts
apiRequest<T>(path: string, options?: RequestInit, token?: string): Promise<ApiResponse<T>>
```

- Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`)
- Automatically JSON-encodes body, sets `Content-Type: application/json`
- If `token` (backend JWT) is provided, adds `Authorization: Bearer <token>` header
- Backend returns a consistent `ApiResponse<T>` envelope: `{ success, data, error }`

### Auth service (`src/lib/api/auth.ts`)

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `login(email, password)` | `POST /api/auth/login` | Credentials auth — returns JWT + role |
| `register(data)` | `POST /api/auth/register` | Creates new user |
| `googleAuth(googleToken)` | `POST /api/auth/google` | Google OAuth verification |
| `getProfile(token)` | `GET /api/users/me` | Fetch current user profile |
| `updateProfile(token, data)` | `PUT /api/users/me` | Update profile fields |
| `getMyMeasurements(token)` | `GET /api/users/me/measurements` | Customer measurements |
| `listEmployees(token)` | `GET /api/admin/employees` | Admin: list employees |
| `listCustomers(token)` | `GET /api/admin/customers` | Admin: list customers |
| `listAdmins(token)` | `GET /api/superadmin/admins` | Superadmin: list admins |

**Note:** All endpoints are backend Spring Boot controllers. Errors propagate as `ApiResponse.error` and should be handled in UI via toast (Sonner).

---

## 🎨 UI & Styling

- **Tailwind CSS v4:** Uses new `@import "tailwindcss"` syntax; theme tokens defined in `globals.css` (OKLCH color space).
- **shadcn/ui:** Components live under `src/components/ui/` with Radix primitives (Luma variant). Accessible-by-default, supports dark mode via `next-themes`.
- **Theme variants:** Base color is `mist` (shadcn schema). Components support `--radius` custom property via Tailwind CSS `@theme`.
- **Dark mode:** Handled by `next-themes` (`ThemeProvider` in `SessionProvider`). Toggle via theme switcher component `.dark` class on `html`.
- **Icons:** Hugeicons React (`@hugeicons/react`) with free icon pack. Icon usage: `<HugeiconsIcon icon={HomeIcon} className="size-5" />`.
- **Toasts:** Sonner `Toaster` (rendered in `layout.tsx`, invoked via `toast()` from `sonner`).
- **Charts:** Recharts used on admin/analytics pages (see `src/components/ui/chart.tsx` for shadcn wrapper).

**Color palette (light mode):**
- Primary: `oklch(0.555 0.163 48.998)` — brand amber/gold tone
- Background: `oklch(1 0 0)` (white)
- Sidebar: `oklch(0.987 0.002 197.1)` (near white)

---

## 📋 Key Files to Understand

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | NextAuth config — OAuth providers, JWT callbacks, session strategy |
| `src/lib/api/client.ts` | Fetch wrapper that injects backend JWT, defines `ApiResponse` shape |
| `src/lib/api/auth.ts` | Backend auth client (login/register/google/me endpoints) |
| `src/app/layout.tsx` | Root layout — SessionProvider, TooltipProvider, Sonner, Lora font |
| `src/components/shared/SessionProvider.tsx` | NextAuth SessionProvider + next-themes ThemeProvider wrapper |
| `src/components/layouts/DashboardLayout.tsx` | Generic dashboard shell (sidebar + header + content) |
| `src/features/auth/components/LoginForm.tsx` | Sign-in form + role-based redirect logic |
| `src/types/index.ts` | TypeScript interfaces used across the app |
| `components.json` | shadcn/ui config (component registry, style: radix-luma, alias paths) |

---

## 🔧 Common Patterns

### Creating New Pages
1. Create a folder under `src/app/` with a `page.tsx` (e.g., `src/app/my/orders/page.tsx`).
2. For protected pages, read session with `useSession()` and check `session?.user?.role`.
3. Use appropriate layout — either `DashboardLayout` (classic sidebar) or `SidebarProvider`/`AppSidebar` pattern (collapsible side nav, as seen in customer dashboard).
4. Set page `export const metadata` for SEO where relevant.

### Adding New API Endpoints
1. Add function in `src/lib/api/<domain>.ts` (e.g., `orders.ts`) that calls `apiRequest<T>(path, options, token)`.
2. Use the user's backend token: `const { data: session } = useSession(); const token = session?.user?.backendToken`.
3. Call the service function from your component, handle `res.success` and `res.error`.
4. Display errors with `toast.error(res.error?.message)`.

### Form Handling Pattern
- Form state: `useForm` from `react-hook-form`.
- Zod schema with `zodResolver`.
- `Button` `disabled={isSubmitting}` while request is in-flight.
- Show field-level errors `<p className="text-sm text-red-500">{errors.field?.message}</p>`.

Example:
```tsx
const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});
```

### Role-Based Navigation

Login form example (`src/features/auth/components/LoginForm.tsx`):
```tsx
const result = await signIn("credentials", { email, password, redirect: false });
const sessionRes = await fetch("/api/auth/session");
const session = await sessionRes.json();
switch (session?.user?.role) {
  case "SUPERADMIN": router.push("/superadmin/dashboard"); break;
  case "ADMIN":      router.push("/admin/dashboard"); break;
  case "EMPLOYEE":   router.push("/employee/dashboard"); break;
  default:           router.push("/dashboard");
}
```

### shadcn/ui Component Usage
- Import from `@/components/ui/<component>` (aliases set in `tsconfig.json` & `components.json`).
- Use `cn()` utility from `@/lib/utils.ts` to merge conditional Tailwind classes.
- Most components support `className`, `variant`, `size` props as per shadcn patterns.

---

## 🔑 Environment Variables

Create a `.env.local` file (never commit) with:

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXTAUTH_SECRET` | Session encryption key — a random 32+ byte string | Yes |
| `NEXTAUTH_URL` | App URL (NextAuth callback) — typically `http://localhost:3000` in dev | Yes |
| `NEXT_PUBLIC_API_URL` | Backend Spring Boot URL — `http://localhost:8080` in dev | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Conditional (if Google auth enabled) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Conditional (if Google auth enabled) |

**Example `.env.local`:**
```bash
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**⚠️ Security:** Never commit real credentials. The repository contains a `.gitignore` that excludes `.env*` files.

---

## ⚙️ Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript config — `paths` alias `@/*` → `./src/*` |
| `eslint.config.mjs` | ESLint flat config — extends `eslint-config-next/core-web-vitals` + `typescript` |
| `next.config.ts` | Next.js config (currently minimal) |
| `components.json` | shadcn/ui registry, aliases, theme config (radix-luma, hugeicons) |
| `postcss.config.mjs` | PostCSS with Tailwind v4 plugin |
| `.env.local` | Local environment overrides (gitignored) |
| `proxy.ts` | Optional dev proxy rules for API proxying to backend on port 8080 |

---

## 🧪 Testing & Quality

- **Linting:** `npm run lint` — ESLint with Next.js recommended rules.
- **Type checking:** `npx tsc --noEmit` — catches type errors without building.
- **Build verification:** `npm run build` — ensures production build succeeds.

No unit/integration test framework is configured yet. If adding tests, consider Vitest + React Testing Library.

---

## 🌐 Backend Integration

This frontend expects a Spring Boot backend exposing:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Email/password authentication — returns `{ token, role }` |
| `/api/auth/register` | POST | User registration — returns `{ token, role }` |
| `/api/auth/google` | POST | Google token exchange — returns `{ token, role }` |
| `/api/users/me` | GET/PUT | Current user profile data |
| `/api/users/me/measurements` | GET | Customer measurements |
| `/api/admin/employees` | GET | Admin: list employees |
| `/api/admin/customers` | GET | Admin: list customers |
| `/api/superadmin/admins` | GET | Superadmin: list admins |

**Response contract:** All endpoints return the `ApiResponse<T>` envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
// or
{
  "success": false,
  "data": null,
  "error": { "code": "string", "message": "string", "status": 400, "fields": {} }
}
```

---

## 📚 Related External Documentation

- Next.js App Router: https://nextjs.org/docs/app
- NextAuth.js: https://next-auth.js.org
- Tailwind CSS v4: https://tailwindcss.com/docs
- React Hook Form: https://react-hook-form.com/
- Zod Validation: https://zod.dev
- shadcn/ui: https://ui.shadcn.com
- Radix UI: https://www.radix-ui.com
- Sonner (toasts): https://sonner.emilkowalczyk.io

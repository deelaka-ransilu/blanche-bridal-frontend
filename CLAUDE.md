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
# or
bun dev
```

**Build for production:**
```bash
npm run build
```

**Start production server:**
```bash
npm run start
```

**Run linting:**
```bash
npm run lint
# or for fix:
npm run lint -- --fix
```

**Type checking:**
```bash
npx tsc --noEmit
```

## 🏗️ Architecture Overview

### Project Structure
```
src/
├── app/                 # Next.js 13+ app router
│   ├── api/             # API routes (including [...nextauth] for NextAuth)
│   ├── dashboard/       # Protected dashboard routes
│   ├── admin/           # Admin-only routes
│   ├── employee/        # Employee-only routes  
│   ├── superadmin/      # Superadmin-only routes
│   ├── login/           # Auth pages
│   ├── register/        # Registration page
│   ├── my/              # User profile routes
│   ├── layout.tsx       # Root layout with providers
│   └── page.tsx         # Home page
├── components/          # Reusable UI components
│   ├── layouts/         # Layout components (sidebar, headers)
│   ├── shared/          # Shared components (SessionProvider)
│   └── ui/              # Radix UI + shadcn components
├── features/            # Feature-based organization
│   ├── auth/            # Auth-related components
│   └── users/           # User profile components
├── lib/                 # Utility libraries
│   ├── api/             # API client and auth services
│   └── utils.ts         # General utilities
├── hooks/               # Custom React hooks
└── types/               # TypeScript type definitions
```

### Authentication
- Uses **NextAuth 4** with CredentialsProvider
- JWT strategy with 24-hour expiry matching backend
- Backend token stored in session for API calls
- SessionProvider wraps app to provide auth context
- Protected routes check session/user.role

### Routing & Access Control
- **app router** with route groups for role-based access
- Public routes: `/`, `/login`, `/register`
- Protected routes require authentication:
  - `/dashboard` - base dashboard
  - `/admin/*` - admin role required
  - `/employee/*` - employee role required  
  - `/superadmin/*` - superadmin role required
  - `/my/*` - authenticated users only
- Role checking done via session data in middleware or component level

### State Management
- **React Context** via SessionProvider for auth state
- **React Query/TanStack** not used - direct API calls with tokens
- Form state managed with **React Hook Form** + Zod validation
- UI state (loading, toast) handled with Sonner + local state

### Styling & UI
- **TailwindCSS 4** for utility-first styling
- **Radix UI** primitives for accessible components
- **shadcn/ui** component library for pre-built UI
- **Next Themes** for dark/light mode support
- Custom CSS in `globals.css` for base styles
- Class variance authority for variant components

### API Communication
- `src/lib/api/client.ts` - axios-like wrapper with interceptors
- Automatic JWT attachment to requests
- Base URL configured for backend communication
- Error handling with consistent response format

## 📝 Key Files to Understand

1. **`src/app/layout.tsx`** - Root layout with SessionProvider and theme providers
2. **`src/lib/auth.ts`** - NextAuth configuration with JWT callbacks
3. **`src/lib/api/auth.ts`** - Auth service functions (login, register, profile)
4. **`src/lib/api/client.ts`** - API request wrapper with auth handling
5. **`src/app/api/auth/[...nextauth]/route.ts`** - NextAuth route handler
6. **`src/components/shared/SessionProvider.tsx`** - Auth context provider
7. **`src/components/layouts/`** - Layout components (sidebar, headers)
8. **`src/types/`** - TypeScript interfaces for API responses

## 🔧 Common Patterns

### Creating New Pages
1. Create folder under `src/app/` (e.g., `src/app/new-feature/page.tsx`)
2. Use route protection by checking `session.user.role` in component
3. For admin-only routes, add role check at top of component

### Adding API Endpoints
1. Create route in `src/app/api/your-endpoint/route.ts`
2. Use `apiRequest` wrapper from `src/lib/api/client.ts` for consistency
3. Attach backend token from session to requests

### Form Handling
1. Use React Hook Form with Zod validation (`@hookform/resolvers`)
2. Follow existing form patterns in `src/features/auth/components/`
3. Handle loading/submission states with Sonner toast notifications

### Component Creation
1. Place reusable components in `src/components/ui/` (shadcn style)
2. Feature-specific components in `src/features/[feature]/components/`
3. Use Tailwind CSS classes for styling
4. Follow existing component patterns for props and TypeScript

## 🧠 Important Notes

- **Environment Variables**: Check `.env.example` for required vars (NEXTAUTH_SECRET, etc.)
- **Backend Dependency**: Frontend expects Spring Boot backend at configured API URL
- **Role System**: Roles come from backend JWT (admin, employee, superadmin)
- **Token Handling**: Backend token stored in session, attached to API requests automatically
- **Error Handling**: API errors return consistent format; UI uses Sonner for toast notifications

## 📚 Related Documentation
- Next.js App Router: https://nextjs.org/docs/app
- NextAuth.js: https://next-auth.js.org
- Tailwind CSS: https://tailwindcss.com
- React Hook Form: https://react-hook-form.com
- Zod Validation: https://zod.dev
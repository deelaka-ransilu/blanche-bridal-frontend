# PROGRESS.md — Bridal Boutique
> Update this file at the end of EVERY chat session before closing.
> This is the single source of truth for the next chat.

---

## Current Status

**Active Branch:** `feat/fe-setup`
**Last Completed Task:** _(nothing yet — project not started)_
**Next Task:** Phase 1 — Project Setup (see task list below)
**Blocked On:** _(nothing)_

---

## What Is Done (Fully Working)

> Check items off as you complete them. Never check something that is half-done.

### Phase 1 — Setup
- [ ] `npx create-next-app` scaffolded
- [ ] `npx shadcn@latest init` (amber palette)
- [ ] All shadcn components installed
- [ ] `tailwind.config.ts` — bridal palette + CSS variables
- [ ] `globals.css` — CSS variable mappings
- [ ] Folder structure created (all dirs + empty page.tsx placeholders)
- [ ] `middleware.ts` — route protection skeleton
- [ ] Aceternity components copied to `/components/aceternity`
- [ ] `.env.example` committed
- [ ] `.env.local` created locally (NOT committed)
- [ ] `lib/mock-data.ts` — initial seed data
- [ ] `lib/api.ts` — mock/real toggle pattern
- [ ] `app/layout.tsx` — root layout with ThemeProvider
- [ ] `app/(public)/layout.tsx`
- [ ] `app/(admin)/layout.tsx`
- [ ] `app/(customer)/layout.tsx`
- [ ] `npm run dev` starts with zero errors
- [ ] Committed to git, PR merged to develop, tagged `v0.1-setup`

---

## Actual File Tree
> Replace this with your real output of `find . -type f | grep -v node_modules | grep -v .next | grep -v .git | sort` after Phase 1

```
(not created yet)
```

---

## Decisions Made (Deviations from Plan)
> Any time you do something differently from CONTEXT.md, write it here.
> The next chat must know about these or it will contradict them.

| Decision | Reason | Date |
|----------|--------|------|
| _(none yet)_ | | |

---

## Files the Next Chat Needs to See
> After each session, list the files that the NEXT phase will import or extend.
> Paste their actual content into the next chat, not just the filenames.

- `app/layout.tsx`
- `app/(public)/layout.tsx`
- `app/(admin)/layout.tsx`
- `app/(customer)/layout.tsx`
- `lib/api.ts`
- `lib/mock-data.ts`
- `middleware.ts`
- `tailwind.config.ts`
- `globals.css`

---

## Half-Done / Stopped Mid-Task
> If you stopped in the middle of something, describe EXACTLY where.
> Never leave this blank if you stopped mid-task.

_(nothing — not started yet)_

---

## Known Issues / Bugs
> Things that are wrong but you are leaving for later.

| Issue | File | Priority |
|-------|------|----------|
| _(none yet)_ | | |

---

## Git Log (Last 5 Commits)
> Paste output of `git log --oneline -5` at end of each session.

```
(not started yet)
```

---

## Environment Variables Status

| Variable | Set in .env.local? | Notes |
|----------|--------------------|-------|
| NEXTAUTH_SECRET | ☐ | Generate with: `openssl rand -base64 32` |
| NEXTAUTH_URL | ☐ | `http://localhost:3000` |
| GOOGLE_CLIENT_ID | ☐ | From Google Console |
| GOOGLE_CLIENT_SECRET | ☐ | From Google Console |
| CLOUDINARY_CLOUD_NAME | ☐ | |
| CLOUDINARY_API_KEY | ☐ | |
| CLOUDINARY_API_SECRET | ☐ | |
| NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME | ☐ | |
| PAYHERE_SECRET | ☐ | |
| NEXT_PUBLIC_PAYHERE_MERCHANT_ID | ☐ | |
| NEXT_PUBLIC_PAYHERE_SANDBOX | ☐ | Set to `true` |
| RESEND_API_KEY | ☐ | |
| NEXT_PUBLIC_GA_MEASUREMENT_ID | ☐ | |
| NEXT_PUBLIC_API_URL | ☐ | `http://localhost:8080` |
| API_SECRET_KEY | ☐ | |

---

## Session Log
> One line per session. Add a new line every time you close a chat.

| Date | Chat # | What Was Done | Stopped At |
|------|--------|---------------|------------|
| | 1 | | |

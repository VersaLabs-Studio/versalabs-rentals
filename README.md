# RentFlow Demo

A front-end-only rental management system demo. Mock data layer behind TanStack Query, localStorage persistence, premium UI.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use any credentials on the login screen (demo account prefilled).

## Reset Seed Data

If localStorage state becomes inconsistent during development:

```js
// In browser console:
Object.keys(localStorage).filter(k => k.startsWith('rentflow:')).forEach(k => localStorage.removeItem(k))
location.reload()
```

## Architecture

- **Next.js 15** (App Router) + **TypeScript strict**
- **TanStack Query** for data state (swappable to Supabase later)
- **Zod** schemas as source of truth
- **localStorage** mock repository (factory pattern)
- **Tailwind v4** with OKLCH design tokens
- **Framer Motion** for transitions
- **Recharts** for analytics

See `src/lib/mock/createRepository.ts` for the data-access factory. The repository signatures are shaped to be a drop-in replacement for a real backend.

# Concierge

Full-stack property operations platform built to the *Concierge Platform – Google Antigravity Prompt Specification Guide, v6.0*.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn-style UI primitives · NextAuth.js (credentials) · Prisma ORM · PostgreSQL

## Quick start

```bash
# 1. Start PostgreSQL (or point DATABASE_URL at your own instance)
docker compose up -d

# 2. Install dependencies (also runs `prisma generate`)
npm install

# 3. Create the schema and seed development data
npx prisma migrate dev --name init
npm run db:seed

# 4. Run the app
npm run dev
```

Open http://localhost:3000.

### Development logins (seeded)

| Role        | Email                    | Sign in at        |
|-------------|--------------------------|-------------------|
| Super Admin | admin@concierge.test     | /login            |
| Staff       | staff@concierge.test     | /login            |
| Resident    | resident@concierge.test  | /portal/login     |

Password for all three: see `DEV_PASSWORD` in `prisma/seed.ts`. These are development-only credentials. Change them before any shared or deployed environment.

## Architecture

| Area | Location |
|------|----------|
| Prisma schema (Prompt 1) | `prisma/schema.prisma` |
| Seed data (Prompt 1) | `prisma/seed.ts` |
| Auth + RBAC middleware (Prompt 4) | `lib/auth.ts`, `middleware.ts`, `lib/session.ts` |
| Global shell, home, top nav (Prompt 2) | `app/(branches)/layout.tsx`, `app/(branches)/page.tsx`, `components/shared/TopNav.tsx` |
| Branch side navigation (Prompt 3) | `components/shared/SideNav.tsx`, `lib/branches.ts` |
| TBD placeholder (Prompt 2 §4) | `components/shared/TBDPlaceholder.tsx` |
| Branch folders (Prompt 6) | `app/(branches)/{site-management,facilities,security,cases,admin,portal}` |
| Space Roster (Prompt 7) | `app/(branches)/site-management/space-roster` |
| Service requests, triage, work orders (Prompt 8) | `lib/service-requests.ts`, `app/(branches)/facilities/work-orders` |
| Process Billing (Prompt 9) | `app/(branches)/site-management/billing` |
| Checklist templates (Prompt 10) | `app/(branches)/site-management/admin/checklist-templates` |
| Resident portal (Prompt 5) | `app/(branches)/portal`, `app/api/portal/*`, `lib/portal.ts` |

### Rules that are enforced in code

- **Dashboards are navigation-only.** Branch home pages contain link cards and nothing else: no charts, KPIs, counts or feeds.
- **Branch isolation.** Each branch folder imports only from `components/shared`, `components/ui` and `lib`. Branches do not import from each other.
- **Row-level isolation for residents.** `residentId` is written into the session token at login. Every `/api/portal/*` handler and every portal page reads it from the session and filters on it. No request body or URL value is trusted for it.
- **Role gates in two places.** Middleware gates routes first; server pages and actions call `requireRole` again.

## Notes and decisions

- Routes follow the v6 spec: `/facilities` and `/cases` (not `/facility-management`).
- The v6 role enum is `SUPER_ADMIN | STAFF | RESIDENT`.
- Sub-modules marked `[TBD]` in the spec render the standard placeholder and show a TBD badge in the side navigation.
- **Payments are a development stub.** `POST /api/portal/payments` records a `Payment` row. No processor is connected.
- Naming: the platform is "Concierge" and the word "hub" is not used (per `cleanup.md`).

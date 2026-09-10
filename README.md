# ClientFlow

Share a website with a client, collect **pixel-anchored visual feedback**, manage revisions, and
capture a final approval — in one place.

**Workflow:** create project → share private review link → client pins feedback on the live site →
designer resolves → client approves → immutable approval record.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion,
Supabase (Postgres + Auth), Lucide, Recharts, Zod.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

The app boots in **demo mode** (no database required): it serves realistic in-memory sample data so
you can walk the whole workflow immediately. Changes persist for the lifetime of the dev server
process and reset on restart. A dismissible banner marks demo mode in the app.

### Demo data

- 3 projects: *Vishan Graphics Website* (waiting for client), *ABC Restaurant Website* (in progress),
  *NovaTech Corporate Website* (approved).
- Client review links (demo tokens):
  - `/review/demo-vishan-graphics-review-token-001`
  - `/review/demo-abc-restaurant-review-token-002`
  - `/review/demo-novatech-review-token-003`
- In demo mode, login/signup accept anything and drop you on `/dashboard`.

---

## Connecting Supabase (production)

### 1. Create the project

Create a project at [supabase.com](https://supabase.com). Note the region and database password.

### 2. Environment variables

Copy `.env.example` → `.env.local` and fill in (values from **Project Settings → API**):

| Var | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (`https://<ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key — **server-only, never sent to the browser** |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally, or your deployed URL |
| `APP_HASH_SALT` | any long random string (hashes approval IPs) |

### 3. Apply the schema

Open **SQL Editor** and run these files **in order** (paste the whole file, Run):

```
supabase/migrations/20260101000000_init.sql        -- tables, enums, indexes, constraints
supabase/migrations/20260101000001_rls.sql         -- Row Level Security policies
supabase/migrations/20260101000002_functions.sql   -- triggers: profile bootstrap, seq numbering,
                                                   --   activity log, notifications, approval immutability
```

*(CLI alternative: `supabase link --project-ref <ref>` then `supabase db push`.)*

### 4. Configure Auth

**Authentication → URL Configuration:**
- **Site URL:** your `NEXT_PUBLIC_SITE_URL`
- **Redirect URLs:** add `http://localhost:3000/auth/callback` and `https://<your-domain>/auth/callback`

**Authentication → Providers → Email:** enabled. Keep **Confirm email** ON for production
(the app handles the confirmation + password-recovery redirects at `/auth/callback`).

### 5. (Optional) Sample data

Run `supabase/seed.sql` in the SQL Editor. It creates a demo designer
**`demo@clientflow.app` / `clientflow-demo`** plus the three sample projects, and is idempotent.
If your environment blocks the `auth.users` insert, sign up in the app first, then set the
`owner` UUID at the top of the file to your own auth id and re-run.

### 6. (Optional) Storage

Create public buckets `avatars` and `thumbnails` if you want profile / project image uploads
(the UI shows the fields; upload wiring is a follow-up).

---

Once `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present, the app **leaves demo
mode automatically**: routes are auth-gated by `src/proxy.ts`, every designer read/write is
RLS-scoped to the signed-in owner, and the public review page goes through the server-only
service-role client after validating the review token.

---

## Architecture

```
src/
  app/
    (marketing)/         landing + pricing (SEO, OG image, sitemap, robots)
    (auth)/              login, signup, reset-password, update-password
    (app)/               dashboard, projects, clients, feedback, settings  (sidebar shell, noindex)
    (fullscreen)/        designer review interface (no shell)
    review/[token]/      public client review page (no account, noindex)
    auth/callback/       Supabase email-confirm / recovery / OAuth code exchange
    api/
      embed-check/       inspects X-Frame-Options / CSP frame-ancestors (SSRF-guarded)
      review/[token]/    token-scoped client feedback / reply / approve
  proxy.ts               auth gate + Supabase session refresh (Next 16's renamed middleware)
  components/
    ui/                  design system (Button, Modal, Dropdown, Tabs, Badge, …)
    marketing/  app/  review/  theme/  brand/
  lib/
    data/                unified data layer — Supabase repo OR in-memory demo store
      demo-store.ts        mutable demo state
      supabase-repo.ts     RLS-scoped reads (React-cache deduped)
      mutations.ts         writes — anon client (designer) or injected service-role client (review)
      review.ts            token-scoped public access (service role, server-only)
    supabase/            browser / server / admin clients + proxy helper
    auth/actions.ts      sign in / up / out / reset / update-password server actions
    validation/          Zod schemas (shared client + server)
    ai/                  FeedbackAnalyzer abstraction (no-op provider; provider drop-in later)
    utils/               cn, motion presets, formatting, URL/SSRF guards, rate limiting
supabase/
  migrations/            *_init (schema) · *_rls (RLS) · *_functions (triggers)
  seed.sql               sample data (idempotent)
  config.toml            optional — for `supabase` CLI
```

### The visual feedback mechanism

Cross-origin sites can't expose click/DOM events inside an iframe, so a **transparent capture layer**
sits on top of the preview iframe. A click is stored as `x`/`y` **percentages** of the frame plus the
page URL and device mode — markers stay anchored when the layout reflows. `element_selector` is
captured only for same-origin sites. Sites that block embedding (`X-Frame-Options` /
`frame-ancestors`) are detected and show a helpful "open in new tab" message — ClientFlow never
bypasses a site's security policy.

### Security

- RLS on every table; owners are scoped by `auth.uid()`.
- The public review page never widens RLS — it uses the **server-only service-role client**, always
  filtered by the review token first (a 256-bit random value, not a database id).
- Approvals are insert-only and blocked from updates by a trigger (immutable record).
- Zod validation on every route handler and server action; in-memory IP rate limiting on public
  review writes and `embed-check`; SSRF guard on `embed-check` (no private hosts).
- Service-role key is `import "server-only"` and never sent to the browser.

---

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run start        # serve production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
```

## Deploy (Vercel)

Import the repo, set the env vars above in the Vercel project, deploy. Set `NEXT_PUBLIC_SITE_URL` to
the production URL so review links and OG tags resolve correctly.

## Not in this MVP (by design)

Billing/payments (plans are shown but mock), team members, white-label, custom domains, advanced
analytics, and AI analysis (the abstraction is in place — no provider wired).

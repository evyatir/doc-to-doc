# Doc. to Doc.

A marketing + lead-capture site for **Doc. to Doc.** — a consultancy that
helps future medical students choose the right med school in Europe,
navigate applications, and prepare for what comes next, guided by doctors
and medical students who've made the journey themselves.

`frontend/` (React + Vite) + `backend/` (Express + Postgres, for the intake
form only) + `clients/doc-to-doc/config.js` (all brand copy, palette, team
bios, FAQ). There is no cart, no checkout, no product catalog — the one
conversion action on this site is booking a free 15-minute call at `/book`.

Rebuilt 2026-08-16 from the client's "WEBSITE GENERAL IDEA" brief (mockups +
palette + real team bios). This repo started life as a fork of a generic
e-commerce storefront backbone; that heritage is gone from the frontend now,
though some backend product/order plumbing is still sitting there unused
(see **Known leftovers** below) — no site content depends on it.

## Install & run

```bash
npm install
npm run dev            # http://localhost:5173, frontend only
npm run dev:all         # frontend :5173 + API :3001 together (dev proxy wires /api)
```

## Pages

| Route | What's there |
|---|---|
| `/` | Hero, the "you don't need to figure it out alone" quote band, a How It Works teaser, the "why us" quote, final CTA |
| `/how-it-works` | The four steps in full: free call → best-fit schools → build the application → get ready for day one |
| `/who-we-are` | Team bios (Gal, Virginia, Andrea, Ishit) — real names/quotes from the brief |
| `/faq` | Accordion FAQ, pushes the free 15-minute call per the brief's note |
| `/testimonials` | Honest empty state — no reviews collected yet; ships with a `TESTIMONIALS` array in config ready to fill in |
| `/book` | The core page: an emotional hook + one "Book a Consultation" button that toggles open the intake form (name, email, student/parent, stage, notes) + a Calendly/Cal.com embed slot — matches the brief's "toggle for consultation" wording |
| `/admin` | Not linked publicly — password-protected list of everyone who submitted the `/book` form |

## Config (`clients/doc-to-doc/config.js`)

One file drives the whole site: `BRAND` (name, logo, contact), `THEME` (the
client's exact 5-color palette + fonts), `NAV`, `HERO`, `REASSURANCE`,
`STEPS`, `HOW_IT_WORKS`, `TEAM`, `FAQ`, `TESTIMONIALS`, and `KEYS.calendlyUrl`.
Blank image fields (`HERO.photo`, `TEAM.groupPhoto`, each member's `photo`)
render tinted placeholders — swap in real photos via
`new URL('./assets/photo.jpg', import.meta.url).href` once they exist.

### Still placeholder — fix before this goes live

- `BRAND.whatsapp` / `BRAND.email` — dummy values
- `HERO.photo`, `TEAM.groupPhoto`, and each team member's `photo`
- `KEYS.calendlyUrl` — blank; until it's set, `/book`'s calendar side shows a
  "not connected yet" fallback and the form-only flow still captures the lead
- `TESTIMONIALS` — empty on purpose, per the brief ("we need to ask people")
- FAQ answers are a first draft — review before publishing, especially the
  admissions-guarantee one

## How theming works

`theme.js` maps `THEME` onto CSS custom properties on `<html>` and injects a
Google Fonts `<link>` for the two configured families (Playfair Display /
Lora). `styles.js` reads only those variables — no literal hex colors or font
names in `frontend/src/`.

## Backend

The only thing the backend does now is receive `/book`'s intake form via
`POST /api/contact` and let `/admin` list submissions. It boots fine with an
**empty `.env`**: `GET /api/health` reports `{ ok: true, db: false }`,
`/api/contact` returns `503`, and the form still shows a normal success state
to the visitor (degraded mode — a lead is never lost to a config mistake,
though it also isn't recorded anywhere until a database is connected).

```bash
cp .env.example .env
npm run gen-secret        # paste output into .env as JWT_SECRET
npm run hash-password -- "your admin password"   # paste as ADMIN_PASSWORD_HASH
# set DATABASE_URL (e.g. the connection string from the Neon dashboard)
npm run db:migrate
npm run dev:all
```

### API reference

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/health` | — | `{ ok, db }` |
| POST | `/api/contact` | — | `{ firstName, lastName, email, phone?, role?, stage?, message? }` — backs the `/book` intake form |
| POST | `/api/admin/login` | — | `{ password }` → `{ token }` (24h) |
| GET | `/api/admin/messages` | JWT | leads, newest first |

### Deploy notes

- Single container works: when `frontend/dist` exists, `backend/index.js`
  serves it directly (see `Dockerfile` / `deploy/`).
- Set `VITE_API_URL` if the frontend and API are on different origins.
- `POST /api/contact` is rate-limited (5 submissions / 10 minutes / IP,
  in-memory) and has a client-side honeypot field against basic bots.
  `app.set('trust proxy', 1)` is set so the limiter sees the real visitor IP
  behind a reverse-proxy deploy (Render/Coolify/etc.) — if you front this
  with more than one proxy hop, adjust that value.
- No payments and no customer accounts on this site — the trust surface is
  much smaller than a storefront's.
- **Not yet deployed anywhere persistent.** Everything above has been
  verified against a real (throwaway, local) Postgres instance — migrations,
  the intake form, rate limiting, and the admin leads view all work
  end-to-end. But there is no live database or hosted API right now, so
  `/book` on the public GitHub Pages demo runs in degraded mode: the form
  shows success but nothing is recorded. To make it real: create a Postgres
  instance (Neon/Supabase/etc. all have a free tier) and a host for
  `backend/` (Render, or the VPS+Coolify path in the original backbone's
  `docs/guides/DEPLOY_VPS.md`) — **I can't create third-party accounts on
  your behalf**, so this step needs you, then hand me the connection
  string / point me at the host and I'll wire and verify the rest.

## Known leftovers (not cleaned up in this pass)

The repo still carries dead weight from its storefront-backbone origin,
harmless but worth knowing about:

- `backend/routes/admin.js` still has full product/order CRUD, and
  `backend/queries.js` + migrations `001`/`002` still define `products`,
  `product_variants`, and `orders` tables. Nothing in the frontend calls any
  of it.
- `docs/` (guides + reference) documents the old multi-client e-commerce
  backbone this repo was forked from — it no longer matches what's actually
  here and hasn't been rewritten.
- A Google Cloud OAuth project (`doc-to-doc-505018`) was created for an
  earlier "applicant accounts" feature that this rebuild dropped (no accounts
  needed for a lead-gen site). It's idle and free — fine to ignore or delete
  in Google Cloud Console.

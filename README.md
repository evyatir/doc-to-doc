# Doc. to Doc.

Mentorship for med-school applicants, run by practicing doctors. Built on the
[Storefront Backbone](https://github.com/idobadash-dev/website-backbone):
`frontend/` (React + Vite) + `backend/` (Express + Postgres API) + `clients/`
(per-client config read by both sides). This repo is that backbone with one
client filled in — `clients/doc-to-doc/` — and one shared improvement
(a phone field on the contact form, so "we'll call you back" has a number to
call). `demo/` and `_template/` stay in `clients/` per the backbone's own
convention, for spinning up sibling sites later.

Before this goes live: replace the placeholder `whatsapp` and `email` in
`clients/doc-to-doc/config.js`, and drop real photos into
`clients/doc-to-doc/assets/` (blank images render tinted placeholders, which
is why the site demos cleanly right now with none).

One React + Vite codebase, many client storefronts. Each client is a config
folder; `frontend/src/` is shared machinery and is **never edited per
client** — if a client's needs require editing it, the architecture has
failed.

Grounded in [SITE_AUDIT.md](docs/reference/SITE_AUDIT.md) (headless-Chrome
audit of the reference site) via [BUILD_SPEC.md](docs/reference/BUILD_SPEC.md).

**All docs live in [docs/](docs/) — start at [docs/README.md](docs/README.md).**

## Install & run

```bash
npm install
npm run dev            # runs the "demo" client at http://localhost:5173
```

Run a specific client:

```bash
# macOS / Linux
CLIENT=_template npm run dev

# Windows PowerShell (no cross-env on purpose — see Dependencies)
$env:CLIENT='_template'; npm run dev

# Windows cmd
set CLIENT=_template && npm run dev
```

`npm run build` / `build:client` work the same way.

## Adding a client (four steps)

1. Copy `clients/_template/` to `clients/<name>/`.
2. Fill in `config.js` — brand, theme, products, pages. Blank images render
   tinted placeholders, so a half-filled config still demos cleanly.
3. Drop photos into `clients/<name>/assets/` and reference them from config
   with `new URL('./assets/photo.jpg', import.meta.url).href`.
4. `CLIENT=<name> npm run dev`.

Five hex values and two font names in the config should make two clients look
like different studios built them — that's the test of a good fill-in.

## Config schema (named exports of `clients/<name>/config.js`)

> **[CONFIG_MANUAL.md](docs/guides/CONFIG_MANUAL.md)** maps every config field
> to the exact spot it appears on screen — nav, footer, homepage bands, the lot.

| Export | What it drives |
|---|---|
| `BRAND` | name, handle, socials, whatsapp/email/address, announcement line, currency, `freeShipOver` (0 hides the cart shipping bar) |
| `THEME` | colors (band/paper/ink/inkOnBand/accent/muted/focus), fonts (display/body/accent), radii (commerce pill vs everything), 11-step type scale, the two motion durations |
| `CATEGORIES` | shop filters + Home photo bands `{ id, label, img }` |
| `DROPS` | lookbooks `{ id, label, sub, note, heroImg, photos[], shopNowHref? }` — index 0 is the current drop (Home hero) |
| `PRODUCTS` | `{ id, name, price, cat, drop, sizes[], sizeLabel?, family?, cut?, soldOut?, desc?, imgs[] }` |
| `PAGES` | `/p/<slug>` content pages `{ title, body[] }`; the `product-care` and `shipping-returns` slugs also feed the PDP accordions |
| `SIZE_GUIDE` | `{ enabled, tables: [{ title, cols[], rows[][] }] }` — real `<table>` markup |
| `IG_POSTS` | static Instagram grid (no API) |
| `FEATURES` | flags, see below |
| `KEYS` | all blank; nothing reads them until a value is set |

### FEATURES flags

| Flag | Default | Effect |
|---|---|---|
| `cart` | true | cart page + bag icon |
| `cartDrawer` | true | drawer on add-to-cart; `false` → toast + badge only |
| `checkout` | false | `false` → "Order on WhatsApp" handoff (`wa.me` with readable cart lines); `true` → stub toast |
| `search` | true | header search with live filtering |
| `giftCard` | `[amounts]` | array = enabled with those presets; `false` = off (route redirects to `/`) |
| `drops` | true | drops index + lookbooks |
| `instagram` / `newsletter` | true | homepage grid / footer signup |
| `accounts` | false | `false` → account icon toasts "coming soon" |
| `wishlist` | false | reserved; the reference site has no working wishlist |
| `notifyWhenAvailable` | true | sold-out PDP email-capture UI (stores nothing) |
| `stickyHeader` | true | sticky band; `false` → scrolls away like the reference |

Feature-flagged routes redirect to `/` when off, and their nav/footer links
don't render.

## How theming works

`theme.js` maps `THEME` onto CSS custom properties on `<html>` and injects one
Google Fonts `<link>` (blank font names skip the request and fall back to
system stacks). The entire stylesheet (`styles.js`) reads only those variables
— `frontend/src/` contains **no literal hex colors or font names** outside the token
plumbing in `theme.js`, and **no `text-transform` anywhere**: the reference's
all-caps look comes from Bebas Neue being a caps-only font, so a mixed-case
display font renders mixed case by design.

Motion is two tokens: `fade` (0.2s ease — card cross-fade, link hover,
blur-up, drawer/menu/caption fades) and `recolor` (0.2s ease-in-out — button
colors). Nothing else animates; `prefers-reduced-motion` disables both.

## Dependencies beyond the spec's list

- `@vitejs/plugin-react` (dev): the standard Vite plugin required for JSX/Fast
  Refresh. Not a runtime dependency.
- `cross-env` was deliberately **not** added — per-OS commands are documented
  above instead.

## Backend

> Deploying? **[DEPLOY.md](docs/guides/DEPLOY.md)** is the operator's manual: folder map,
> the three deployment modes, provider setup, and a post-deploy trust checklist.

Node + Express + Postgres in `backend/`, provider-agnostic on purpose: any
Postgres host works (Neon / Supabase / RDS / self-hosted), all DB access goes
through `backend/db.js`, and image storage is a stub interface in
`backend/storage/` until a provider is chosen. Switching providers later is an
`.env` change + at most one adapter file.

### No database yet? That's fine (degraded mode)

The server boots with an **empty `.env`**: `GET /api/health` reports
`{ ok: true, db: false }`, every data route returns
`503 { "error": "Database not configured" }`, and the storefront falls back to
config products with the WhatsApp-only checkout. The site is fully usable with
zero backend configuration — that is the supported deployment mode until a
database is connected.

### Setup with a database

```bash
cp .env.example .env
npm run gen-secret        # paste output into .env as JWT_SECRET
npm run hash-password -- "your admin password"   # paste as ADMIN_PASSWORD_HASH
# set DATABASE_URL (e.g. the connection string from the Neon dashboard)
npm run db:migrate
npm run db:seed           # products from clients/demo/config.js; re-run safe
npm run dev:all           # frontend :5173 + API :3001 (dev proxy wires /api)
```

`db:seed` is idempotent: products upsert by name, variants never duplicate, and
re-running preserves stock the admin has edited.

### API reference

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/health` | — | `{ ok, db }` |
| GET | `/api/products` | — | active products + variants + derived `soldOut`; `?category=` `?family=` |
| GET | `/api/products/:id` | — | 404 if missing/inactive |
| POST | `/api/orders` | — | `{ customer:{name,phone,email?}, note?, items:[{productId,size,qty}] }` → `{ orderId, subtotal }`; 409 + per-line detail on stock shortage (transactional, nothing decremented) |
| POST | `/api/newsletter` | — | `{ email }`, upsert |
| POST | `/api/contact` | — | `{ firstName, lastName, email, message, wantsNewsletter }` |
| POST | `/api/admin/login` | — | `{ password }` → `{ token }` (24h) |
| GET/POST | `/api/admin/products` | JWT | full CRUD incl. variants |
| PUT | `/api/admin/products/reorder` | JWT | `{ ids: [..] }` — complete ordered id list; rewrites `sort_order` 1..N; 409 if the list is stale |
| PUT/DELETE | `/api/admin/products/:id` | JWT | DELETE = soft delete (`active=false`) |
| POST | `/api/admin/upload` | JWT | raw image bytes as body (jpeg/png/webp/gif/avif, max 5 MB), `?filename=` → `{ url }`; needs `STORAGE_PROVIDER=local` |
| GET | `/api/admin/orders` | JWT | newest first, with items + status counts; `?status=` |
| PUT | `/api/admin/orders/:id` | JWT | `{ status }`; transitions enforced (new→confirmed→fulfilled, cancel while not fulfilled) |
| GET | `/api/admin/messages` | JWT | contact messages |
| GET | `/api/admin/subscribers` | JWT | emails + dates |

Money is integer **agorot** in the DB and API; the frontend converts for
display. Sold-out is **derived** (all variant stocks 0) — no flag exists.

### Admin usage

`/admin` (not linked anywhere public) → password login → three tabs:
**Products** (inline stock edit, add/edit form with ₪ prices, image upload +
pasted URLs with thumbnail previews, drag the `⠿` handle to reorder — the
storefront follows the same order, deactivate), **Orders** (expandable items,
status dropdown, counts), **Messages** (contact messages + subscribers, emails
copyable as a comma-separated string).

### Deploy notes

- **Server**: Render free tier works — root `npm install`, start
  `node backend/index.js`, env vars from `.env.example` (DATABASE_URL,
  JWT_SECRET, ADMIN_PASSWORD_HASH, CORS_ORIGIN=frontend URL).
- **Frontend**: Vercel — build `npm run build`, and set **`VITE_API_URL`** to
  the server's origin (the only frontend change needed at deploy; dev uses the
  Vite proxy and an empty default).
- **Uploaded images** live on the server's disk (`backend/uploads/`,
  gitignored). On hosts with ephemeral filesystems (Render free tier included)
  mount a persistent disk at `backend/uploads` or uploads vanish on redeploy.
  Split-origin deploys set `PUBLIC_BASE_URL` so image URLs are absolute.
- Deploy-time TODO (deliberately not built): **rate limiting** — unthrottled
  `POST /api/orders` decrements stock with no payment. No payments, no emails,
  no customer accounts. (CSRF is *not* a gap: admin auth is a Bearer token, not
  a cookie.) Full security register + pre-launch checklist:
  [docs/guides/SECURITY.md](docs/guides/SECURITY.md).

## Notes

- Cart persists to `localStorage`, namespaced by `BRAND.name`, keyed by
  product id + size (same pair increments).
- Config is validated on boot in dev only: duplicate ids, missing
  category/drop references, single-product families, empty required BRAND
  fields, and non-ascending size-guide ranges all `console.warn` — never throw.
- The contact form intentionally has no `<form>` element (spec §8); inputs are
  real and labeled, Enter submits. It posts to `/api/contact` fire-and-forget,
  so the success state works even with the backend absent.

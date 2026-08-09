# Deployment Manual — Storefront + Backend

This is the operator's manual for putting the site "on air". It tells you what
exists, what changed, how to deploy in each mode, and — importantly — how to
**verify with your own eyes** that the deployed system does what it claims.
Nothing here requires touching code.

> **Recommended path:** to host one or more sites, deploy a single **VPS +
> Coolify**, where each site is one container (this backend serves its own built
> frontend), deployed from its own client repo. See
> **[DEPLOY_VPS.md](DEPLOY_VPS.md)** for the why *and* the step-by-step. The
> architecture, run modes, trust checklist and known limits in *this* manual all
> still apply — but the Vercel/Render/Neon steps in §2 are now **one split-host
> alternative**, not the default.

---

## 1. What's in the repo (backend vs frontend folders)

```
website_backbone/                ← ONE website. Each site is its own copy of
│                                  this repo on its own server.
├── frontend/                ← THE FRONTEND (React + Vite)
│   ├── index.html           ← page shell
│   └── src/                 ← app code, shared across all clients
│       ├── api.js           ← fetch wrapper + hooks + config fallback
│       ├── pages/           ← storefront pages
│       └── pages/admin/     ← the /admin owner panel
│
├── backend/                 ← THE BACKEND (Node + Express, plain JS)
│   ├── index.js             ← server entry: boot, health, degraded-mode gate
│   ├── db.js                ← the ONLY file that talks to Postgres
│   ├── auth.js              ← admin JWT sign/verify
│   ├── queries.js           ← shared product queries
│   ├── routes/
│   │   ├── public.js        ← /api/products, /api/orders, /api/newsletter, /api/contact
│   │   └── admin.js         ← /api/admin/* (login, products CRUD, orders, messages)
│   ├── storage/index.js     ← image-provider interface (local disk implemented; cloudinary/s3 reserved)
│   ├── migrations/          ← plain SQL schema
│   └── scripts/             ← migrate / seed / hash-password / gen-secret
│
├── clients/                 ← per-client config (brand, theme, products fallback)
│                              — at the root because BOTH sides read it:
│                              frontend for theming/fallback, backend for seeding
├── vite.config.js           ← frontend build config (root: 'frontend') + dev proxy
├── .env.example             ← every backend setting, commented (copy to .env)
├── package.json             ← one package for both; scripts below
└── README.md                ← API reference table + feature docs
```

Frontend and backend are separate **folders** that share one `package.json` —
one `npm install` covers both. To hand someone "just the backend", give them
`backend/` + `package.json` + `.env.example`; "just the frontend" is `frontend/`
+ `clients/` + `vite.config.js`.

They can deploy as **two services** (split-host, §2 Mode C) **or as one
container** — the recommended VPS/Coolify path, where this same backend also
serves the built `frontend/dist` (one origin, no CORS). See
[DEPLOY_VPS.md](DEPLOY_VPS.md).

When multiple sites get combined later, each repo's `frontend/`/`backend/`
pair stays a self-contained unit — the folders lift out as-is.

### What changed when the backend was added

| Area | Before | Now |
|---|---|---|
| Products | hardcoded in `clients/<name>/config.js` | from Postgres via `/api/products`; **config is the automatic fallback** |
| Checkout | WhatsApp link only | order recorded server-side (customer form, stock check) **then** WhatsApp opens with "Order #N" prepended; if no backend → old WhatsApp-only flow |
| Stock | a manual `soldOut: true` flag | per-size stock counts; "sold out" is derived (all sizes at 0) |
| Newsletter / contact forms | showed success, stored nothing | stored in the database (still show success if backend is down) |
| Admin | none | `/admin` panel: products, stock, orders, messages (not linked anywhere public) |
| Everything else (theme, pages, drops, categories, Instagram) | config | **unchanged — still config** |

---

## 2. The three deployment modes

These modes are about **how much backend is wired up** (none / no-DB / full
stack), independent of *where* you host. For the recommended hosting of the full
stack — one container per site on a VPS + Coolify — follow
[DEPLOY_VPS.md](DEPLOY_VPS.md). The Vercel/Render/Neon steps in Mode C below are
one **split-host alternative**, kept for reference.

### Mode A — No backend at all (what you can ship TODAY)

Deploy only the frontend (Vercel/Netlify/any static host):

```bash
npm install
npm run build        # → frontend/dist/
```

The site is fully functional: products from config, cart, WhatsApp checkout.
This is not a broken state — it is a supported mode. No env vars needed.

### Mode B — Backend without a database (degraded, honest)

Run `node backend/index.js` anywhere Node runs. With an empty `.env` it boots,
answers `/api/health` with `{ ok: true, db: false }`, and every data route
returns `503 { "error": "Database not configured" }`. The frontend sees the
503 and behaves exactly like Mode A. There is no reason to deploy this mode on
purpose — it exists so a half-configured deploy degrades safely instead of
crashing.

### Mode C — Full stack (database connected)

**C1. Get a Postgres.** Any of: Neon / Supabase (free tiers, dashboard gives
you a connection string), Railway, RDS, or your own server. Nothing in the
code cares which.

**C2. Configure secrets** (locally first):

```bash
cp .env.example .env
npm run gen-secret                           # → paste as JWT_SECRET
npm run hash-password -- "chosen admin password"  # → paste as ADMIN_PASSWORD_HASH
# paste the Postgres connection string as DATABASE_URL
# managed hosts: keep DATABASE_SSL=auto (or set require)
```

**C3. Create schema + initial products:**

```bash
npm run db:migrate    # creates tables (safe to re-run)
npm run db:seed       # products from clients/demo/config.js, stock 10/size
                      # (safe to re-run: no duplicates, keeps stock you edited)
```

**C4. Deploy the backend** (example: Render free tier; Railway/Fly identical
in spirit):

- New Web Service from this repo. Build: `npm install`. Start: `node backend/index.js`.
- Environment variables: `DATABASE_URL`, `DATABASE_SSL=require`, `JWT_SECRET`,
  `ADMIN_PASSWORD_HASH`, and `CORS_ORIGIN=https://<your-frontend-domain>`.
- Note the service URL, e.g. `https://mystore-api.onrender.com`.

**C5. Deploy the frontend** (example: Vercel):

- Build command `npm run build`, output directory `frontend/dist`.
- One env var: `VITE_API_URL=https://mystore-api.onrender.com` — this is the
  **only** frontend setting that exists for the backend. (In dev you don't set
  it; the Vite proxy handles it.)

**C6. Run the trust checklist below.**

---

## 3. Trust checklist — verify it does what it says

Run these after any deploy. Replace `$API` with your backend URL — on the
single-container VPS deploy that's simply your site's own origin, e.g.
`https://yoursite.com`.

1. **Backend is alive and sees the DB:**
   `curl $API/api/health` → must be `{"ok":true,"db":true}`.
   If `db:false` → DATABASE_URL missing/wrong on the host; the site still
   works but records nothing (Mode B).
2. **Products come from the database:** `curl $API/api/products` → JSON array
   with `variants` and stock numbers. Edit a stock number in `/admin`, refresh
   the storefront — the change must appear.
3. **Orders are real and transactional:** place a test order via the site's
   cart form. Then check: (a) success screen shows an order number,
   (b) WhatsApp opened with "Order #N —" in the message, (c) the order is in
   `/admin` → Orders, (d) the ordered sizes' stock dropped by the quantity.
4. **Overselling is impossible:** in `/admin` set some size's stock to 1, try
   to order 2 of it → the site must refuse with "only 1 left", offer to adjust
   the cart, and **nothing** gets decremented.
5. **Sold-out is derived:** zero every size of one product → storefront grid
   shows "Out of stock", product page shows "Notify When Available".
6. **Admin is locked:** wrong password → rejected. `curl $API/api/admin/orders`
   without a token → `{"error":"Unauthorized"}` (401). Tokens expire after 24h.
7. **Failure is safe:** stop/suspend the backend service → the storefront must
   still render (config products) and checkout via WhatsApp. No white screen.
8. **Newsletter dedupe:** submit the same email twice → one row in
   /admin → Messages → Subscribers.

If all eight pass, the deployed system is doing exactly what this repo claims.

---

## 4. Changing providers later (the promise this repo makes)

- **Different Postgres host** → change `DATABASE_URL` (and maybe
  `DATABASE_SSL`) in the backend's env. Re-run migrate+seed if it's a fresh
  database. No code changes.
- **Image storage** → `STORAGE_PROVIDER=local` (files on disk) is implemented and
  is what the VPS/Coolify deploy uses, with a persistent volume; pasted image
  URLs also work. Cloudinary/S3 adapters plug into `backend/storage/index.js`
  later via the same switch. See [DEPLOY_VPS.md](DEPLOY_VPS.md).
- **Different frontend host** → update `CORS_ORIGIN` on the backend and
  `VITE_API_URL` on the frontend. That's the entire coupling between them.

## 5. Known limits (on purpose — read before going live)

- No payments: checkout records the order and hands off to WhatsApp.
- **No rate limiting** — the real deploy-time TODO. It's not only about heavy
  traffic: `POST /api/orders` decrements stock with no payment, so an unthrottled
  script can zero the whole catalogue. See [SECURITY.md](SECURITY.md) §S3.
  (CSRF is *not* a gap here — admin auth is a Bearer token, not a cookie; see
  [SECURITY.md](SECURITY.md) §3.)
- Security hardening as a whole — HTTPS, VPS firewall, headers — has its own
  register and pre-launch checklist in [SECURITY.md](SECURITY.md). **Read it
  before a real client's orders live behind a deploy.**
- No email sending, no customer accounts.
- Image uploads (`STORAGE_PROVIDER=local`) are files on the server's disk in
  `backend/uploads/`. On hosts with **ephemeral filesystems** (Render free
  tier, Railway, Fly without a volume) they are LOST on every redeploy —
  attach a persistent volume at `backend/uploads`, or don't offer uploads
  there. Back the folder up like you back up the database. (The recommended
  VPS/Coolify deploy mounts exactly such a volume — see
  [DEPLOY_VPS.md](DEPLOY_VPS.md).)
- Deleting an image URL from a product does **not** delete the file — orphaned
  uploads accumulate on disk (harmless; a cleanup script can come later).
- One admin user (one password). Rotate by re-running `hash-password` and
  updating the env var. **If you're rotating because the password may have
  leaked, rotate `JWT_SECRET` too** (`npm run gen-secret`) — tokens already
  issued stay valid for their full 24h otherwise. See [SECURITY.md](SECURITY.md) §S5.

# Config Manual — what `config.js` controls, piece by piece

The whole identity of a storefront lives in **one file**:
`clients/<name>/config.js`. The React code in `frontend/src/` is shared
machinery that reads this file (through the `@client` alias — Vite points it
at `clients/$CLIENT/`, default `demo`) and never gets edited per client.
Change the config → the site changes. That's the entire model.

This manual maps every export of the config to the exact place it shows up
on screen, from the top of the page to the footer.

---

## 1. The page, top to bottom

```
┌─────────────────────────────────────────────────────┐
│ ticker (BRAND.announcement)                         │ ← black band, scrolling line
├─────────────────────────────────────────────────────┤
│ ☰  Home | All products | <CATEGORIES> | Drops | Gift card   LOGO   🔍 👤 🛒 │
├─────────────────────────────────────────────────────┤
│ HOME: hero image (DROPS[0].heroImg)                 │
│ accent band (DROPS[0].label + sub)                  │
│ one photo band per CATEGORIES entry                 │
│ Instagram grid (IG_POSTS)                           │
├─────────────────────────────────────────────────────┤
│ FOOTER: 5 columns (see section 3)                   │
└─────────────────────────────────────────────────────┘
```

## 2. The options on top (header nav) — where each link comes from

| Nav item | Comes from | Can you remove it? |
|---|---|---|
| **Home** | hard-coded | no (it's the logo's job too) |
| **All products** | hard-coded | no |
| **Blankets / Tops / …** | one link per entry in `CATEGORIES` — the `label` is the text, the `id` is the URL (`/shop/<id>`) | yes — delete the entry |
| **Drops** (+ hover submenu) | shows only if `FEATURES.drops: true` **and** `DROPS` isn't empty; submenu lists every drop's `label` | yes — `FEATURES.drops: false` |
| **Gift card** | shows only if `FEATURES.giftCard` is an array of amounts (e.g. `[50, 100, 200]`); `false` hides it | yes — `FEATURES.giftCard: false` |
| **Center logo text** | `BRAND.name` | it's the brand — rename, don't remove |
| 🔍 search icon | `FEATURES.search` | yes |
| 🛒 cart icon | `FEATURES.cart` | yes |

The mobile burger menu (☰) builds itself from the same sources — you never
configure it separately.

**So when you changed the demo nav to Blankets / Bags / Wearable Art, the
only thing edited was the `CATEGORIES` array plus `FEATURES.drops: false`.**

## 3. The footer — column by column

| Column | Contents | Config source |
|---|---|---|
| 1 — brand | big wordmark, one-liner, Instagram/TikTok links | `BRAND.name`, `BRAND.footerLine`, `BRAND.igUrl` / `BRAND.tiktokUrl` (blank = link hidden) |
| 2 — Shop | All products + one link per category + Gift card | `CATEGORIES`, `FEATURES.giftCard` |
| 3 — Help | Size guide, Shipping & Returns, Store policy, Contact us | `SIZE_GUIDE.enabled`; the middle two appear only if `PAGES` has a `shipping-returns` / `store-policy` entry |
| 4 — Brand | About, Drops, Privacy policy | `PAGES.about`, `FEATURES.drops`, `PAGES['privacy-policy']` |
| 5 — newsletter | email signup box | `FEATURES.newsletter` |

Rule of thumb: **delete a `PAGES` entry and its footer link disappears with
it** — no orphan links, nothing else to update.

## 4. Every export, everywhere it appears

### `BRAND` — identity & contact
| Field | Where it shows up |
|---|---|
| `name` | header logo, footer wordmark, browser tab titles, admin header, cart's localStorage namespace (renaming resets visitors' carts!) |
| `announcement` | the scrolling ticker band at the very top; blank = no ticker |
| `footerLine` | under the footer wordmark + the homepage SEO description |
| `igUrl`, `tiktokUrl` | footer social links (blank hides each) |
| `handle` | headline of the Instagram section ("Follow us @handle") |
| `whatsapp` | the WhatsApp checkout handoff + contact page (digits only, international: `9725…`) |
| `email`, `address` | contact page |
| `currency` | the symbol before every price, sitewide (₪ / $ / €) |
| `freeShipOver` | the "free shipping over X" progress bar in the cart; `0` hides it |
| `domain` | informational only — nothing reads it |

### `THEME` — the look
Five colors (`band`/`paper`/`ink`/`inkOnBand`/`accent` + `muted`/`focus`),
three font names (Google Fonts, auto-loaded), two radii, an 11-step type
scale, two motion durations. Every color and font on the site comes from
here — `frontend/src` contains zero hard-coded colors. Swap 5 hex values +
2 fonts and it's a different studio's site.

### `CATEGORIES` — nav + shop filters + home bands
Each `{ id, label, img }` is simultaneously: a header nav link, a footer
Shop link, a filter tab on the shop page, and a full-width photo band on the
homepage (`img: ''` renders the tinted "YOUR PHOTO" placeholder). Products
point at a category via their `cat` field — keep the `id`s in sync.

### `DROPS` — collections / lookbooks
`DROPS[0]` is special: its `heroImg` is the homepage hero and its
`label`/`sub` fill the accent band under it — **even when `FEATURES.drops`
is off** (the hero still needs a picture). With drops on, every entry gets a
page at `/drops/<id>` with its `photos[]` as a lookbook.

### `PRODUCTS` — placeholder products (until the database takes over)
The important subtlety: **once a database is connected and seeded, the
storefront serves products from the database and this array is ignored.**
It's the no-database fallback and the raw material `npm run db:seed` loads
into the DB. After that, products are edited in `/admin`, not here.
Fields: `id, name, price` (shekels), `cat` (a CATEGORIES id), `drop` (a
DROPS id), `sizes[]`, `sizeLabel`, `family` (groups "Complete the set" on
product pages), `cut`, `soldOut`, `desc`, `imgs[]`.

### `PAGES` — text pages
Each key becomes a page at `/p/<slug>` (title + paragraphs) and, where a
footer slot exists for that slug, a footer link. Two slugs are double-duty:
`product-care` and `shipping-returns` also fill the accordion sections on
every product page.

### `SIZE_GUIDE` — real HTML tables at `/size-guide`; `enabled: false`
hides the page and its footer link.

### `IG_POSTS` — the static Instagram grid on the homepage (12 tiles:
image + caption + link). No Instagram API — you curate it here.

### `FEATURES` — on/off switches
`cart`, `cartDrawer`, `checkout` (false = WhatsApp handoff), `search`,
`giftCard` (array of amounts = the buying options on `/gift-card`),
`drops`, `instagram`, `newsletter`, `accounts`, `wishlist`,
`notifyWhenAvailable`, `stickyHeader`. A feature that's off removes its
nav/footer links AND redirects its routes to `/` — no dead pages.

### `KEYS` — future integration slots (payment provider, newsletter
endpoint, `analyticsId`, `metaPixelId`). Nothing reads them until a value
is set; this is where Google Analytics will plug in later.

## 5. What the config does NOT control

- **Products, stock, orders — once a DB is live.** Those belong to the
  database and the `/admin` panel. Config `PRODUCTS` is only the fallback/seed.
- **Layout and behavior.** Page structure, cart logic, checkout flow live in
  `frontend/src/` and are the same for every client. If a client's request
  can't be satisfied by config, it's a backbone change (or a custom quote).

## 6. Quick recipes

| Want | Edit |
|---|---|
| Rename the shop | `BRAND.name` (before launch — resets carts) |
| Change nav categories | `CATEGORIES` (+ update products' `cat`) |
| Kill the Drops menu | `FEATURES.drops: false` (keep `DROPS[0]` for the hero) |
| Different colors/fonts | `THEME` — 5 hexes + 2 font names |
| New text page in footer | add a key to `PAGES` |
| Hide gift cards | `FEATURES.giftCard: false` |
| Change the ticker line | `BRAND.announcement` (empty = no ticker) |
| New homepage hero | `DROPS[0].heroImg` |

# Client Manual — setting up a new storefront

The practical, start-to-finish playbook for turning this backbone into a new
client's site. The rule that makes this repo work: **everything client-specific
lives in `clients/<name>/`; `frontend/src/` is never touched.** If you catch
yourself editing `frontend/src/` for one client, stop — either it belongs in
config, or it's a
backbone improvement that every client should get.

---

## 0. What you need from the client before you start

Collect this in one call/questionnaire — it's everything the config needs:

**Brand basics**
- Brand name (exactly as it should appear in the logo spot)
- Instagram handle + URL, TikTok URL (optional)
- WhatsApp number (international format, digits only — `9725XXXXXXXX`)
- Contact email, physical address (if they want it shown)
- One announcement line (the bar at the very top), or none
- One footer tagline
- Currency symbol; free-shipping threshold if they offer it

**Look**
- 5 colors: band (header/footer), page background, text, text-on-band, accent.
  If they have no palette, start from black/white + one accent and iterate.
- 2 fonts from Google Fonts (display + body). Caps-only display fonts
  (Bebas Neue, Anton, Oswald caps…) give the "reference" look; mixed-case
  fonts work too — the system never forces uppercase.

**Catalog**
- Product list: name, price, category, sizes, which are sold out
- Which products belong to a "family" (same print, different cuts — this
  powers "Complete the set" on product pages)
- 2 photos per product minimum (front + alternate; the second one is the
  hover image)
- Category names + one photo each (these become the Home page bands)

**Content**
- Collections/drops: name, tagline, 2–4 lookbook photos each
- About text, shipping & returns text, store policy, privacy policy,
  product-care blurb
- Size tables (e.g. tops: Size|Bust; bottoms: Size|Hips|Waist)
- 6–12 Instagram posts (image + caption + link) for the home grid

Missing photos are fine to start — every blank image renders a tinted
"YOUR PHOTO" placeholder, so you can demo the full site before assets arrive.

---

## 1. Fork and create the client folder

```bash
# from the repo root
cp -r clients/_template clients/acme        # pick a short lowercase name
```

`clients/acme/config.js` is a fully commented blank schema — every field has
an explanation next to it. Fill it top to bottom:

1. `BRAND` — identity, contact, announcement, currency
2. `THEME` — colors, fonts, radii (leave `scale` and `motion` alone unless
   the client's type genuinely needs a different ramp)
3. `CATEGORIES` — id, label, band photo
4. `DROPS` — first entry = current drop; its `heroImg` is the Home hero
5. `PRODUCTS` — see §3 below
6. `PAGES` — about / shipping-returns / store-policy / privacy-policy /
   product-care (the last two slugs also feed PDP accordions)
7. `SIZE_GUIDE`, `IG_POSTS`, `FEATURES`, `KEYS`

Run it:

```bash
# macOS / Linux
CLIENT=acme npm run dev

# Windows PowerShell
$env:CLIENT='acme'; npm run dev
```

Open the browser console — dev mode validates the config on boot and warns
about duplicate ids, products pointing at missing categories/drops,
one-product families, and size-table ranges that don't ascend. Fix every
warning before showing the client anything.

## 2. Photos

Drop files into `clients/acme/assets/` and reference them from config:

```js
img: new URL('./assets/tops-band.jpg', import.meta.url).href,
```

Guidelines that keep the design working:
- **Product images: square (1:1).** The grid and PDP crop to square anyway.
- Provide `imgs: [front, alternate]` — the alternate is what cross-fades in
  on hover. With only one photo, pass it twice or leave index 1 out (the
  first is reused).
- Home/category/drop bands are full-bleed landscape — 1600px+ wide, subject
  centered (edges crop on mobile).
- Keep files under ~400 KB each (export at quality 80). Performance budget
  is Lighthouse mobile ≥ 90 and big JPEGs are the usual killer.

## 3. Products — the fields that matter

```js
{
  id: 'wild-flower-tie-bottom',   // unique, kebab-case, never reuse
  name: 'WILD FLOWER TIE BOTTOM', // displayed exactly as typed
  price: 220,
  cat: 'bottoms',                 // must match a CATEGORIES id
  drop: 'heatwave',               // must match a DROPS id
  sizes: ['XS', 'S', 'M', 'L'],
  sizeLabel: 'Bottom Size',       // dropdown label; omit -> "Size"
  family: 'wild-flower',          // same print, other cuts -> "Complete the set"
  cut: 'Tie Bottom',
  soldOut: false,                 // true -> "Out of stock" card + Notify PDP
  desc: '',                       // optional; PDP hides the block if empty
  imgs: ['...', '...'],
}
```

- **Families**: give every cut of one print the same `family` string. A
  family needs ≥ 2 members to do anything (the validator warns otherwise).
  Products without a family get a generic "You may also like" strip instead.
- **Sold out**: just flip `soldOut: true`. Card loses its price, PDP swaps
  both buy buttons for "Notify When Available". Flip back when restocked.
- Accessories/one-size items: `sizes: ['One size']`.

## 4. Features — turning things on and off

All in `FEATURES` (see the table in [../../README.md](../../README.md), and
field-by-field in [CONFIG_MANUAL.md](CONFIG_MANUAL.md)). The ones you'll
actually toggle per client:

| Client says | You set |
|---|---|
| "No gift cards" | `giftCard: false` (page redirects home, links vanish) |
| "Gift cards at 50/100/200" | `giftCard: [50, 100, 200]` |
| "No collections/drops" | `drops: false` |
| "The popup on add-to-cart annoys me" | `cartDrawer: false` (falls back to a toast) |
| "I want the header to scroll away like my old site" | `stickyHeader: false` |
| "Orders come to my WhatsApp" | already the default (`checkout: false`) — the checkout button opens wa.me with the cart prefilled |

`KEYS` stays blank. It exists so a future payment/newsletter integration has
a home — nothing reads it today.

## 5. Making it look like *their* site, not the demo

The identity test: five hex values + two font names should make two clients
look like different studios built them. Work in this order:

1. **Colors first.** Change `band`, `paper`, `ink`, `inkOnBand`, `accent` and
   reload. The whole site follows — there are no other places color lives.
2. **Fonts second.** `displayFont` sets the entire voice (headings, nav,
   prices, buttons). Test a PDP and the cart after switching — long product
   names are where fonts break.
3. **Radii.** `commerceRadius: '20px'` = pill buy buttons (reference look);
   `'0px'` = brutalist. `radius` rounds everything else — use sparingly.
4. Only touch `scale` if the client's display font runs visually big/small
   at the same px sizes.

Do NOT: add per-client CSS, add a second accent color, or add motion. The
restraint (one hover effect, two 0.2s transitions, nothing else) is the
design system.

## 6. QA before you show the client

Five minutes, every time, in this order:

1. Console clean on boot (no config warnings, no errors).
2. Phone width (DevTools 380px): no horizontal scroll anywhere, hamburger
   opens/closes, grid is single column.
3. Add two different sizes of one product → drawer opens → View Cart →
   quantities/subtotal right → refresh → still there → "Order on WhatsApp"
   opens with a readable order.
4. Open a sold-out product → Notify flow works.
5. Tab through Home with the keyboard — blue double ring visible on
   everything you land on.

Before delivery, also run a production build and Lighthouse (mobile) on
Home, /shop and one PDP — keep performance and accessibility ≥ 90:

```bash
npm run build && npx vite preview
```

## 7. Delivering and maintaining

- Each client = a fork of this repo with their `clients/<name>/` filled in.
  Keep `_template` and `demo` in the fork — they cost nothing and let you
  A/B against the baseline.
- Client wants a product added/price changed/something sold out? Without a
  database that's a one-line config edit. With a database connected, the
  client does it themselves at `/admin` → Products: every field is editable
  (name, price, sizes, stock, description, images), **pictures upload with
  the "Upload images" file button** (or paste URLs), and **dragging the `⠿`
  handle reorders products** — the storefront shows them in that order.
  Hand them [STORE_OWNER_MANUAL.md](STORE_OWNER_MANUAL.md) at delivery: it's
  the non-technical walkthrough of that panel. Fill in its details table
  (shop URL, admin URL, their category and drop ids) before you send it.
- Backbone bug or improvement? Fix it in the main repo, then port the
  `frontend/src/` diff into client forks. Because clients never modify
  `frontend/src/`, the diff always applies cleanly.
- Cart data lives in the shopper's browser (localStorage, namespaced by
  brand name) — renaming `BRAND.name` resets visitors' carts; do it before
  launch, not after.

## 8. What this backbone deliberately does NOT do

Set expectations in the sales call: no payments (WhatsApp handoff instead),
no accounts, no email sending, no multi-language (yet — content blocks are
structured so it can be added without a rebuild). The admin panel at `/admin`
covers products/orders/messages once a database is connected; without one,
the config file is the CMS. If a client needs more than that, it's a custom
quote on top, not a config tweak.

# BUILD SPEC — Multi-client storefront backbone (FINAL, self-contained)
### Grounded in SITE_AUDIT.md (headless-Chrome audit of saltyhairswimwear.com, 2026-07-24)

This file supersedes BUILD_SPEC.md and BUILD_SPEC_v2.md — delete both if present. It has
no external references except SITE_AUDIT.md, which sits next to it and is the measured
ground truth for the reference site. Where this spec and the audit disagree, this spec
wins — the disagreements are deliberate (see §3).

Build a React + Vite storefront template that I fork per client. One codebase, many
client configs. Localhost only. Read this file and SITE_AUDIT.md fully before writing
code. Build in one pass, then verify against §12.

---

## 1. Goal

I sell websites to small Instagram-based brands (jewelry, swimwear, accessories) who
don't want to touch code. Each client gets a fork of this repo with one config folder
filled in. The `src/` machinery is never edited per client — if a client's needs require
editing `src/`, the architecture has failed.

Critical property: **five hex values and two font names in a config file must make two
client sites look like different studios built them.** Everything visual flows from theme
tokens. No hardcoded colors or font names anywhere in `src/`.

## 2. Constraints

- **Localhost only.** No server, no database, no payments, no third-party API calls.
  `npm run dev` is the entire runtime.
- **English only.** No i18n layer, no RTL. (PAGES body stays an array of blocks so a
  second language can be added later without a refactor — but build nothing for it now.)
- **react-router-dom** for real URLs.
- **No CMS, no admin UI.** Products live in the config file. Deliberate.
- Plain CSS via a generated stylesheet. No Tailwind, no CSS-in-JS library, no UI kit.
- No TypeScript. Plain JSX.
- Dependencies: `react`, `react-dom`, `react-router-dom`, `vite` only, unless you justify
  an addition in the README.

## 3. What the reference site is, and our stance on it

From the audit: a deliberately minimal Wix store. Static black announcement bar,
non-sticky black header, full-bleed photo bands, 5-column product grid, and exactly ONE
real hover effect on the entire site (product-card image cross-fade, 0.2s). No marquee,
no scroll animation, no nav hover states, no cart drawer (cart is a page), and NO mobile
layout — a fixed ~1127px canvas that crops at 380px, with no hamburger menu.

Identity to keep: caps-only display type, black-on-white, one accent green, pill-shaped
(20px radius) commerce buttons, square everything else, near-zero motion.

**REPRODUCE** (the identity — details in §7–§9):
- The restraint. One hover effect. No decorative motion.
- Static announcement bar (37px, band color, display font ~17px). NOT a marquee.
- Header as a single band with the announcement bar: nav left, centered logotype,
  icons right, ~122px total.
- Full-bleed photo bands on Home (800–1000px tall, zero gap) alternating with content;
  no single max-width wrapper — full-bleed bands + a 1400px grid container.
- Product card: 1:1 image, two stacked images with 0.2s opacity cross-fade on hover,
  centered name, thin divider, centered price; sold-out shows "Out of stock" (no price).
- Category page: centered h1, 5-col grid (22px gap) desktop, "Load More" pagination
  (12/page), outline square button.
- PDP: gallery left (main + ≤4 thumbnails), ~355px details column right; size DROPDOWN
  (not buttons); Add To Cart + Buy Now; accordions Product Care · Shipping & Returns ·
  Size Guide; no breadcrumbs.
- Sold-out PDP: "Notify When Available" replaces BOTH buttons.
- Drops as LOOKBOOKS (photo bands), not product grids.
- Content pages: photo hero + huge white display h1 (60–100px scale).
- Blur-up image loading. Visible double-ring focus states. 0.2s ease-in-out button recolor.

**FIX** (broken/missing on the reference — our selling points):
- MOBILE, priority #1. Real responsive layout: bands stack/scale, grid 5→2→1, hamburger
  menu, tap targets ≥44px, zero horizontal scroll at 380px.
- Sticky header (flag-off-able).
- Keep cart-as-page as the canonical surface (/cart) but add a lightweight drawer on
  add-to-cart with "View Cart"/"Checkout" links (flag-off-able) — silent add is a
  conversion hole.
- Subtle nav/footer link hover (opacity or underline, 0.2s). Quiet.
- Semantic HTML: proper h1→h3 hierarchy (the reference inverts h6/h4 on policy pages),
  real <table> for size guides, every CTA labeled (the reference ships tiles labeled
  "Button").
- Per-route <title> and meta description from config.
- Product families: optional `family` key → "Complete the set" section on the PDP linking
  sibling cuts of the same print. Replaces generic related products when present.

**SKIP** (Wix artifacts): accessibility-widget spinner, cookie-banner styling, unused
wishlist buttons (omit unless FEATURES.wishlist), empty ribbon containers, the iframe
gift-card widget (ours is native, §8), browser-default-blue cart count, Arial fallback text.

## 4. Repo structure

```
storefront-backbone/
├── package.json
├── vite.config.js
├── index.html
├── README.md
├── BUILD_SPEC.md            # this file
├── SITE_AUDIT.md
├── clients/
│   ├── _template/
│   │   ├── config.js        # blank schema, fully commented
│   │   └── assets/.gitkeep
│   └── demo/
│       ├── config.js        # fully populated: ~10 products incl. families & sold-out,
│       │                    # 3 drops with lookbook photos, 2 size tables
│       └── assets/.gitkeep
└── src/
    ├── main.jsx
    ├── App.jsx              # router + layout shell
    ├── theme.js             # THEME tokens -> CSS vars + Google Fonts loader
    ├── styles.js            # stylesheet as a template string
    ├── cart.js              # cart state hook + localStorage persistence
    ├── seo.js               # per-route title/meta
    ├── placeholder.js       # SVG data-URI generator for empty image slots
    ├── components/          # Ticker, Header, MobileMenu, SearchOverlay, ProductGrid,
    │                        # ProductCard, CartDrawer, Newsletter, InstagramGrid,
    │                        # Footer, Toast, Accordion, QuantityStepper
    └── pages/               # Home, Shop, Product, Drops, DropPage, Cart, GiftCard,
                             # SizeGuide, Contact, Doc, NotFound
```

## 5. Client resolution

`vite.config.js` aliases `@client` to the active client folder:

```js
resolve: {
  alias: {
    '@client': path.resolve(__dirname, `clients/${process.env.CLIENT || 'demo'}`)
  }
}
```

`src/` imports config ONLY as `import { ... } from '@client/config'`. Default client is
`demo` so `npm run dev` works with zero setup. Scripts: `dev`, `build`, plus
`dev:client`/`build:client` reading `CLIENT`. Note the Windows env-var caveat in the
README (PowerShell syntax / cross-env), but don't add cross-env as a dependency.

Client photos live in `clients/<name>/assets/` referenced by relative path from config;
confirm Vite resolves them through the alias and fix the convention if not.

**Config validation on boot (dev only):** console-warn on duplicate product ids, products
referencing a missing category/drop/family, empty required BRAND fields, and size-guide
rows whose ranges aren't ascending. Warn, never throw — a half-filled config must render.

## 6. Config schema

Each `clients/<name>/config.js` exports exactly these named exports:

```
BRAND       name, domain, handle, igUrl, tiktokUrl, whatsapp, email, address,
            announcement, footerLine, currency, freeShipOver (0 hides ship bar)
THEME       see §9
CATEGORIES  [{ id, label, img }]
DROPS       [{ id, label, sub, note, heroImg, photos[], shopNowHref? }]
            — index 0 is the current drop; photos[] are the lookbook bands
PRODUCTS    [{ id, name, price, cat, drop, sizes[], sizeLabel?, family?, cut?,
               soldOut?, desc?, imgs[] }]
            — sizeLabel falls back to "Size"; name may be composed from family+cut
              or given whole; desc is optional and the PDP omits the section without it
PAGES       { slug: { title, body[] } } — omitting a slug removes it from the footer
SIZE_GUIDE  { enabled, tables: [{ title, cols[], rows[][] }] }
IG_POSTS    [{ img, caption, url }]
FEATURES    cart, cartDrawer, checkout, search, giftCard, drops, instagram,
            newsletter, accounts, wishlist, notifyWhenAvailable, stickyHeader
KEYS        paymentProvider, publicKey, newsletterEndpoint, analyticsId, metaPixelId
            — all blank for now; KEYS drives nothing until a value is set
```

## 7. Routes

```
/                       Home
/shop                   all products
/shop/:categoryId       filtered
/product/:id            product detail
/drops                  drop tile index
/drops/:dropId          lookbook page
/cart                   cart page
/gift-card              gift card
/size-guide             size tables
/contact                contact form
/p/:slug                content page from PAGES
*                       NotFound
```

Scroll to top on navigation. Feature-flagged routes redirect to `/` when off, and their
nav/footer links don't render.

## 8. Behavior spec

**Ticker** — static single line of `BRAND.announcement`, 37px band. No animation.

**Header** — one band with the ticker (band color from THEME): nav left (Home, All
products, categories, Drops with hover dropdown of all drops, Gift card), centered
logotype, right: search icon, account icon (toast "Accounts coming soon" unless
FEATURES.accounts), bag icon linking to /cart with a styled live count badge. Sticky when
FEATURES.stickyHeader (default true). Under 900px: hamburger → full-width menu listing
nav + About + Contact. Active route underlined in accent.

**Search** — icon opens an inline input under the header; live filter on name, category,
description, family; results in the standard grid with a count; Escape closes.

**Home** — full-bleed hero band (DROPS[0].heroImg, display headline, CTA to /shop) →
alternating full-bleed category photo bands (one per CATEGORIES entry, whole band is the
link) → an accent band using accentFont (see §9) with a short display headline from
config → Instagram section → footer. Bands stack with zero gap.

**Shop** — centered h1 (category label or "All products"), 5-col grid desktop / 2-col
tablet / 1-col mobile (in-flow, never overflowing), 22px gap, Load More revealing 12 at a
time. No sort/filter controls (the reference has none; keep it clean).

**ProductCard** — 1:1 image area with two stacked images, second cross-fades in on hover
(opacity, 0.2s ease); centered name; thin divider; centered price; sold-out shows
"Out of stock" instead of price. No badges, no quick-view, no wishlist (unless flag).

**Product (PDP)** — left: main image + up to 4 thumbnails (click swaps, no zoom, no
hover effect on main image); right column: title → price + small "Price" microlabel →
size dropdown (label `${sizeLabel}*`, placeholder "Select") → quantity stepper
(decrement disabled at 1, greyed) → Add To Cart (pill) → Buy Now (pill; adds to cart
and routes to /cart) → accordions: Product Care, Shipping & Returns (links to
/p/shipping-returns), Size Guide (links to /size-guide). Add To Cart disabled reading
"Select a size" until a size is chosen. If `family` is set: "Complete the set" strip of
sibling products below; otherwise a 4-product strip from the same category.
Sold-out PDP: "Out of stock" status line; ONE pill button "Notify When Available"
replacing both CTAs (when FEATURES.notifyWhenAvailable) — opens an inline email field,
validates, confirms with a toast; stores nothing.

**Cart page (/cart)** — canonical cart surface. Line items (image, name, size, qty
stepper, line total, remove), subtotal, free-shipping progress bar when freeShipOver > 0,
checkout button. Empty state: "My cart" / "Cart is empty" / "Continue Browsing" link.
Cart state: keyed by productId+size (same pair increments), persisted to localStorage
namespaced by client name, restored on load.

**CartDrawer** — when FEATURES.cartDrawer (default true): adding to cart opens a compact
right-side drawer (scrim, Escape/scrim closes, focus trapped and restored) showing line
items + subtotal + "View Cart" and "Checkout" buttons. When false: add-to-cart shows a
toast and the bag badge updates; Buy Now still routes to /cart.

**Checkout button** — FEATURES.checkout is false for now: button reads "Order on
WhatsApp" and opens `https://wa.me/<BRAND.whatsapp>?text=` with cart lines prefilled as
readable text. When true: stub toast. No payment provider integration.

**Drops** — /drops: stacked full-bleed photo tiles, one per drop (heroImg + label),
each linking to its lookbook. /drops/:id: hero band (optional "shop now" link when
shopNowHref) then the drop's photos[] as stacked full-bleed bands. No grids, no prices.

**Gift card** — native page (no iframe): amount picker (4 config-driven presets), adds
to cart as a line item with the amount as its "size".

**Size guide** — photo hero + one semantic <table> per SIZE_GUIDE.tables entry.

**Contact** — photo hero → contact block from BRAND (WhatsApp · Mail · Address) →
"We Want To Hear From You!" heading → fields First Name, Last Name, Email, message
textarea, newsletter checkbox, Submit. Client-side validation; success state replaces
the form. Sends nothing. Use divs with click handlers, not a <form> element.

**Doc pages (/p/:slug)** — photo hero + display h1 + body blocks as paragraphs.

**Newsletter** (site-wide, in footer area) — email input + button; validates; swaps to a
confirmation line. POST to KEYS.newsletterEndpoint only if set; otherwise no-op.

**Instagram** — grid from IG_POSTS (6 visible, "Load more" reveals 6 more), caption
overlay on hover, links out. Static config URLs — no API.

**Footer** — band color: wordmark + footerLine, social links, three columns (Shop:
categories + gift card · Help: size guide, shipping, policy, contact · Brand: about,
drops, privacy) rendering only existing PAGES slugs and enabled features. Newsletter
block lives here. Off-band text color from THEME.

**Toast** — bottom-center, ~2s auto-dismiss.

**Placeholders** — `placeholder.js` returns an inline SVG data URI ("YOUR PHOTO" +
label, tinted from THEME). Any blank img value falls back to it; a fully blank
_template config must render a coherent site.

## 9. Design tokens (THEME)

```
band          announcement/header/footer background   default #000000
paper         page background                          default #ffffff
ink           text on paper                            default #000000
inkOnBand     text on band                             default #fafafa
accent        one accent color                         default #7FB850
muted         secondary text (dropdown placeholder)    default #444444
focus         focus-ring color                         default #116DFF

displayFont   headings/nav/prices    default "Bebas Neue"
bodyFont      paragraphs/forms       default "Jost"
accentFont    one accent band        optional; falls back to displayFont

commerceRadius   pill radius for Add To Cart / Buy Now / Notify   default 20px
radius           everything else                                   default 0

scale         [100, 60, 40, 35, 32, 30, 28, 18, 17, 16, 15]
              (hero-xl, hero-lg, h2/band, logo, category-h1, newsletter,
               pdp-h1, card-name, nav/ticker, card-price, accordion/button)

motion        fade: 0.2s ease (card cross-fade, link hover)
              recolor: 0.2s ease-in-out (buttons)
              — these are the ONLY two transitions in the system. No lifts, no zooms.
```

`theme.js` maps THEME → CSS custom properties on a root wrapper and injects one Google
Fonts link (400/500 body+mono weights, 400/700 display; skip request for blank names,
fall back to system stacks). **CRITICAL (from the audit): the reference's uppercase look
comes from Bebas being a caps-only font — `text-transform` is none everywhere. Set NO
text-transform anywhere. A mixed-case display font in a client theme must render mixed
case and still look designed.**

Nothing in `src/` may contain a literal hex color or font-family name — everything reads
the variables. Blur-up image loading: render a blurred tiny placeholder (CSS filter) that
sharpens when the full asset loads. Focus rings site-wide: double ring
`box-shadow: 0 0 0 1px var(--paper), 0 0 0 3px var(--focus)`.

## 10. Quality bar

Responsive at 380 / 768 / 1280 with zero horizontal scroll. Visible keyboard focus
everywhere; drawer and mobile menu trap and restore focus. `prefers-reduced-motion`
disables the cross-fade (snap swap) and recolor animation. Semantic headings in order,
alt text on product images, aria-labels on icon buttons. No console errors or key
warnings. Watch CSS specificity — no selectors canceling each other (section padding
especially).

## 11. README

Install/run · adding a client in four steps · config schema table · FEATURES flags ·
how theming works · the "never edit src/ for one client" rule · Windows env-var note ·
any dependency you added beyond §2 and why.

## 12. Verify before reporting done

1. `npm i && npm run dev` clean on demo; `CLIENT=_template npm run dev` renders a
   coherent placeholder site with no crashes.
2. Every §7 route loads by direct URL, not just in-app navigation.
3. 380px: NO horizontal scroll on any page; hamburger works; grid 2→1 col; tap targets
   ≥44px.
4. Card hover cross-fades 0.2s; buttons recolor 0.2s; nothing else animates. Grep for
   transition/animation declarations and justify each.
5. Sold-out: grid shows "Out of stock" (no price); PDP shows Notify When Available
   replacing both CTAs, price still visible; Notify validates an email and confirms.
6. A `family` product shows "Complete the set" with its siblings.
7. Cart: add two sizes of one product + another product, refresh — persisted, quantities
   and subtotal correct. Drawer opens on add; FEATURES.cartDrawer=false removes it and
   add-to-cart toasts instead. "Order on WhatsApp" opens wa.me with readable cart lines.
8. Flags off (giftCard, drops, search): links vanish from nav+footer, URLs redirect to /.
9. Tab through every page: double-ring focus visible on all interactive elements.
10. Swap displayFont to a mixed-case font in demo config: nothing breaks, nothing
    uppercases. Grep src/ for `text-transform` — zero results.
11. Grep src/ for hex codes and font names outside theme token plumbing — zero results.
12. Change THEME.accent, band, and displayFont in demo config — whole site changes, no
    src/ edits.
13. Lighthouse mobile ≥90 performance and accessibility on Home, /shop, and a PDP.

Report what you built, deviations and why, and anything in this spec that turned out
wrong.

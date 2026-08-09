# SITE AUDIT — saltyhairswimwear.com

Audited 2026-07-24 with **headless Chrome (Puppeteer)** per `CHROME_AUDIT_PROMPT.md`.
This supersedes the earlier static-fetch audit: every "⛔ not determinable" item from that
pass has now been measured in a real browser. Verbatim static content from the first pass
(full SKU lists, copy) is retained.

Method: every page loaded to network-idle + settle time; values read from
`getComputedStyle`/DOM; hovers dispatched and styles re-read; pixel colors sampled from
screenshots wherever CSS computes `transparent` (a Wix habit). Every page run at **1440px**
and **380px**. Read-only — nothing added to cart, no forms submitted, checkout never opened.

**Two site-wide findings up front:**

1. **The headline font is a caps-only display face.** Headings, nav, product names, footer
   — nearly everything — computes as
   `wfont_1bada7_7d782da2c8b048ba999bb3eb3fb61032, wf_7d782da2c8b048ba999bb3eb3, orig_bebas_regular`
   (i.e. **Bebas**). `text-transform` is `none` everywhere and the DOM text is mixed-case
   ("All Products") — it *renders* uppercase only because Bebas has caps-only glyphs.
   Rebuild with Bebas Neue and do **not** add `text-transform: uppercase`.
2. **There is no mobile layout.** At 380px every page keeps the fixed desktop canvas:
   `document.scrollWidth` = **1127px** vs `innerWidth` = 380px → horizontal overflow/crop
   on every page tested. The header nav is cut off (HOME and ALL PRODUCTS off-canvas
   left), the footer logo is clipped. There is **no hamburger menu** — the only "menu"
   button in the DOM belongs to the accessibility widget. The single thing that reflows
   is the Wix Stores product grid (see §2).

---

# Page-by-page

## 1. `/` — Home

**Layout (top → bottom)**
1. **Announcement bar** — black strip, **37px** tall, white Bebas 17px/700 "new collection
   is too hot". **Static — not a marquee** (text x-position sampled 1.5s apart moved 0px;
   single DOM copy of the string).
2. **Header** (same black band; total height **122px**; `position: relative` — **not
   sticky**, scrolls away, no shrink; computed styles identical before/after an 800px
   scroll): left nav links, centered "SALTY HAIR" logotype (Bebas 35px/700 white), right
   **Log In** (18px/700 white), search icon, bag icon with count "0".
3. **Hero** — full-bleed beach photo (section 1037px tall), overlay heading "All Products"
   (h2 40px white) → links to `/category/all-products`.
4. **White band** — "Heatwave" (h2 40px) + "Summer Starts Now" (h2 18px) in a **second
   font**: `chips-w26-normal`, black, centered.
5. **TOPS** full-bleed photo tile (835px) → `/category/tops`.
6. **BOTTOMS** full-bleed photo tile (835px) → `/category/bottoms`.
7. **Accessories** tile (800px) — white bg with colorful doodle illustration; heading in
   accent green `rgb(127, 184, 80)`.
8. **Instagram section** — "Follow us on Instagram @saltyhair_swim" (h2 28px), embedded
   grid 6 columns × 2 rows, some tiles with play-button video overlay. (First-pass copy
   captured here: "SUMMER SKY // our best seller ☄️", "Yellow is THE color this summer…",
   Tel Aviv pop-up mentions.)
9. **Footer** — black band, off-white text `rgb(250,250,250)`: "SALTY HAIR" (h1 40px) +
   round social icons (Instagram, Facebook, TikTok); center links About Us · Contact Us ·
   SIZE guide · Store policy · Privacy policy · shipping & returns; right "join our
   newsletter for the best sales!" (h1 30px), email input (placeholder "Enter your email
   here…", white bg, black text, `futura-lt-w01-light` 16px, square/underline style) +
   **Join us!** button. (Success copy from first pass: "Thanks for submitting! STAY SALTY".)

**Interaction (measured)**
- Category tiles: `cursor: pointer`; a `transition: all 0.2s ease` is declared on the tile
  links but **no computed property changes on hover** — no zoom, no fade. Cursor is the
  only feedback.
- Nav links / footer links: `cursor: pointer`, **no hover style change** (before/after
  computed styles identical).
- Scroll-triggered animation: **none detected** (positions/transforms identical after
  scroll; the only keyframe animation on the site, `uw_standard 0.75s linear infinite`,
  is the accessibility-widget spinner).
- Focus (Tab): Wix default double ring — `box-shadow: 0 0 0 1px #fff, 0 0 0 3px
  rgb(17,109,255)`; the a11y button gets `outline: 2px solid rgb(0,56,255)` + 4px glow.
  Visible and consistent site-wide.
- Loading: images use Wix **blur-up** — blurred low-res placeholder sharpens when the full
  asset lands (clearly caught mid-load on /drops). `object-fit: cover`, `loading` attr
  mixed `auto`/`eager`. No skeletons.

**380px**: identical section stack and offsets (fixed canvas, cropped); nav starts at
"BOTTOMS"; footer logo clipped to "LTY HAIR"; cookie banner becomes a small floating box.

**Unique to this page**: Instagram feed, category photo tiles, doodle accessories tile,
black footer band (footer strip is black only here — elsewhere it sits on white).

## 2. `/category/all-products`

**Layout**: announcement + header (identical everywhere; not repeated below) → page title
"All Products" (h1 **32px** Bebas black centered) → product grid → **Load More** → footer.
Page background **#ffffff** (pixel-sampled; body computes transparent).

**Grid (computed)**: `display: grid`, **5 columns × 262.4px, gap 22px**, container 1400px
wide. 24 products present after Load More.

**Product card anatomy (DOM order, via `data-hook`)**
1. `product-item-container` (link) → `ProductMediaDataHook.Images` 262×262 with **two
   stacked image wrappers** — `Media_0` visible, `Media_1` at `opacity: 0` (the hover swap).
2. `RibbonAndWishlistFlexContainer` — present but empty, 0-height (no ribbons/badges, no
   card wishlist anywhere on the site).
3. `not-image-container` → name (Bebas **18px**/400 black, centered) → thin divider →
   "Price" microlabel + **₪220.00** (`product-item-price-to-pay`, Bebas **16px**/400 black,
   centered).
4. Sold-out cards drop the price and show "**Out of stock**".

**Products & prices (verbatim, first pass + confirmed live)**
Bottoms: Wild Flower Tie ₪220 · After Glow Regular ₪220 · Summer Sky Regular ₪220 · Pink
Blush Regular ₪220 · Sunclub Tie ₪220 · Picnic Girl Regular ₪220 · Green Bloom Tie ₪220 ·
Sunsquers Regular *Out of stock* · Seabreeze Regular ₪220
Tops: Wild Flower Triangle ₪220 · After Glow Triangle ₪220 · Summer Sky Strapless ₪220 ·
Pink Blush Triangle ₪220 · Sunclub Triangle ₪220 · Green Bloom Triangle ₪220 · Picnic Girl
Triangle *Out of stock* · Seabreeze Long Triangle ₪220
Accessories: Edgy Girl Keychain ₪40 · Happy Girl Keychain *Out of stock* · Lover Girl
Keychain ₪40 · Candy Scrunchie ₪20 · Hot Scruchie ₪20 · Suger Scrunchie ₪20 · Sun
Scruchie ₪20

**Interaction (measured)**
- **Card hover — the site's one real hover effect**: cross-fade to the second product
  photo. `Media_0` wrapper opacity 1→0, `Media_1` 0→1, **transition 0.2s** (ease).
  Pixel-diff confirmed: 76.8% of card pixels change.
- Cursor `pointer` on image/name link (card root computes `auto`). No quick-view or
  add-to-cart appears on hover (DOM inspected mid-hover — nothing is revealed).
- **Load More**: transparent fill, thin black border, square corners, black Bebas 17px;
  `cursor: pointer`; no hover style change measured.
- No sort/filter controls exist on the page (confirmed in rendered DOM, not just static).

**380px**: the Stores grid is the only thing on the site that reflows —
`grid-template-columns` becomes **1 column × 980px** (page grows to ~25,650px tall) and
still overflows the 380px viewport. Everything else identical.

## 3. `/category/bottoms`

**Identical template to all-products** — same section offsets (176/2018…), same 5-col grid,
same Load More + footer. Differences: h1 "Bottoms" (32px) and the filtered set. First-pass
full SKU list (incl. sold-out tail): Wild Flower Tie ₪220 · After Glow Regular ₪220 ·
Summer Sky Regular ₪220 · Pink Blush Regular ₪220 · Sunclub Tie ₪220 · Green Bloom Tie
₪220 · Picnic Girl Regular ₪220 · Picnic Girl Tie *OOS* · Daydream Tie ₪220 · Sun Squers
Tie *OOS* · Seabreeze Regular ₪220 · Daydream Regular ₪220 · Sunsquers Regular *OOS* ·
Fire Heart Regular *OOS* · Tiger Love Regular *OOS* · Tropical Jungle Regular ₪220 ·
Flower Girl Regular *OOS* · Deep Ocean Regular *OOS* · Golden Hour Regular *OOS* · Fire
Heart Tie *OOS* · Tiger Love Tie *OOS* · Tropical Jungle Tie *OOS* · Flower Girl Tie ₪220 ·
Golden Hour Tie ₪220

**Answer to the prompt's question: yes — same layout template; only title + product list
differ.**

## 4. `/product-page/summer-sky-regular-bottom`

**Layout**: product section (starts 245px from top, 819px tall): **left** media gallery —
main image + **4 thumbnails**; **right** details column (355px wide):
1. h1 "SUMMER SKY REGULAR BOTTOM" — Bebas **28px**/400 black, left-aligned
2. **₪220.00** (`formatted-primary-price`, Bebas 14px) + "Price" microlabel
3. "**Bottom Size\***" dropdown — white fill, square, 14px, text "Select" `rgb(68,68,68)`
4. "**Quantity\***" — number input (aria "Quantity") with Increment/Decrement steppers
   (decrement disabled at 1: `rgba(199,199,199,0.5)`)
5. **Add To Cart** — black `rgb(0,0,0)` fill, white text, **radius 20px**, 15px
6. **Add to Wishlist** — transparent fill, white text, radius 8px, 15px
7. **Buy Now** — black fill, white text, radius 20px, font `forum` 16px, padding 10px 16px
8. Accordions (`info-section-title`, h2 Bebas 15px, left): **Product Care** ·
   **Shipping & Returns** · **SIZE GUIDE** (Product Care copy: cold hand wash, no iron,
   rinse after salt/chlorine, dry in shade, color may fade in sun)
9. Related-products strip area → footer.

Page background **#ffffff**. **No breadcrumbs, no SKU line.** WhatsApp share present
(first pass).

**Interaction (measured)**
- Two round white "**Enlarge**" buttons (`border-radius: 50%`, white bg, black glyph) over
  the gallery — lightbox entry.
- **Add To Cart / Buy Now transitions (computed)**: `transition-property:
  background-color, border-color, color, border-width; 0.2s; ease-in-out` — hover recolor
  animates 0.2s ease-in-out. The hover *end* colors could not be captured (the Wix widget
  re-renders its nodes under synthetic hover in headless) — **skipped, not guessed**.
- Thumbnails: `cursor: pointer`; click swaps main image; hover diff unmeasurable for the
  same re-render reason.
- Main image: **no hover zoom** (pixel diff ≈ 0; no `zoom-in` cursor anywhere).
- Steppers/dropdown: `cursor: pointer`.

**380px**: same fixed layout (docHeight 1511 vs 1515 desktop), horizontally cropped; Add
to Wishlist renders as a white circle (r=50%). No reflow.

## 5. Sold-out product — `/product-page/sunsquers-regular-bottom`

(First pass sampled `/product-page/fire-heart-regular-bottom` — behavior identical.)
Same template as §4; differences only:
- "**Notify When Available**" (black fill, white text, radius 20px, 15px) **replaces both**
  Add To Cart and Buy Now.
- "Out of stock" status text in the details column.
- Price still shown (₪220.00); size dropdown, quantity, accordions, 4 thumbnails unchanged.
- Grid vs PDP: grid cards just say *Out of stock*; the PDP CTA becomes Notify When
  Available.

## 6. `/drops`

**Layout**: **solid green hero band** (~800px; same family as the measured accent
`rgb(127,184,80)` — the band itself is an image so its exact hex wasn't computed) with
"HEATWAVE" (h2 40px Bebas) at its base → **five stacked full-bleed photo tiles**, each
800–820px tall, each one link with a small centered label (10px default text over photo):
"drop 4 gallery" · "drop 3 gallery" · "retro drop gallery" · "drop 2 gallery" ·
"drop 1 gallery" → footer.

**Loading**: blur-up is obvious here — two tiles were captured still blurred before the
full-res images landed.

## 7. `/drop-4` (Jungle Collection) and `/retro-drop`

**Same lookbook template as each other; different from /drops** (which is the index of
tiles). Both are hand-built pages of stacked full-bleed collection photos (800px bands),
**no product grid, no headings, no prices**:
- `/drop-4` (title "JUNGLE COLLECTION"): hero (788px) containing one "**shop now**" link →
  3 photo bands.
- `/retro-drop`: hero + 2 photo bands, no text at all beyond global chrome.

## 8. `/gift-card`

Announcement/header → one tall widget section (1364px) → footer. The purchase widget is a
Wix iframe app; its internals (amount presets, image, button labels, fields) are not
readable from the parent DOM — **skipped: unreadable, both statically and in-browser**.
Nothing else is on the page.

## 9. `/about-1`

Photo hero with h1 "**About salty**" — Bebas **60px** white → story text: "join our love
story with swimwear", brand origin paragraph (handmade, premium fabric, quality over
quantity — long copy not transcribed) → h2 "**STAY SALTY!**" (30px) → footer.

## 10. `/contact`

Photo hero with h1 "**Contact Us**" — Bebas **100px** white → contact block: **WhatsApp –
0544407698** · **Mail – SALTYHAIRswimm@GMAIL.COM** · **Address – KIBUTS GALuYoT 23, HOD
HASHARON** → h2 "**We Want To Hear From You!**" (22px) → form → footer.

**Form fields (labels verbatim)**: **First Name** (text) · **Last Name** (text) ·
**Email** (email) · "**Leave us a message...**" (textarea) · newsletter checkbox ("I want
to subscribe to the newsletter.") · button "**Submit**". Success copy: "THANKS FOR
SUBMITTING! STAY SALTY!" Not submitted.

## 11. `/size-guide`

Photo hero h1 "**Size Guide**" (Bebas **100px** white) → h3 "**Top guide**" (60px) → table
(Size|Bust): XS 76–80 · S 80–84 · M 84–88 · L 88–92 cm → h3 "**bottoms guide**" (60px) →
table (Size|Hips|Waist): XS 83–89/60–64 · S 89–94/64–68 · M 94–99/68–72 · L 99–106/72–72
cm *(the "72–72" L waist looks like a live-site typo)* → closing "Still having troubles to
decide? you can always Chat with us on site o…" → footer. Tables are Wix text grids, not
semantic `<table>`s.

## 12. `/store-policy`

Hero h1 "**STORE POLICY**" (Bebas 100px white) → one long rich-text section (6465px).
Section headings only: The website's services · Operating Areas · Registration and Account
Creation · Terms of Sale on the Website · Shipping, Returns, Exchanges, and Cancellations ·
Intellectual Property and Usage License · Usage Restrictions · Privacy · Limitation of
Liability · Termination of Terms of Use · Jurisdiction · Payment Methods ("Credit / Debit
Cards"). Markup note for the rebuild: headings are h6 25px and body paragraphs are h4
17px/700 — semantically inverted.

## 13. `/privacy-policy`

Same template. h1 "**PRIVACY POLICY**" (100px). Headings: The type of information collected
about you · The manner of collecting and using information · cookies · Transferring
Information to Third Parties · Duration of Retaining Collected Information · Right to
access information · Information Security · Contact Us · Payment Methods.

## 14. The cart

**Answered (was ⛔): the cart is a separate page, not a drawer.** The bag icon is a link
(`data-hook="cart-icon-button"`, aria "Cart with 0 items") to **`/cart-page`**; clicking it
opens no side panel (checked for fixed right-edge containers and iframes post-click).
Empty state: h2 "**My cart**" · "**Cart is empty**" · link "**Continue Browsing**" →
footer. No open animation (normal navigation). Badge is a plain count. Badge behavior on
quantity change **not tested** — requires adding to cart, which the brief forbids; same
for in-cart UI and checkout.

## 15. The "More" nav item

**Answered (was ⛔):** the visible menu is HOME · ALL PRODUCTS · BOTTOMS · TOPS ·
ACCESSORIES · DROPS · GIFT CARD plus a 24×24 expander (aria "**More DROPS pages**")
attached to DROPS. Hover opens a dropdown of archived drops: **JUNGLE COLLECTION**
(`/drop-4`) · **DROP 3** (`/drop-3`) · **RETRO DROP** (`/retro-drop`) · **DROP 2**
(`/drop-2`) · **DROP 1** (`/drop-1`). "More" holds nothing else — it is a DROPS overflow,
not an About/Contact catch-all.

---

# Global report

**Header** — static (`position: relative`), 122px tall, no shrink or restyle on scroll
(computed identical after 800px scroll). Black full-width band shared with the
announcement strip. Mobile: **no mobile menu**; the desktop nav renders cropped at 380px.

**Announcement bar** — static, **no marquee** (0px movement over 1.5s; one DOM copy).
Black `#000000`, white Bebas 17px/700, 37px tall.

**Cart** — separate page `/cart-page`; no drawer, no open animation; badge = plain count
(change behavior untestable read-only).

**Typography** (computed)
- Display/heading/nav/name: **Bebas** (`orig_bebas_regular` chain) — caps-only;
  `text-transform: none` everywhere; letter-spacing `normal` on every heading measured.
- Secondary display: `chips-w26-normal` ("Heatwave" band).
- Newsletter input: `futura-lt-w01-light` 16px. Product-widget buttons: `forum` 16px.
- Unstyled bits ("Price" label, cart count): Arial 10px — Wix default; there is no real
  body-copy font on commerce pages.
- Sizes: hero h1s **100px** (Contact/Size-Guide/Policies), 60px (About), 40px (home/footer
  h1, section h2), 35px logo, 32px category h1, 30px newsletter h1, 28px product h1 & IG
  h2, 25px policy headings, 18px card name & Heatwave sub, 17px nav/announcement/policy
  body, 16px card price, 15px accordion titles & commerce buttons, 14px product price.
  Line-height ≈ 1.4×.

**Color**
| Color | Value | Used for |
|---|---|---|
| Black | `#000000` | announcement bar, header band, home footer band, Add To Cart / Buy Now / Notify buttons, Load More border, nearly all text |
| White | `#ffffff` | page bg (category/product/policy — pixel-sampled), button text, Enlarge buttons, newsletter input |
| Off-white | `rgb(250,250,250)` | footer text on black |
| Accent green | `rgb(127,184,80)` | "Accessories" heading; /drops hero band is the same family (band is an image — sampled visually) |
| Grey | `rgb(68,68,68)` | dropdown "Select" text |
| Disabled grey | `rgba(199,199,199,0.5)` | disabled quantity stepper |
| Focus blue | `rgb(17,109,255)` | focus rings (`rgb(0,56,255)` on a11y widget) |
| Default-link blue | `rgb(0,0,238)` | unstyled cart count — browser default, not a token |

Button hover end-colors: transition specs measured (0.2s ease-in-out on
background/border/color) but final hover colors not capturable headlessly — skipped.

**Spacing** — grid container 1400px at 1440vw (≈20px outer gutters); grid gap 22px;
category title→grid ≈106px; product section 123px below header; home bands 800–1037px
tall, stacked with 0 gap; footer block ≈600px. There is no single max-content-width
wrapper — full-bleed bands alternate with the 1400px grid.

**Product card anatomy** — §2: 1:1 image (262px, two stacked images for the 0.2s hover
cross-fade) → name (Bebas 18px centered) → divider → price (Bebas 16px centered); ribbon/
wishlist container present but unused; sold-out swaps price for "Out of stock".

**Buttons — every distinct style found**
1. **Primary commerce** (Add To Cart / Buy Now / Notify When Available): black fill, white
   text, radius **20px**, padding 10px 16px, 15–16px; hover recolors over 0.2s ease-in-out.
2. **Outline** (Load More): transparent fill, thin black border, square, Bebas 17px black.
3. **Wishlist**: transparent, white text, radius 8px (desktop) / white circle (mobile).
4. **Enlarge**: white circle (50% radius), black glyph.
5. **Text-links** (Join us!, Submit, Log In, shop now, accordion titles): no fill/border,
   cursor pointer, **no hover change**.
6. Cookie banner (Wix consent, not brand): Settings black/white-border, Accept
   white/black, 14px Helvetica Neue.

**Mobile (~380px) — everything that differs**
- No responsive layout: fixed canvas, scrollWidth 1127px → horizontal crop/scroll
  everywhere; no hamburger; nav/footer clipped.
- Only the Stores grid reflows: 5×262px → **1×980px** (category ≈25,650px tall).
- Wishlist becomes a circular white button on the PDP; otherwise section offsets are
  pixel-identical to desktop.
- Cookie banner becomes a compact floating box.

**Motion summary — the complete list actually found**
| Trigger | What | Property | Duration / easing |
|---|---|---|---|
| Hover product card | 2nd image cross-fades in | wrapper `opacity` 0↔1 | **0.2s** ease |
| Hover Add To Cart / Buy Now / Notify | recolor | background-color, border-color, color, border-width | **0.2s ease-in-out** |
| Image load (most visible on /drops) | blur-up sharpens | Wix internal src/filter swap | n/a |
| Keyboard focus | blue double ring | `box-shadow 0 0 0 1px #fff, 0 0 0 3px rgb(17,109,255)` | instant |
| (widget, not content) a11y spinner | `uw_standard` keyframes | transform | 0.75s linear ∞ |

No scroll-triggered animations, no marquee, no sticky/shrinking header, no nav/footer link
hover styles, no image zoom. Declared `transition: all 0.2s ease` on tiles never visibly
fires because no hover rule changes their properties.

**Explicitly skipped (rather than guessed)**
- Gift-card widget internals (iframe — unreadable).
- Hover end-colors of commerce buttons (widget re-renders under synthetic hover headlessly).
- Cart badge/quantity behavior, in-cart UI, checkout (requires adding to cart — forbidden).
- `/drop-1`, `/drop-2`, `/drop-3` (linked from More but not on the audited page list).
- Search overlay behavior (magnifier icon — not in the page list).

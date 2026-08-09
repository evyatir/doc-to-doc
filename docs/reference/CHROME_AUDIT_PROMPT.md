# SITE AUDIT — saltyhairswimwear.com

You are inspecting this site so a developer can rebuild an equivalent storefront from
scratch. Read only. Do not click "Add to Cart", do not submit forms, do not check out.

Work through every page listed below. For each one, report in the exact format given.
Be concrete and quantitative — "the image scales up slightly over about 0.5s" is useful,
"it has a nice hover effect" is not. If you can read the computed CSS or the DOM for a
value, use the real value rather than estimating.

---

## Pages to visit

1. `/` — home
2. `/category/all-products`
3. `/category/bottoms` (compare against all-products — is the layout identical?)
4. `/product-page/summer-sky-regular-bottom`
5. Any product that is **sold out** — note how it differs
6. `/drops`
7. `/drop-4` (Jungle Collection) and `/retro-drop` — are these the same template or custom pages?
8. `/gift-card`
9. `/about-1`
10. `/contact`
11. `/size-guide`
12. `/store-policy`
13. `/privacy-policy`
14. The cart (open it from the bag icon — do not proceed to payment)
15. The "More" item in the main nav — what's behind it?

---

## For EACH page, report

**Layout**
- Sections top to bottom, in order, with a one-line description of each
- Column counts and how they change on mobile (resize to ~380px and note what reflows)
- Anything present on this page that isn't on the others

**Text**
- Headings verbatim, button labels verbatim, form field labels verbatim
- Do NOT transcribe long legal or policy paragraphs — just note the section headings

**Interaction** — this is the part I most need
- What changes on hover, for: product cards, nav links, buttons, category tiles,
  footer links, social icons, image thumbnails
- The actual cursor style over each of those (`pointer`, `default`, `zoom-in`, custom?)
- Transition durations and easing where you can read them from CSS
- Any scroll-triggered animation — what triggers, what moves, how far
- Focus states when tabbing through — is there a visible ring? what does it look like?
- Loading behavior — do images fade in, is there a skeleton, is there a blur-up?

---

## Global report (once, at the end)

**Header**: sticky or static? does it shrink or change on scroll? what does the mobile
menu do — slide, fade, full-screen? what's behind "More"?

**Announcement bar**: does the text scroll/marquee, or is it static? if it scrolls, how
fast and does it pause on hover?

**Cart**: drawer or separate page? what animates when you open it? what does the item
count badge do when a quantity changes?

**Typography**: font-family for headings, body, and prices/labels. Actual font sizes for
h1, h2, body, and small text. Letter-spacing on headings. Are headings uppercase via CSS
or typed that way?

**Color**: exact hex values for page background, body text, buttons, button hover, borders,
and any accent color. Say where each is used.

**Spacing**: vertical padding between major sections. Max content width. Gutter width.

**Product card anatomy**: exact order and styling of every element on a card, including
any badges and where they sit.

**Buttons**: every distinct button style on the site, with fill, border, radius, padding,
font size, and hover state.

**Mobile**: at ~380px, list everything that behaves differently from desktop.

**Motion summary**: every animation on the site in one list — trigger, property, duration,
easing.

---

## Output format

Plain markdown. Page-by-page sections, then the global report. No screenshots needed —
describe in words and give me real CSS values wherever you can read them.

Skip anything you cannot determine rather than guessing, and say explicitly that you
skipped it.

// The entire stylesheet, as a template string, injected once by main.jsx.
// Rules: no literal hex colors, no font names — everything reads CSS vars set
// by theme.js. No CSS case-forcing anywhere (caps come from caps-only fonts).
//
// Transition inventory (verification §12.4 — every declaration justified):
//   1. .card-img-b            opacity var(--t-fade)      — THE product-card cross-fade
//   2. a.quiet, .navlink etc.  opacity var(--t-fade)     — subtle link hover (spec §3 FIX)
//   3. .btn                   colors var(--t-recolor)    — button recolor (audit-measured)
//   4. .blur-img              filter/opacity var(--t-fade) — blur-up loading (spec §3 REPRODUCE)
//   5. .scrim/.drawer/.mobile-menu opacity var(--t-fade) — drawer/menu fade (uses fade token; no slides)
//   6. .ig-cap                opacity var(--t-fade)      — Instagram caption overlay (spec §8)
// prefers-reduced-motion zeroes all of them.

export const css = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
html { overflow-x: clip; }
body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  overflow-x: clip;
}
img { max-width: 100%; display: block; }
h1, h2, h3, h4, p { margin: 0; }
h1, h2, h3, h4 { font-family: var(--font-display); font-weight: 400; line-height: 1.15; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
input, textarea, select { font-family: var(--font-body); font-size: 16px; color: var(--ink); }

/* ---------- focus: double ring everywhere ---------- */
:focus { outline: none; }
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 1px var(--paper), 0 0 0 3px var(--focus);
  border-radius: 2px;
}

/* ---------- quiet link hover (FIX: reference had cursor-only feedback) ---------- */
.quiet { transition: opacity var(--t-fade); }
.quiet:hover { opacity: 0.6; }

/* ---------- buttons ---------- */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 44px; padding: 10px 24px;
  font-family: var(--font-display); font-size: var(--fs-small);
  border: 1px solid var(--ink); border-radius: var(--r);
  background: var(--paper); color: var(--ink);
  transition: background-color var(--t-recolor), border-color var(--t-recolor), color var(--t-recolor);
}
.btn:hover { background: var(--ink); color: var(--paper); }
.btn-commerce {
  background: var(--ink); color: var(--paper);
  border-color: var(--ink); border-radius: var(--r-commerce);
  width: 100%; font-size: var(--fs-small);
}
.btn-commerce:hover { background: var(--paper); color: var(--ink); }
.btn-commerce:disabled {
  opacity: 0.45; cursor: not-allowed;
  background: var(--ink); color: var(--paper);
}
.btn-outline { background: var(--paper); color: var(--ink); }

/* ---------- ticker + header ---------- */
.ticker {
  background: var(--band); color: var(--ink-on-band);
  font-family: var(--font-display); font-size: var(--fs-nav);
  height: 37px; display: flex; align-items: center; justify-content: center;
  padding: 0 12px; white-space: nowrap; overflow: hidden;
}
.header-wrap { background: var(--band); color: var(--ink-on-band); }
.header-wrap.sticky { position: sticky; top: 0; z-index: 50; }
.header {
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  gap: 16px; min-height: 85px; padding: 0 24px; max-width: 1400px; margin: 0 auto;
}
.logo {
  font-family: var(--font-display); font-size: var(--fs-logo);
  color: var(--ink-on-band); justify-self: center; text-align: center;
}
.nav { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
.navlink {
  font-family: var(--font-display); font-size: var(--fs-nav);
  color: var(--ink-on-band); padding: 4px 2px; position: relative;
  transition: opacity var(--t-fade);
}
.navlink:hover { opacity: 0.6; }
.navlink.active { box-shadow: inset 0 -2px 0 var(--accent); }
.navlink.active:focus-visible {
  box-shadow: inset 0 -2px 0 var(--accent), 0 0 0 1px var(--paper), 0 0 0 3px var(--focus);
}
.header-icons { display: flex; align-items: center; gap: 14px; justify-self: end; }
.icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 44px; min-height: 44px; color: var(--ink-on-band);
  transition: opacity var(--t-fade);
}
.icon-btn:hover { opacity: 0.6; }
.badge {
  font-family: var(--font-display); font-size: 12px;
  background: var(--accent); color: var(--band);
  border-radius: 999px; min-width: 18px; height: 18px;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0 5px; margin-left: 4px;
}

/* drops dropdown */
.has-sub { position: relative; }
.submenu {
  position: absolute; top: 100%; left: 0; z-index: 60;
  background: var(--band); padding: 8px 14px; min-width: 180px;
  display: none; flex-direction: column; gap: 6px;
}
.has-sub:hover .submenu, .has-sub:focus-within .submenu { display: flex; }

/* hamburger + mobile menu */
.burger { display: none; }
.mobile-menu {
  position: fixed; inset: 0; z-index: 100;
  background: var(--band); color: var(--ink-on-band);
  padding: 24px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 4px;
  transition: opacity var(--t-fade);
}
.mobile-menu a, .mobile-menu button {
  font-family: var(--font-display); font-size: var(--fs-h2);
  color: var(--ink-on-band); min-height: 48px; display: flex; align-items: center;
}
.mobile-close { align-self: flex-end; font-size: var(--fs-nav); }

/* ---------- search ---------- */
.search-bar {
  background: var(--paper); border-bottom: 1px solid var(--ink);
  padding: 14px 24px; display: flex; gap: 12px; align-items: center;
  max-width: 1400px; margin: 0 auto;
}
.search-bar input {
  flex: 1; border: 1px solid var(--ink); border-radius: var(--r);
  padding: 10px 14px; min-height: 44px; background: var(--paper);
}
.search-count { font-family: var(--font-display); font-size: var(--fs-nav); }

/* ---------- full-bleed bands ---------- */
.band {
  position: relative; width: 100%; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.band-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.band-label {
  position: relative; z-index: 2; color: var(--ink-on-band);
  font-family: var(--font-display); text-align: center; padding: 16px;
}
.band-tall { min-height: 800px; }
.band-mid { min-height: 420px; }
.band-hero-doc { min-height: 340px; }
.accent-band {
  background: var(--paper); text-align: center; padding: 64px 24px;
  font-family: var(--font-accent);
}
.accent-band h2 { font-family: var(--font-accent); font-size: var(--fs-h2); }
.accent-band p { font-family: var(--font-accent); font-size: 18px; margin-top: 8px; }

/* ---------- blur-up images ---------- */
.blur-img { transition: filter var(--t-fade), opacity var(--t-fade); }
.blur-img.loading { filter: blur(14px); }
.blur-img.loaded { filter: blur(0); }

/* ---------- shop grid ---------- */
.page { max-width: 1400px; margin: 0 auto; padding: 40px 20px 80px; }
.page-h1 {
  font-size: var(--fs-category-h1); text-align: center; margin: 24px 0 40px;
}
.grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 22px;
}
.load-more-wrap { display: flex; justify-content: center; margin-top: 48px; }

/* ---------- product card ---------- */
.card { display: block; }
.card-media { position: relative; aspect-ratio: 1 / 1; overflow: hidden; background: var(--paper); }
.card-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.card-img-b { opacity: 0; transition: opacity var(--t-fade); }
.card:hover .card-img-b, .card:focus-visible .card-img-b { opacity: 1; }
.card-name {
  font-family: var(--font-display); font-size: var(--fs-card-name);
  text-align: center; margin-top: 12px;
}
.card-divider { width: 24px; height: 1px; background: var(--ink); margin: 8px auto; }
.card-price {
  font-family: var(--font-display); font-size: var(--fs-card-price);
  text-align: center;
}
.card-oos { color: var(--muted); }

/* ---------- PDP ---------- */
.pdp { display: grid; grid-template-columns: 1fr 355px; gap: 48px; align-items: start; }
.pdp-gallery { display: grid; gap: 12px; }
.pdp-main { aspect-ratio: 1 / 1; overflow: hidden; }
.pdp-main img { width: 100%; height: 100%; object-fit: cover; }
.pdp-thumbs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.pdp-thumb { aspect-ratio: 1 / 1; overflow: hidden; padding: 0; border: 1px solid transparent; }
.pdp-thumb.active { border-color: var(--ink); }
.pdp-thumb img { width: 100%; height: 100%; object-fit: cover; }
.pdp-title { font-size: var(--fs-pdp-h1); }
.pdp-price { font-family: var(--font-display); font-size: var(--fs-card-price); margin-top: 10px; }
.microlabel { font-size: 12px; color: var(--muted); font-family: var(--font-body); }
.field { margin-top: 20px; }
.field label {
  display: block; font-family: var(--font-display); font-size: var(--fs-small); margin-bottom: 6px;
}
.field select, .field input, .field textarea {
  width: 100%; min-height: 44px; padding: 8px 12px;
  border: 1px solid var(--ink); border-radius: var(--r); background: var(--paper);
}
.field select:invalid, .placeholder-opt { color: var(--muted); }
.stepper { display: inline-flex; align-items: center; border: 1px solid var(--ink); border-radius: var(--r); }
.stepper button { min-width: 44px; min-height: 44px; font-size: 18px; }
.stepper button:disabled { color: var(--muted); opacity: 0.5; cursor: not-allowed; }
.stepper input {
  width: 48px; text-align: center; border: 0; min-height: 44px; background: var(--paper);
}
.pdp-ctas { display: grid; gap: 10px; margin-top: 24px; }
.oos-line { font-family: var(--font-display); font-size: var(--fs-small); color: var(--muted); margin-top: 16px; }
.accordions { margin-top: 32px; border-top: 1px solid var(--ink); }
.acc-item { border-bottom: 1px solid var(--ink); }
.acc-head {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-display); font-size: var(--fs-small); min-height: 48px; text-align: left;
}
.acc-body { padding: 0 0 16px; font-size: 15px; }
.strip-h2 { font-size: var(--fs-h2); text-align: center; margin: 64px 0 32px; }
.strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }

/* ---------- cart ---------- */
.cart-lines { display: grid; gap: 20px; margin-top: 32px; }
.cart-line {
  display: grid; grid-template-columns: 90px 1fr auto; gap: 16px; align-items: center;
  border-bottom: 1px solid var(--ink); padding-bottom: 20px;
}
.cart-line img { width: 90px; height: 90px; object-fit: cover; }
.cart-meta { font-size: 14px; color: var(--muted); }
.cart-summary { margin-top: 32px; max-width: 420px; margin-left: auto; display: grid; gap: 14px; }
.subtotal { display: flex; justify-content: space-between; font-family: var(--font-display); font-size: var(--fs-card-name); }
.ship-bar { border: 1px solid var(--ink); height: 10px; border-radius: 999px; overflow: hidden; }
.ship-fill { height: 100%; background: var(--accent); }
.ship-note { font-size: 13px; color: var(--muted); }
.empty-cart { text-align: center; padding: 64px 0; display: grid; gap: 12px; justify-items: center; }

/* ---------- drawer ---------- */
.scrim {
  position: fixed; inset: 0; z-index: 90; background: var(--band);
  opacity: 0.5; transition: opacity var(--t-fade);
}
.drawer {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 95;
  width: min(400px, 100vw); background: var(--paper); color: var(--ink);
  padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px;
  transition: opacity var(--t-fade);
  border-left: 1px solid var(--ink);
}
.drawer-h2 { font-size: var(--fs-card-name); }
.drawer-lines { display: grid; gap: 14px; flex: 1; }
.drawer-line { display: grid; grid-template-columns: 56px 1fr; gap: 10px; font-size: 14px; align-items: center; }
.drawer-line img { width: 56px; height: 56px; object-fit: cover; }

/* ---------- forms / contact / newsletter ---------- */
.form-grid { display: grid; gap: 16px; max-width: 560px; margin: 0 auto; }
.form-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.checkline { display: flex; gap: 10px; align-items: center; font-size: 14px; }
.checkline input { min-height: 20px; width: 20px; }
.err { color: var(--focus); font-size: 13px; }
.ok-note { text-align: center; font-family: var(--font-display); font-size: var(--fs-card-name); padding: 40px 0; }
.contact-block { text-align: center; display: grid; gap: 6px; margin: 40px 0; }

.newsletter { text-align: center; display: grid; gap: 12px; justify-items: center; }
.newsletter h2 { font-size: var(--fs-newsletter); }
.newsletter-row { display: flex; gap: 10px; width: min(420px, 100%); }
.newsletter-row input {
  flex: 1; border: 0; border-bottom: 1px solid currentColor; background: none;
  color: inherit; padding: 10px 4px; min-height: 44px;
}

/* ---------- instagram ---------- */
.ig-h2 { font-size: var(--fs-pdp-h1); text-align: center; margin: 64px 0 24px; }
.ig-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
.ig-tile { position: relative; aspect-ratio: 1 / 1; overflow: hidden; display: block; }
.ig-tile img { width: 100%; height: 100%; object-fit: cover; }
.ig-cap {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: var(--band); color: var(--ink-on-band); font-size: 13px; text-align: center;
  padding: 8px; opacity: 0; transition: opacity var(--t-fade);
}
.ig-tile:hover .ig-cap, .ig-tile:focus-visible .ig-cap { opacity: 0.9; }

/* ---------- footer ---------- */
.footer { background: var(--band); color: var(--ink-on-band); margin-top: 80px; }
.footer-inner {
  max-width: 1400px; margin: 0 auto; padding: 56px 24px;
  display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr 1.4fr; gap: 32px;
}
.footer h2 { font-size: var(--fs-h2); }
.footer h3 { font-size: var(--fs-nav); margin-bottom: 12px; }
.footer-col { display: grid; gap: 8px; align-content: start; font-size: 14px; }
.footer a { min-height: 24px; display: inline-flex; align-items: center; }
.social-row { display: flex; gap: 14px; margin-top: 12px; }
.footer-line { font-size: 13px; opacity: 0.8; margin-top: 8px; }

/* ---------- toast ---------- */
.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: var(--band); color: var(--ink-on-band);
  padding: 12px 20px; z-index: 120; font-family: var(--font-display);
  font-size: var(--fs-small); border-radius: var(--r-commerce);
}

/* ---------- tables ---------- */
table.sizes { border-collapse: collapse; width: 100%; max-width: 640px; margin: 0 auto 48px; }
table.sizes caption { font-family: var(--font-display); font-size: var(--fs-hero-lg); padding: 24px 0; }
table.sizes th, table.sizes td { border: 1px solid var(--ink); padding: 10px 16px; text-align: center; }
table.sizes th { font-family: var(--font-display); font-weight: 400; font-size: var(--fs-nav); }

/* ---------- doc pages ---------- */
.doc-h1 { font-size: var(--fs-hero-lg); color: var(--ink-on-band); }
.doc-body { max-width: 720px; margin: 0 auto; display: grid; gap: 18px; padding: 48px 20px; }

/* ---------- gift card ---------- */
.gift-amounts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
.gift-amounts .btn.selected { background: var(--ink); color: var(--paper); }

/* ---------- checkout (cart page + drawer) ---------- */
.checkout-form { display: grid; gap: 0; text-align: left; }
.stock-warn { border: 1px solid var(--ink); padding: 12px 16px; margin-top: 16px; font-size: 14px; }
.stock-warn ul { margin: 8px 0 12px; padding-left: 18px; display: grid; gap: 4px; }

/* ---------- admin (/admin — owner panel, same tokens, plain & dense) ---------- */
.admin { max-width: 1100px; margin: 0 auto; }
.admin-login { max-width: 360px; margin: 48px auto; }
.admin-bar { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-bottom: 24px; }
.admin-tabs { display: flex; gap: 8px; border-bottom: 1px solid var(--ink); margin-bottom: 24px; }
.admin-tab {
  font-family: var(--font-display); font-size: var(--fs-nav);
  padding: 10px 18px; min-height: 44px; opacity: 0.55;
}
.admin-tab.active { opacity: 1; border-bottom: 3px solid var(--accent); }
.admin-h2 { font-size: var(--fs-pdp-h1); margin-bottom: 16px; }
.admin-table-wrap { overflow-x: auto; }
.admin-table { border-collapse: collapse; width: 100%; font-size: 14px; }
.admin-table th, .admin-table td {
  border-bottom: 1px solid var(--muted); padding: 8px 10px; text-align: left; vertical-align: top;
}
.admin-table th { font-family: var(--font-display); font-weight: 400; font-size: var(--fs-nav); }
.admin-table tr.inactive { opacity: 0.5; }
.admin-stock { display: flex; gap: 10px; flex-wrap: wrap; }
.admin-stock-cell { display: grid; gap: 2px; font-size: 12px; }
.admin-stock-cell input, .admin-variant-row input { width: 64px; padding: 6px; border: 1px solid var(--muted); }
.admin-variant-row { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; }
.admin-variant-row input:first-child { width: 120px; }
.admin-actions { display: flex; gap: 12px; align-items: center; margin: 16px 0; }
.admin-actions .btn { width: auto; }
.admin-form { max-width: 640px; }
.admin-form input, .admin-form textarea { border: 1px solid var(--muted); padding: 10px; width: 100%; }
.admin-counts { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; font-size: 14px; }
.admin-count { font-family: var(--font-accent); }
.admin-filter { display: inline-flex; gap: 8px; align-items: center; font-size: 14px; }
.admin-filter select { padding: 6px; border: 1px solid var(--muted); min-height: 36px; }
.admin-order { border: 1px solid var(--muted); margin-bottom: 10px; }
.admin-order summary {
  display: flex; justify-content: space-between; gap: 12px; align-items: center;
  padding: 12px 16px; cursor: pointer; min-height: 44px;
}
.admin-order-body { padding: 0 16px 16px; display: grid; gap: 8px; font-size: 14px; }
.admin-order-body ul { margin: 0; padding-left: 18px; display: grid; gap: 4px; }
.admin-status { font-family: var(--font-accent); font-size: 13px; }
.admin-message { border-bottom: 1px solid var(--muted); padding: 12px 0; display: grid; gap: 6px; font-size: 14px; }
.admin-message-head { font-family: var(--font-accent); font-size: 13px; }

/* ---------- responsive ---------- */
@media (max-width: 1100px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
  .strip { grid-template-columns: repeat(2, 1fr); }
  .ig-grid { grid-template-columns: repeat(3, 1fr); }
  .footer-inner { grid-template-columns: 1fr 1fr; }
  .band-tall { min-height: 520px; }
}
@media (max-width: 900px) {
  .nav { display: none; }
  .burger { display: inline-flex; }
  .header { grid-template-columns: auto 1fr auto; min-height: 64px; padding: 0 12px; }
  .logo { font-size: var(--fs-pdp-h1); }
  .pdp { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .grid { grid-template-columns: 1fr; }
  .strip { grid-template-columns: 1fr; }
  .ig-grid { grid-template-columns: repeat(2, 1fr); }
  .footer-inner { grid-template-columns: 1fr; }
  .band-tall { min-height: 380px; }
  .band-mid { min-height: 280px; }
  .form-2col { grid-template-columns: 1fr; }
  .gift-amounts { grid-template-columns: repeat(2, 1fr); }
  .cart-line { grid-template-columns: 72px 1fr; }
  .cart-line .line-actions { grid-column: 2; }
  .page { padding: 24px 14px 56px; }
}

/* ---------- reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .card-img-b, .quiet, .navlink, .icon-btn, .btn, .blur-img, .scrim, .drawer,
  .mobile-menu, .ig-cap { transition: none; }
}
`;

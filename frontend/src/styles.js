// The entire stylesheet, as a template string, injected once by main.jsx.
// Rules: no literal hex colors, no font names — everything reads CSS vars set
// by theme.js.
//
// Transition inventory — every declaration justified:
//   1. a.quiet, .navlink etc.  opacity var(--t-fade)      — subtle link hover
//   2. .btn                    colors var(--t-recolor)    — button recolor
//   3. .blur-img               filter/opacity var(--t-fade) — blur-up loading
//   4. .mobile-menu            opacity var(--t-fade)      — menu fade
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
  line-height: 1.6;
  overflow-x: clip;
}
img { max-width: 100%; display: block; }
h1, h2, h3, h4, p { margin: 0; }
h1, h2, h3, h4 { font-family: var(--font-display); font-weight: 400; line-height: 1.15; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
input, textarea, select { font-family: var(--font-body); font-size: 16px; color: var(--ink); }

/* ---------- focus ---------- */
:focus { outline: none; }
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 1px var(--paper), 0 0 0 3px var(--focus);
  border-radius: 2px;
}

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
  background: var(--accent); color: var(--paper);
  border-color: var(--accent); border-radius: var(--r-commerce);
  font-size: var(--fs-small);
}
.btn-commerce:hover { background: var(--ink); border-color: var(--ink); }
.btn-commerce:disabled { opacity: 0.45; cursor: not-allowed; }

/* ---------- header ---------- */
.header-wrap { background: var(--band); color: var(--ink-on-band); border-bottom: 1px solid var(--muted); }
.header-wrap.sticky { position: sticky; top: 0; z-index: 50; }
.header {
  display: grid; grid-template-columns: auto 1fr auto; align-items: center;
  gap: 20px; min-height: 104px; padding: 0 24px; max-width: 1400px; margin: 0 auto;
}
.brand-logo { display: inline-flex; align-items: center; transition: opacity var(--t-fade); }
.brand-logo:hover { opacity: 0.75; }
.brand-logo img { height: 72px; width: auto; }
.nav { display: flex; align-items: center; justify-content: center; gap: 26px; flex-wrap: wrap; }
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
.header-cta { white-space: nowrap; }
.icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 44px; min-height: 44px; color: var(--ink-on-band);
  transition: opacity var(--t-fade);
}
.icon-btn:hover { opacity: 0.6; }

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

/* ---------- blur-up images ---------- */
.blur-img { transition: filter var(--t-fade), opacity var(--t-fade); }
.blur-img.loading { filter: blur(14px); }
.blur-img.loaded { filter: blur(0); }

/* ---------- shared page shell ---------- */
.page { max-width: 1200px; margin: 0 auto; padding: 56px 20px 96px; }
.page-narrow { max-width: 760px; }
.page-h1 { font-size: var(--fs-category-h1); text-align: center; margin: 0 0 16px; }
.section-h2 { font-size: var(--fs-h2); text-align: center; }
.section-h2-accent { font-style: italic; color: var(--accent); }
.section-kicker {
  font-family: var(--font-display); font-size: 13px; letter-spacing: 0.14em;
  color: var(--muted); margin: 20px 0 32px;
}
.section-kicker-center { text-align: center; }

/* ---------- hero ---------- */
.hero {
  max-width: 1400px; margin: 0 auto; padding: 56px 24px 40px;
  display: grid; grid-template-columns: 1.1fr 1fr; gap: 48px; align-items: center;
}
.hero-eyebrow {
  font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--muted); margin-bottom: 18px;
}
.hero-h1 { font-size: var(--fs-hero-xl); }
.hero-h1-accent { font-style: italic; color: var(--accent); }
.hero-body { font-size: 17px; max-width: 52ch; margin-top: 22px; color: var(--ink); }
.hero-ctas { display: flex; align-items: center; gap: 24px; margin-top: 32px; flex-wrap: wrap; }
.hero-cta-primary { padding: 14px 28px; }
.hero-cta-secondary { font-family: var(--font-display); font-size: var(--fs-small); }
.hero-photo-wrap { position: relative; padding: 10px; }
.hero-photo {
  width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 2px;
  box-shadow: 0 12px 28px -12px rgba(92, 56, 28, 0.35);
}
/* washi-tape corners — the scrapbook detail from the client's mockups */
.hero-photo-wrap::before, .hero-photo-wrap::after,
.team-photo-wrap::before, .team-photo-wrap::after {
  content: ''; position: absolute; width: 64px; height: 24px;
  background: var(--accent); opacity: 0.28; z-index: 2;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}
.hero-photo-wrap::before { top: 0; left: 24px; transform: rotate(-6deg); }
.hero-photo-wrap::after { bottom: 4px; right: 20px; transform: rotate(5deg); }
.hero-note {
  position: absolute; bottom: -14px; left: -10px;
  font-family: var(--font-display); font-style: italic; font-size: 15px;
  color: var(--accent); transform: rotate(-4deg);
}

/* ---------- reassurance / quote band ---------- */
.quote-band { background: var(--ink); color: var(--paper); padding: 56px 24px; }
.quote-band-inner { max-width: 720px; margin: 0 auto; text-align: center; display: grid; gap: 10px; }
.quote-question { font-family: var(--font-display); font-size: 21px; opacity: 0.85; }
.quote-line {
  font-family: var(--font-display); font-style: italic; font-size: var(--fs-h2);
  color: var(--accent); margin-top: 18px;
}

/* ---------- steps ---------- */
.steps-teaser { max-width: 1200px; margin: 0 auto; padding: 72px 24px 0; text-align: center; }
.steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; margin-top: 16px; text-align: left; }
.steps-grid-full { margin-top: 8px; }
.step-card { border-top: 2px solid var(--ink); padding-top: 16px; }
.step-n { font-family: var(--font-display); font-size: 22px; color: var(--accent); }
.step-title { font-size: 19px; margin-top: 10px; }
.step-body { font-size: 14.5px; color: var(--muted); margin-top: 10px; line-height: 1.55; }
.steps-cta { display: flex; justify-content: center; margin-top: 40px; }

/* ---------- why band ---------- */
.why-band { max-width: 760px; margin: 72px auto 0; padding: 0 24px; text-align: center; }
.why-band-inline { margin-top: 56px; }
.why-kicker {
  font-family: var(--font-display); font-size: 12px; letter-spacing: 0.14em;
  color: var(--muted); margin-bottom: 18px;
}
.why-text { font-family: var(--font-display); font-size: var(--fs-hero-lg); line-height: 1.35; color: var(--muted); }

/* ---------- final CTA ---------- */
.final-cta { max-width: 700px; margin: 88px auto 0; padding: 0 24px 80px; text-align: center; }
.final-cta-sub { font-size: 18px; color: var(--muted); margin-top: 12px; }
.final-cta-btn { margin-top: 28px; padding: 14px 32px; }

/* ---------- who we are ---------- */
.who-h1 { max-width: 780px; margin: 0 auto 40px; }
.team-photo-wrap { max-width: 900px; margin: 0 auto; position: relative; padding: 10px; }
.team-photo {
  width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 2px;
  box-shadow: 0 16px 32px -14px rgba(92, 56, 28, 0.35);
}
.team-photo-wrap::before { top: -2px; left: 40px; transform: rotate(-5deg); }
.team-photo-wrap::after { bottom: 2px; right: 36px; transform: rotate(4deg); }
.who-intro { text-align: center; font-size: var(--fs-h2); margin: 48px auto 0; }
.who-body { text-align: center; max-width: 68ch; margin: 16px auto 0; color: var(--muted); }
.team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 56px; }
.team-card {
  border: 1px solid var(--muted); border-radius: var(--r); padding: 20px;
  display: grid; gap: 6px; justify-items: start;
  transition: transform var(--t-fade), box-shadow var(--t-fade), border-color var(--t-fade);
}
.team-card:hover {
  transform: translateY(-3px); border-color: var(--accent);
  box-shadow: 0 14px 24px -16px rgba(92, 56, 28, 0.4);
}
.team-avatar { width: 64px; height: 64px; border-radius: 999px; object-fit: cover; }
.team-name { font-size: 17px; margin-top: 10px; }
.team-meta { font-size: 13px; color: var(--muted); }
.team-quote { font-family: var(--font-display); font-style: italic; color: var(--accent); font-size: 15px; margin-top: 6px; }
.team-bio { font-size: 13.5px; color: var(--muted); margin-top: 4px; }
.team-tag { font-size: 12.5px; color: var(--muted); margin-top: 8px; opacity: 0.85; }

/* ---------- FAQ ---------- */
.faq-h1 { text-align: left; margin: 0 0 32px; }
.accordions { margin-top: 8px; border-top: 1px solid var(--ink); }
.acc-item { border-bottom: 1px solid var(--ink); }
.acc-head {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-display); font-size: 17px; min-height: 56px; text-align: left;
  color: var(--accent);
}
.acc-body { padding: 0 0 20px; font-size: 15px; color: var(--muted); max-width: 68ch; }

/* ---------- testimonials ---------- */
.empty-state { text-align: center; padding: 56px 0; display: grid; gap: 8px; justify-items: center; }
.empty-state-sub { font-size: 14px; color: var(--muted); }
.testimonial-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 40px; }
.testimonial-card {
  border: 1px solid var(--muted); border-radius: var(--r); padding: 24px;
  transition: transform var(--t-fade), box-shadow var(--t-fade);
}
.testimonial-card:hover { transform: translateY(-3px); box-shadow: 0 14px 24px -16px rgba(92, 56, 28, 0.4); }
.testimonial-quote { font-family: var(--font-display); font-style: italic; font-size: 17px; }
.testimonial-author { font-size: 13px; color: var(--muted); margin-top: 12px; }

/* ---------- forms (shared: book page intake) ---------- */
.form-grid { display: grid; gap: 18px; }
.field { margin-top: 20px; }
.field label {
  display: block; font-family: var(--font-display); font-size: var(--fs-small); margin-bottom: 6px;
}
.field select, .field input, .field textarea {
  width: 100%; min-height: 44px; padding: 10px 12px;
  border: 1px solid var(--ink); border-radius: var(--r); background: var(--paper);
}
.field select.placeholder-opt { color: var(--muted); }
.err { color: #B33A3A; font-size: 13px; margin-top: 4px; }
.ok-note { font-family: var(--font-display); font-size: 17px; padding: 24px 0; }
.role-toggle { display: flex; gap: 10px; }
.role-btn {
  flex: 1; min-height: 44px; border: 1px solid var(--ink); border-radius: var(--r);
  transition: background-color var(--t-recolor), color var(--t-recolor);
}
.role-btn.selected { background: var(--ink); color: var(--paper); }

/* ---------- book a consultation ---------- */
.book-page { max-width: 1200px; margin: 0 auto; }
.book-hook {
  text-align: center; max-width: 640px; margin: 0 auto;
  padding: 88px 24px 64px;
}
.book-hook-sub { color: var(--muted); font-size: 18px; margin-top: 14px; }
.book-hook-btn { margin-top: 32px; padding: 14px 32px; }
.book-reveal { animation: book-reveal 0.35s ease both; padding-top: 16px; }
@keyframes book-reveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.hp-field { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
.book-hero { text-align: center; max-width: 640px; margin: 0 auto; }
.book-hero-note { font-family: var(--font-display); font-style: italic; color: var(--accent); font-size: 14px; }
.book-h1 { margin-top: 12px; }
.book-h1-accent { font-style: italic; color: var(--accent); }
.book-hero-body { color: var(--muted); margin-top: 14px; }
.book-chips {
  display: flex; justify-content: center; gap: 28px; margin-top: 24px;
  font-family: var(--font-display); font-size: 13px; color: var(--muted);
}
.book-split {
  display: grid; grid-template-columns: 1fr 1fr; gap: 28px;
  margin-top: 48px; align-items: start;
}
.book-form-card, .book-calendar-card {
  border: 1px solid var(--muted); border-radius: var(--r); padding: 28px;
}
.book-card-h2 { font-size: 20px; }
.book-card-sub { font-size: 13.5px; color: var(--muted); margin-top: 4px; }
.book-privacy-note { font-size: 12.5px; color: var(--muted); text-align: center; }
.calendly-embed { min-height: 480px; margin-top: 16px; }
.calendly-placeholder {
  margin-top: 24px; padding: 20px; border: 1px dashed var(--muted); border-radius: var(--r);
  display: grid; gap: 8px; font-size: 14px; color: var(--muted);
}

/* ---------- footer ---------- */
.footer { background: var(--band); color: var(--ink-on-band); margin-top: 80px; border-top: 1px solid var(--muted); }
.footer-inner {
  max-width: 1400px; margin: 0 auto; padding: 48px 24px;
  display: grid; grid-template-columns: 1.6fr 1fr 1fr; gap: 32px;
}
.footer h3 { font-size: var(--fs-nav); margin-bottom: 12px; }
.footer-col { display: grid; gap: 8px; align-content: start; font-size: 14px; }
.footer-col-wide { gap: 12px; }
.footer-logo { height: 44px; width: auto; }
.footer a { min-height: 24px; display: inline-flex; align-items: center; }
.footer-line { font-size: 13px; opacity: 0.85; max-width: 42ch; }

/* ---------- toast ---------- */
.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: var(--ink); color: var(--paper);
  padding: 12px 20px; z-index: 120; font-family: var(--font-display);
  font-size: var(--fs-small); border-radius: var(--r-commerce);
}

/* ---------- admin ---------- */
.admin { max-width: 1100px; margin: 0 auto; }
.admin-login { max-width: 360px; margin: 48px auto; }
.admin-bar { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-bottom: 24px; }
.admin-h2 { font-size: 24px; margin-bottom: 16px; }
.admin-message { border-bottom: 1px solid var(--muted); padding: 14px 0; display: grid; gap: 6px; font-size: 14px; }
.admin-message-head { font-family: var(--font-display); font-size: 13px; color: var(--muted); }
.admin-message-meta { font-size: 13px; color: var(--accent); }

/* ---------- responsive ---------- */
@media (max-width: 1100px) {
  .hero { grid-template-columns: 1fr; gap: 32px; }
  .steps-grid { grid-template-columns: repeat(2, 1fr); }
  .team-grid { grid-template-columns: repeat(2, 1fr); }
  .footer-inner { grid-template-columns: 1fr 1fr; }
  .book-split { grid-template-columns: 1fr; }
}
@media (max-width: 900px) {
  .nav { display: none; }
  .burger { display: inline-flex; }
  .header { grid-template-columns: auto 1fr auto; min-height: 72px; padding: 0 16px; }
  .brand-logo img { height: 44px; }
  .header-cta { display: none; }
}
@media (max-width: 640px) {
  .steps-grid { grid-template-columns: 1fr; }
  .team-grid { grid-template-columns: 1fr; }
  .testimonial-grid { grid-template-columns: 1fr; }
  .footer-inner { grid-template-columns: 1fr; }
  .page { padding: 40px 16px 72px; }
  .book-chips { gap: 16px; flex-wrap: wrap; }
  .role-toggle { flex-direction: column; }
}

/* ---------- reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .quiet, .navlink, .icon-btn, .btn, .blur-img, .mobile-menu, .brand-logo,
  .team-card, .testimonial-card { transition: none; }
  .book-reveal { animation: none; }
}
`;

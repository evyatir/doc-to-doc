// ============================================================================
// CLIENT CONFIG — blank template. Copy this folder, rename it, fill it in.
// Every visual/brand decision lives here. NEVER edit frontend/src/ for one client.
//
// Image values are strings. Use one of:
//   ''                                        -> renders a tinted placeholder
//   new URL('./assets/x.jpg', import.meta.url).href   -> photo in this folder
//   'https://...'                             -> absolute URL
// ============================================================================

export const BRAND = {
  name: 'Your Brand',        // wordmark + localStorage namespace. Required.
  domain: '',                // informational only
  handle: '',                // e.g. '@yourbrand' — shown in the Instagram section
  igUrl: '',                 // social links; blank hides the icon
  tiktokUrl: '',
  whatsapp: '',              // international format, digits only, e.g. '972501234567'
  email: '',
  address: '',
  announcement: '',          // ticker line; blank hides the ticker band
  footerLine: '',            // one-liner under the footer wordmark
  currency: '$',             // prefix symbol, e.g. '$' / '₪' / '€'
  freeShipOver: 0,           // cart free-shipping bar threshold; 0 hides the bar
};

export const THEME = {
  // ---- colors (the five values that make the site yours) ----
  band: '#000000',           // announcement / header / footer background
  paper: '#ffffff',          // page background
  ink: '#000000',            // text on paper
  inkOnBand: '#fafafa',      // text on band
  accent: '#7FB850',         // ONE accent color
  muted: '#444444',          // secondary text (dropdown placeholder etc.)
  focus: '#116DFF',          // focus-ring color

  // ---- fonts (Google Fonts names; blank -> system stack) ----
  displayFont: 'Bebas Neue', // headings/nav/prices. Caps-only fonts render caps —
                             // the system NEVER sets text-transform.
  bodyFont: 'Jost',          // paragraphs, forms, policy text
  accentFont: '',            // one accent band on Home; blank -> displayFont

  // ---- shape ----
  commerceRadius: '20px',    // Add To Cart / Buy Now / Notify pills
  radius: '0px',             // everything else

  // ---- type scale (px). Swap the whole ramp per client if needed. ----
  // [hero-xl, hero-lg, h2/band, logo, category-h1, newsletter,
  //  pdp-h1, card-name, nav/ticker, card-price, accordion/button]
  scale: [100, 60, 40, 35, 32, 30, 28, 18, 17, 16, 15],

  // ---- motion. The ONLY two transitions in the system. ----
  motion: { fade: '0.2s ease', recolor: '0.2s ease-in-out' },
};

// Category photo bands on Home + shop filters. img '' -> placeholder band.
export const CATEGORIES = [
  // { id: 'tops', label: 'Tops', img: '' },
];

// index 0 is the current drop (its heroImg is the Home hero).
// photos[] are the lookbook bands. shopNowHref optional.
export const DROPS = [
  // { id: 'drop-1', label: 'Drop One', sub: '', note: '', heroImg: '',
  //   photos: ['', '', ''], shopNowHref: '/shop' },
];

// sizeLabel falls back to 'Size'. family groups cuts of one print for the
// PDP "Complete the set" strip. soldOut: true -> Out of stock states.
// desc optional — PDP omits the description without it.
export const PRODUCTS = [
  // { id: 'example-tie-bottom', name: 'EXAMPLE TIE BOTTOM', price: 60,
  //   cat: 'bottoms', drop: 'drop-1', sizes: ['XS','S','M','L'],
  //   sizeLabel: 'Bottom Size', family: 'example', cut: 'Tie Bottom',
  //   soldOut: false, desc: '', imgs: ['', ''] },
];

// Content pages served at /p/<slug>. Omit a slug to remove it from the footer.
// body is an array of paragraph strings (kept as blocks so a second language
// can be added later without a refactor).
export const PAGES = {
  // 'about':             { title: 'About', body: ['...'] },
  // 'shipping-returns':  { title: 'Shipping & Returns', body: ['...'] },
  // 'store-policy':      { title: 'Store Policy', body: ['...'] },
  // 'privacy-policy':    { title: 'Privacy Policy', body: ['...'] },
  // 'product-care':      { title: 'Product Care', body: ['...'] }, // also feeds the PDP accordion
};

export const SIZE_GUIDE = {
  enabled: false,
  tables: [
    // { title: 'Top guide', cols: ['Size', 'Bust'],
    //   rows: [['XS', '76-80 cm'], ['S', '80-84 cm']] },
  ],
};

// Static Instagram grid — no API. 6 shown, "Load more" reveals 6 more.
export const IG_POSTS = [
  // { img: '', caption: '', url: 'https://instagram.com/p/...' },
];

export const FEATURES = {
  cart: true,
  cartDrawer: true,          // drawer on add-to-cart; false -> toast only
  checkout: false,           // false -> "Order on WhatsApp" handoff
  search: true,
  giftCard: [50, 100, 150, 200], // array = enabled with these presets; false = off
  drops: true,
  instagram: true,
  newsletter: true,
  accounts: false,           // false -> account icon toasts "coming soon"
  wishlist: false,           // reference has none; off by default
  notifyWhenAvailable: true, // sold-out PDP email capture UI
  stickyHeader: true,
};

// All blank for now. KEYS drives nothing until a value is set.
export const KEYS = {
  paymentProvider: '',
  publicKey: '',
  newsletterEndpoint: '',
  analyticsId: '',
  metaPixelId: '',
  googleClientId: '',        // Google OAuth Client ID for /signup's "Sign in
                              // with Google" button. Same value as the
                              // backend's GOOGLE_CLIENT_ID env var. Blank ->
                              // button doesn't render, email+password still works.
};

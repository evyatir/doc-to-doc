// Demo client — a deliberately GENERIC storefront used to show prospects what
// the system does. Product names, collections and copy are placeholders on
// purpose: everything in angle brackets <like this> is content the client
// supplies. Structure (3 categories, 3 collections, colour-variant families,
// sold-out states, size guide) is kept real so the features actually demo.
//
// All images blank -> tinted placeholders. See clients/_template/config.js
// for full field documentation.

export const BRAND = {
  name: 'DEMO',
  domain: 'demostorefront.online',
  handle: '@demo_swim',
  igUrl: 'https://www.instagram.com/',
  tiktokUrl: 'https://www.tiktok.com/',
  whatsapp: '972544407698',
  email: 'hello@demostorefront.online',
  address: '<Your address>',
  announcement: '<Your announcement line goes here>',
  footerLine: '<Your one-line tagline>',
  currency: '₪',
  freeShipOver: 300,
};

export const THEME = {
  band: '#000000',
  paper: '#ffffff',
  ink: '#000000',
  inkOnBand: '#fafafa',
  accent: '#7FB850',
  muted: '#444444',
  focus: '#116DFF',
  displayFont: 'Bebas Neue',
  bodyFont: 'Jost',
  accentFont: 'Chivo Mono',
  commerceRadius: '20px',
  radius: '0px',
  scale: [100, 60, 40, 35, 32, 30, 28, 18, 17, 16, 15],
  motion: { fade: '0.2s ease', recolor: '0.2s ease-in-out' },
};

export const CATEGORIES = [
  { id: 'tops', label: 'Tops', img: '' },
  { id: 'bottoms', label: 'Bottoms', img: '' },
  { id: 'accessories', label: 'Accessories', img: '' },
];

export const DROPS = [
  {
    id: 'collection-1', label: 'Collection 1', sub: '<Collection subtitle>',
    note: 'Drop 3', heroImg: '', photos: ['', '', ''], shopNowHref: '/shop',
  },
  {
    id: 'collection-2', label: 'Collection 2', sub: '<Collection subtitle>',
    note: 'Drop 2', heroImg: '', photos: ['', '', ''],
  },
  {
    id: 'collection-3', label: 'Collection 3', sub: '<Collection subtitle>',
    note: 'Drop 1', heroImg: '', photos: ['', ''],
  },
];

// NOTE: `name` here must match the product name in the database — seed.js keys
// on it. Renaming a product means renaming the DB row too, not just this file.
export const PRODUCTS = [
  { id: 'product-1', name: 'Product 1', price: 220,
    cat: 'bottoms', drop: 'collection-1', sizes: ['XS', 'S', 'M', 'L'],
    sizeLabel: 'Size', family: 'family-1', cut: 'Style A',
    imgs: ['', ''] },
  { id: 'product-2', name: 'Product 2', price: 220,
    cat: 'tops', drop: 'collection-1', sizes: ['XS', 'S', 'M', 'L'],
    sizeLabel: 'Size', family: 'family-1', cut: 'Style B',
    imgs: ['', ''] },
  { id: 'product-3', name: 'Product 3', price: 220,
    cat: 'bottoms', drop: 'collection-1', sizes: ['XS', 'S', 'M', 'L'],
    sizeLabel: 'Size', family: 'family-2', cut: 'Style A',
    desc: '<Product description — a sentence or two about this item, shown on the product page.>',
    imgs: ['', ''] },
  { id: 'product-4', name: 'Product 4', price: 220,
    cat: 'tops', drop: 'collection-1', sizes: ['XS', 'S', 'M', 'L'],
    sizeLabel: 'Size', family: 'family-2', cut: 'Style B',
    imgs: ['', ''] },
  { id: 'product-5', name: 'Product 5', price: 220,
    cat: 'bottoms', drop: 'collection-1', sizes: ['XS', 'S', 'M', 'L'],
    sizeLabel: 'Size', family: 'family-3', cut: 'Style A',
    imgs: ['', ''] },
  { id: 'product-6', name: 'Product 6', price: 220,
    cat: 'tops', drop: 'collection-1', sizes: ['XS', 'S', 'M', 'L'],
    sizeLabel: 'Size', family: 'family-3', cut: 'Style B',
    imgs: ['', ''] },
  { id: 'product-7', name: 'Product 7', price: 220,
    cat: 'bottoms', drop: 'collection-2', sizes: ['XS', 'S', 'M', 'L'],
    sizeLabel: 'Size', imgs: ['', ''] },
  { id: 'product-8', name: 'Product 8', price: 220,
    cat: 'bottoms', drop: 'collection-3', sizes: ['XS', 'S', 'M', 'L'],
    sizeLabel: 'Size', soldOut: true, imgs: ['', ''] },
  { id: 'product-9', name: 'Product 9', price: 40,
    cat: 'accessories', drop: 'collection-2', sizes: ['One size'], imgs: ['', ''] },
  { id: 'product-10', name: 'Product 10', price: 40,
    cat: 'accessories', drop: 'collection-2', sizes: ['One size'], soldOut: true,
    imgs: ['', ''] },
  { id: 'product-11', name: 'Product 11', price: 20,
    cat: 'accessories', drop: 'collection-3', sizes: ['One size'], imgs: ['', ''] },
];

export const PAGES = {
  'about': {
    title: 'About Us',
    body: [
      '<Your story goes here — a paragraph about how the brand started and what it stands for.>',
      '<Second paragraph — materials, how things are made, what makes you different.>',
      '<A closing line or slogan.>',
    ],
  },
  'shipping-returns': {
    title: 'Shipping & Returns',
    body: [
      '<Shipping times — e.g. how many business days until orders ship, and any free-shipping threshold.>',
      '<Returns and exchanges — the window, the condition items must be in, and how a customer starts one.>',
    ],
  },
  'store-policy': {
    title: 'Store Policy',
    body: [
      '<Terms of use — the agreement between you and visitors to the site.>',
      '<What the site sells and how orders are handled.>',
      '<Intellectual property and accepted payment methods.>',
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    body: [
      '<What customer information you collect, and why.>',
      '<How long it is kept and who it is shared with.>',
      '<How a customer can access or delete their information.>',
    ],
  },
  'product-care': {
    title: 'Product Care',
    body: [
      '<Care instructions — washing, drying, and anything customers should avoid.>',
    ],
  },
};

export const SIZE_GUIDE = {
  enabled: true,
  tables: [
    { title: 'Top guide', cols: ['Size', 'Bust'],
      rows: [
        ['XS', '76-80 cm'], ['S', '80-84 cm'], ['M', '84-88 cm'], ['L', '88-92 cm'],
      ] },
    { title: 'Bottoms guide', cols: ['Size', 'Hips', 'Waist'],
      rows: [
        ['XS', '83-89 cm', '60-64 cm'], ['S', '89-94 cm', '64-68 cm'],
        ['M', '94-99 cm', '68-72 cm'], ['L', '99-106 cm', '72-76 cm'],
      ] },
  ],
};

export const IG_POSTS = [
  { img: '', caption: '<caption 1>', url: 'https://www.instagram.com/' },
  { img: '', caption: '<caption 2>', url: 'https://www.instagram.com/' },
  { img: '', caption: '<caption 3>', url: 'https://www.instagram.com/' },
  { img: '', caption: '<caption 4>', url: 'https://www.instagram.com/' },
  { img: '', caption: '<caption 5>', url: 'https://www.instagram.com/' },
  { img: '', caption: '<caption 6>', url: 'https://www.instagram.com/' },
  { img: '', caption: '<caption 7>', url: 'https://www.instagram.com/' },
  { img: '', caption: '<caption 8>', url: 'https://www.instagram.com/' },
  { img: '', caption: '<caption 9>', url: 'https://www.instagram.com/' },
  { img: '', caption: '<caption 10>', url: 'https://www.instagram.com/' },
  { img: '', caption: '<caption 11>', url: 'https://www.instagram.com/' },
  { img: '', caption: '<caption 12>', url: 'https://www.instagram.com/' },
];

export const FEATURES = {
  cart: true,
  cartDrawer: true,
  checkout: false,
  search: true,
  giftCard: [50, 100, 200, 300],
  drops: true,
  instagram: true,
  newsletter: true,
  accounts: false,
  wishlist: false,
  notifyWhenAvailable: true,
  stickyHeader: true,
};

export const KEYS = {
  paymentProvider: '',
  publicKey: '',
  newsletterEndpoint: '',
  analyticsId: '',
  metaPixelId: '',
};

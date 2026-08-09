// ============================================================================
// CLIENT CONFIG — Doc. to Doc.
// Mentorship for med-school applicants, run by practicing doctors.
// Primary conversion goal: get a name + phone/email into /contact so the
// team can call the applicant back — NOT a checkout flow. Packages below use
// the storefront's product grid as a browsable "what we offer" list; the
// WhatsApp handoff (checkout: false) doubles as a fast inquiry channel.
// ============================================================================

export const BRAND = {
  name: 'Doc. to Doc.',
  domain: '',                          // TODO: fill in once a domain is picked
  handle: '',                          // TODO: '@doctodoc' if/when IG exists
  igUrl: '',
  tiktokUrl: '',
  whatsapp: '972500000000',            // TODO: replace with the real WhatsApp number
  email: 'hello@doctodoc.example',     // TODO: replace with the real inbox
  address: '',
  announcement: 'From applicants to doctors. Now your mentors.',
  footerLine: 'Mentorship for future doctors, from doctors who have been there.',
  currency: '₪',
  freeShipOver: 0,                     // no shipping — hides the cart shipping bar
};

export const THEME = {
  // ---- colors, read off the flyer: warm cream paper, deep espresso ink,
  // sage-green accent (the book spine / stethoscope tubing) ----
  band: '#2A160C',
  paper: '#F4E9D8',
  ink: '#2A160C',
  inkOnBand: '#F4E9D8',
  accent: '#7C8B69',
  muted: '#7A6552',
  focus: '#3E6B4F',

  // ---- fonts: a serif display to match the flyer's "Doc. to Doc." wordmark,
  // a warm serif body for a mentorship/academic (not retail) feel ----
  displayFont: 'Playfair Display',
  bodyFont: 'Lora',
  accentFont: 'Cormorant Garamond',

  // ---- shape: soft, not sharp — this is a care/mentorship brand, not streetwear ----
  commerceRadius: '999px',
  radius: '6px',

  scale: [100, 60, 40, 35, 32, 30, 28, 18, 17, 16, 15],
  motion: { fade: '0.2s ease', recolor: '0.2s ease-in-out' },
};

// Home page bands + shop filters. Each is a mentorship track, not a product
// category in the retail sense.
export const CATEGORIES = [
  { id: 'application-review', label: 'Application Review', img: '' },
  { id: 'interview-coaching', label: 'Interview Coaching', img: '' },
  { id: 'exam-prep', label: 'Entrance Exam Prep', img: '' },
];

// index 0 -> Home hero.
export const DROPS = [
  {
    id: 'mentorship',
    label: 'Doc. to Doc. Mentorship',
    sub: 'From applicants to doctors. Now your mentors.',
    note: 'Every mentor is a practicing doctor who was once in your seat.',
    heroImg: '',
    photos: ['', '', ''],
  },
];

// Packages, browsable like products. "sizes" repurposed as package tiers.
export const PRODUCTS = [
  {
    id: 'application-review',
    name: 'Application Review',
    price: 450,
    cat: 'application-review',
    drop: 'mentorship',
    sizes: ['Single Review', '3-Round Review'],
    sizeLabel: 'Package',
    desc: 'Line-by-line feedback on your personal statement and application from a doctor who has sat on an admissions committee.',
    imgs: ['', ''],
  },
  {
    id: 'interview-coaching',
    name: 'Interview Coaching',
    price: 600,
    cat: 'interview-coaching',
    drop: 'mentorship',
    sizes: ['1 Session', '3 Sessions', '6 Sessions'],
    sizeLabel: 'Sessions',
    desc: 'Mock interviews and real-time feedback from doctors who conduct admissions interviews.',
    imgs: ['', ''],
  },
  {
    id: 'exam-prep-track',
    name: 'Entrance Exam Prep Track',
    price: 1800,
    cat: 'exam-prep',
    drop: 'mentorship',
    sizes: ['Monthly', '3-Month Track'],
    sizeLabel: 'Plan',
    desc: 'Ongoing 1:1 mentorship through your entrance exam prep, paired with a doctor-mentor for the full track.',
    imgs: ['', ''],
  },
];

export const PAGES = {
  'about': {
    title: 'About Doc. to Doc.',
    body: [
      'Doc. to Doc. pairs medical school applicants with practicing doctors who were once applicants themselves.',
      'Every mentor on our team has been through the application, the interview, and the exam you are preparing for now — and remembers exactly what it felt like.',
      "We don't just review your application. We tell you what an admissions committee actually sees when they read it.",
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    body: [
      'We collect only the contact details you give us — name, phone, and email — to get back to you about mentorship, and, if you create an account, the details on that form.',
      'Passwords are stored as a one-way hash, never in plain text. If you sign in with Google, we never see or store your Google password.',
      'We never sell or share your information with third parties.',
    ],
  },
};

export const SIZE_GUIDE = { enabled: false, tables: [] };

export const IG_POSTS = [];

export const FEATURES = {
  cart: true,                          // browse packages, "add to bag"
  cartDrawer: true,
  checkout: false,                     // false -> WhatsApp handoff = fast inquiry, no payment collected
  search: true,
  giftCard: false,
  drops: true,                         // powers the Home hero
  instagram: false,                    // no IG content yet — flip on with real posts
  newsletter: true,                    // secondary low-friction capture: "stay updated"
  accounts: true,                      // /signup — email+password, or Google if KEYS.googleClientId is set
  wishlist: false,
  notifyWhenAvailable: false,
  stickyHeader: true,
};

export const KEYS = {
  paymentProvider: '',
  publicKey: '',
  newsletterEndpoint: '',
  analyticsId: '',
  metaPixelId: '',
  googleClientId: '',        // TODO: paste the Google OAuth Client ID here
                              // (console.cloud.google.com/apis/credentials)
                              // AND set the same value as GOOGLE_CLIENT_ID in
                              // the backend .env — until then the Google
                              // button on /signup stays hidden and only
                              // email+password sign-up works.
};

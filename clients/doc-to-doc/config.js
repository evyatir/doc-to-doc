// ============================================================================
// CLIENT CONFIG — Doc. to Doc.
// A consultancy helping future medical students choose the right med school
// in Europe, navigate applications, and prepare for what comes next — guided
// by doctors and medical students who've made the journey themselves.
//
// This is NOT a storefront: no cart, no checkout, no product catalog. The
// core conversion action is booking a free 15-minute intro call.
// Rebuilt from the client's "WEBSITE GENERAL IDEA" brief (2026-08-16) —
// real copy, palette, and team bios come from that doc; anything still a
// placeholder is marked TODO below.
// ============================================================================

export const BRAND = {
  name: 'Doc. to Doc.',
  domain: '',                          // TODO: fill in once a domain is picked
  logo: new URL('./assets/logo.png', import.meta.url).href,
  igUrl: '',                           // TODO
  whatsapp: '972500000000',            // TODO: replace with the real WhatsApp number
  email: 'hello@doctodoc.example',     // TODO: replace with the real inbox
  address: '',
  tagline: 'From applicants to doctors. Now your mentors.',
  footerLine: 'Guided by doctors and medical students who made the journey before you.',
};

export const THEME = {
  // ---- colors, the client's exact palette ----
  band: '#FFFFFF',        // header/footer background — same as paper, no dark band
  paper: '#FFFFFF',       // white page background (client request, 2026-09-04)
  ink: '#5C381C',         // dark brown — body text, headlines
  inkOnBand: '#5C381C',   // header/footer text (band === paper here)
  accent: '#A63C06',      // rust — CTAs, step numbers, links
  muted: '#8C6F53',       // derived mid-brown for secondary text (not in the swatch, chosen to sit between ink and paper)
  focus: '#679436',       // sage green — focus rings, ties back to the logo's green
  green: '#679436',       // the logo's green, for text on the white page
  greenOnDark: '#8CBF5B', // lighter tint of the same green, for the dark brown band
                          // (#679436 on #5C381C is only 2.9:1 — unreadable)
  terracotta: '#C65F45',  // fourth swatch from the client's palette — accents/details

  displayFont: 'Playfair Display',   // headlines — matches the brief's serif mockups
  bodyFont: 'Lora',
  accentFont: '',                    // italics applied via CSS, not a second family

  commerceRadius: '6px',   // primary CTA buttons — small rectangle, not a pill (per mockup)
  radius: '10px',          // cards

  scale: [64, 44, 34, 32, 30, 26, 24, 20, 17, 16, 15],
  motion: { fade: '0.2s ease', recolor: '0.2s ease-in-out' },
};

// Primary nav, left to right. "What we do" was explicitly removed per brief;
// FAQ leads toward testimonials, so both get their own link; Book stays as
// the one strong CTA button, not a plain nav link.
export const NAV = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/who-we-are', label: 'Who we are' },
  { to: '/faq', label: 'FAQ' },
  { to: '/testimonials', label: 'What they say about us' },
];

// Hero. The client asked (2026-09-04) to show the logo on the right instead
// of a photo. Set `photoIsLogo: false` and point `photo` at a real image in
// clients/doc-to-doc/assets/ when the studying-together photograph exists.
export const HERO = {
  eyebrow: 'real doctors · real med-school experience · zero corporate nonsense',
  headline: ['So, you want to', 'become a doctor?'],
  body: "Good. We know a few things about that. We went from applicants to med students to doctors — now we help future doctors choose the right school, apply smarter, and know what they're actually signing up for.",
  ctaPrimary: { label: "LET'S GET YOU INTO MED SCHOOL", href: '/book' },
  ctaSecondary: { label: 'See how it works', href: '/how-it-works' },
  photo: new URL('./assets/logo.png', import.meta.url).href,
  photoIsLogo: true,
  photoCaption: '',
};

// Book a Consultation — the brief describes this page as an emotional hook
// with a single button that opens ("the toggle for") the actual intake form
// + calendar. BOOK is the hook; the toggled section's copy lives inline in
// BookConsultation.jsx since it's mockup-exact ("Let's start with 15 minutes").
export const BOOK = {
  headline: ["Your medical journey doesn't start", 'on your first day of medical school.'],
  sub: "It starts with knowing where you're going.",
  cta: 'Book a Consultation',
};

// The "in-between" quote section from the brief — sits between the hero
// area and the deeper pages, doesn't have its own nav item.
export const REASSURANCE = {
  questions: [
    'Which country should I apply to?',
    'What grades do I need?',
    'Which entrance exams should I take?',
    'Is studying medicine abroad right for me?',
    'What is medical school actually like?',
  ],
  line: "You don't need to figure it out alone.",
};

// How It Works — four steps, as scoped in the brief. Step 1 is the free
// call; paid service starts at step 2.
export const STEPS = [
  {
    n: '01',
    title: 'Free 15-minute introduction call',
    body: 'You tell us briefly about yourself — your goals, your concerns, where you\'re stuck. We explain how Doc. to Doc. can help. No pressure, no pitch — just a real conversation. At the end, you decide if you want to continue.',
  },
  {
    n: '02',
    title: 'Find your best-fit schools',
    body: "This is where the paid service begins. We get to know you properly and help narrow down which universities and countries actually make sense for you — not just a list, but what each option is really like academically, practically, and personally.",
  },
  {
    n: '03',
    title: 'Build the application',
    body: 'Requirements, documents, deadlines, entrance exams, interviews, strategy — we help you organize the whole process so it feels manageable instead of overwhelming.',
  },
  {
    n: '04',
    title: 'Get ready for day one',
    body: "Getting in isn't the finish line. We help you understand what medical school is actually like and prepare you to start — the part that sets us apart from a normal admissions agency.",
  },
];

export const HOW_IT_WORKS = {
  headline: ['We make the confusing part', 'less confusing.'],
  quote: {
    kicker: 'WHY DOC. TO DOC.',
    text: 'Google can tell you the entry requirements. We can tell you what the next six years actually feel like.',
  },
};

// Who We Are — real team from the brief. Photos intentionally blank until
// the real ones are dropped into assets/ (client has them, tone just needs
// a light edit per the brief).
export const TEAM = {
  headline: 'founded by doctors and medical students who exactly know where you are right now.',
  intro: 'We were in your shoes not long ago.',
  body: "We've lived the applications, the doubts, the interviews, the excitement, the homesickness, the all-nighters, the exams, the mistakes — and everything in between. Now we're here to make your journey a whole lot smoother (and a lot less stressful).",
  // Top-of-page photo. Virginia's portrait for now (client request,
  // 2026-09-04) — swap for a real group photograph when one exists.
  groupPhoto: new URL('./assets/virginia.jpg', import.meta.url).href,
  members: [
    {
      name: 'Gal Yahav',
      country: 'Israel',
      role: 'Final year medical student',
      quote: 'I color-code my notes and my life.',
      bio: "The planner of the group and probably the one who made the spreadsheets you'll secretly fall in love with.",
      tag: 'Runs on coffee, curiosity and Spotify.',
      photo: new URL('./assets/gal-avatar.jpg', import.meta.url).href,
    },
    {
      name: 'Virginia Pincelli',
      country: 'Italy',
      role: 'Doctor',
      quote: 'I overpack. Always.',
      bio: 'The organized one with a soft spot for stationery and people. Will hype you up when you need it most.',
      tag: 'Collects passport stamps and inside jokes.',
      photo: new URL('./assets/virginia-avatar.jpg', import.meta.url).href,
    },
    {
      name: 'Andrea Pereira',
      country: 'India',
      role: 'Doctor',
      quote: 'I pretend to study. Then I do.',
      bio: 'Calm, practical and always two steps ahead. Knows the system inside out (and the shortcuts too).',
      tag: 'Can solve (almost) anything with logic.',
      photo: '',
    },
    {
      name: 'Ishit Karadikar',
      country: 'India',
      role: 'Doctor',
      quote: 'Probably thinking about food.',
      bio: 'The realist with the kindest heart. Will tell you the truth — and then make you laugh about it.',
      tag: 'Professional overthinker and snack enthusiast.',
      photo: '',
    },
  ],
};

// FAQ — the four questions from the brief's mockup, plus one pushing the
// free-call idea (the brief explicitly asked to push that harder). Answers
// are a first draft — review before publishing, especially the admissions
// one: never overpromise a guarantee.
export const FAQ = [
  {
    q: 'What happens on the free 15-minute call?',
    a: "It's a real conversation, not a sales pitch. You tell us where you're at — your goals, your grades, what's confusing you — and we explain honestly whether and how we can help. No obligation to continue afterward.",
  },
  {
    q: 'Which European countries do you help with?',
    a: 'We work across the main European destinations for international medical students. Which ones make sense for you depends on your grades, budget, and entrance-exam options — that\'s exactly what we cover on your call.',
  },
  {
    q: 'Do you guarantee admission?',
    a: "No one ethically can, and we won't pretend otherwise. What we do guarantee is that you'll apply with a strategy, real information about each school, and a doctor in your corner the whole way — not a generic checklist.",
  },
  {
    q: 'Is this only for students?',
    a: "Not at all. We work with students directly and with parents who want to understand the process before their kid dives in. The consultation form asks which one you are so we can pitch the conversation right.",
  },
  {
    q: 'Can you help after I get accepted?',
    a: "Yes — that's a deliberate part of the service. Getting in is not the finish line for us. We help you understand what medical school is actually like and get ready for day one.",
  },
];

// Testimonials — none collected yet ("we need to ask people to get some",
// per the brief). Ship the page with an honest empty state rather than
// fabricated quotes; fill this array in once real reviews come in.
export const TESTIMONIALS = [];

// Book a Consultation. Calendly (or Cal.com) embed URL — leave blank until
// a real scheduling account exists; the page falls back to the intake form
// alone (posts to /api/contact) so leads are never lost in the meantime.
export const KEYS = {
  calendlyUrl: '',          // TODO: paste the Calendly/Cal.com scheduling page URL
};

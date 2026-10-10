// The public site: one long page, a 1:1 port of the client's new front
// (doc-to-doc-mentors.galidoyahav.chatgpt.site, 2026-10-09). Markup, copy and
// class names match it exactly so its compiled stylesheet (site.css) applies
// unchanged. The original used Radix (accordion, sheet) and lucide; both are
// used the same way here (shadcn wrappers inlined); lucide icons are inlined
// with the same paths and attributes.
import React, { useEffect, useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Dialog from '@radix-ui/react-dialog';
import Consent, { openConsent } from './Consent.jsx';
import { BookingProvider, useBooking, bookingCss } from './Booking.jsx';

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

const EMAIL = 'Doctodocmentors@gmail.com';
const BOOK_HREF = `mailto:${EMAIL}?subject=Let's%20arrange%20a%20free%20introductory%20call&body=Hi%20Doc.%20to%20Doc.%2C%0A%0AI'd%20love%20to%20arrange%20a%20free%20introductory%20call.%0A%0AMy%20name%3A%0AWhere%20I%20am%20in%20my%20journey%3A%0AWhat%20I'd%20like%20help%20with%3A%0AMy%20availability%20and%20time%20zone%3A%0A%0AThank%20you!`;
const INSTAGRAM = 'https://www.instagram.com/doctodcomentor/';

const NAV = [
  { title: 'Who we are', href: '#who-we-are' },
  { title: 'How we help', href: '#how-we-help' },
  { title: 'Your journey', href: '#your-journey' },
  { title: 'Contact', href: '#contact' },
];

const MENTORS = [
  { name: 'Virginia Pincelli', image: 'virginia', role: 'Doctor', education: 'Graduated from the First Faculty of Medicine, Charles University, Prague' },
  { name: 'Gal Yahav', image: 'gal', role: 'Medical student', education: 'First Faculty of Medicine, Charles University, Prague' },
  { name: 'Andrea Pereira', image: 'andrea', role: 'Doctor', education: 'Graduated from the First Faculty of Medicine, Charles University, Prague' },
  { name: 'Ishit Karandikar', image: 'ishit', role: 'Doctor', education: 'Graduated from the First Faculty of Medicine, Charles University, Prague' },
];

const STEPS = [
  { title: 'Let’s meet', text: 'A free introductory call to discuss your goals, questions, and plans for studying medicine.', note: 'Every journey starts with a conversation.' },
  { title: 'Find your fit', text: 'Together, we explore medical schools and build a shortlist that suits your priorities.', note: 'Your future. Your choice.' },
  { title: 'Get application-ready', text: 'We help you organise your documents, understand requirements, and review your applications.', note: 'The details matter.' },
  { title: 'Take the next step', text: 'Receive guidance through the application process and prepare for the transition to medical school.', note: 'One step closer.' },
];

const FAQ = [
  ['Who is Doc. to Doc. for?', 'We support people considering medical school in Europe, from those exploring the idea to applicants preparing their next steps. Our mentoring draws on firsthand experience of applying, studying medicine, and living abroad.'],
  ['Do I need to know which university I want?', 'No. We can help you explore medical schools and build a shortlist around your goals, priorities, and circumstances. You don’t need to have it all figured out before we meet.'],
  ['What does application support include?', 'We help you understand the steps for your chosen applications, organise your documents, and prepare and review your application materials. We can also discuss your questions about studying medicine and moving abroad.'],
  ['Can you guarantee admission?', 'No. Admission decisions belong to each university and cannot be guaranteed. Our role is to help you approach the application process with greater clarity, organisation, and confidence.'],
  ['How do I get started?', 'Arrange a free introductory call. Tell us where you are in your journey and what you would like help with. Pick a time that suits you and we’ll send you a Google Meet link for a 30-minute call.'],
];

// lucide icons used by the original, same paths and default attributes.
const ICONS = {
  'arrow-down': ['M12 5v14', 'm19 12-7 7-7-7'],
  'arrow-up-right': ['M7 7h10v10', 'M7 17 17 7'],
  'chevron-down': ['m6 9 6 6 6-6'],
  menu: ['M4 5h16', 'M4 12h16', 'M4 19h16'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
};

function Icon({ name, size = 24, className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`lucide lucide-${name} ${className}`.trim()} aria-hidden="true">
      {ICONS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

function BookButton({ className = '', children = 'Book a free introductory call' }) {
  const { openPopup } = useBooking();
  // Opens the booking pop-up; the mailto: href stays as the no-JS fallback.
  return (
    <a className={`button ${className}`} href={BOOK_HREF} onClick={(e) => { e.preventDefault(); openPopup(); }}>
      {children}
      <Icon name="arrow-up-right" size={19} />
    </a>
  );
}

// shadcn/ui Sheet, as the original composes it (Radix Dialog underneath).
function MobileMenu({ open, onOpenChange }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild data-slot="sheet-trigger">
        <button className="menu-trigger" aria-label="Open menu"><Icon name="menu" size={25} /></button>
      </Dialog.Trigger>
      <Dialog.Portal data-slot="sheet-portal">
        <Dialog.Overlay data-slot="sheet-overlay"
          className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content data-slot="sheet-content"
          className="fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500 inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm mobile-sheet">
          <div className="mobile-menu-top">
            <Dialog.Title data-slot="sheet-title" className="font-semibold text-foreground menu-wordmark">Doc. to Doc.</Dialog.Title>
            <Dialog.Close data-slot="sheet-close" className="menu-close" aria-label="Close menu"><Icon name="x" size={25} /></Dialog.Close>
          </div>
          <Dialog.Description data-slot="sheet-description" className="text-sm text-muted-foreground sr-only">Navigate the Doc. to Doc. website</Dialog.Description>
          <nav aria-label="Mobile navigation">
            {NAV.map((item, i) => (
              <a key={item.href} href={item.href} onClick={() => onOpenChange(false)}>
                <span>0{i + 1}</span>{item.title}
              </a>
            ))}
          </nav>
          <BookButton className="mobile-book" />
          <p className="handwritten">Let’s find your way.</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// shadcn/ui Accordion, as the original composes it.
function Faq() {
  return (
    <Accordion.Root data-slot="accordion" type="single" collapsible className="faq-list">
      {FAQ.map(([q, a], i) => (
        <Accordion.Item key={q} value={`faq-${i}`} data-slot="accordion-item" className="border-b last:border-b-0">
          <Accordion.Header className="flex">
            <Accordion.Trigger data-slot="accordion-trigger"
              className="flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180">
              <span className="faq-number">0{i + 1}</span>
              <span className="faq-question">{q}</span>
              <Icon name="chevron-down" className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content data-slot="accordion-content"
            className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="pt-0 pb-4"><p>{a}</p></div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

function Hero() {
  return (
    <section className="hero-track hero-static" aria-label="Your journey into medicine">
      <div className="hero-sticky">
        <div className="hero-masthead" aria-hidden="true">doc. <i>to</i> doc.</div>
        <figure className="hero-team">
          <img src={asset('team-on-steps.webp')} width="1200" height="1789" fetchpriority="high"
            alt="The four Doc. to Doc. mentors sitting together on university steps with medical books and stethoscopes" />
          <figcaption>Your people. From the very first step.</figcaption>
        </figure>
        <div className="hero-content">
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h1>From applicants<br />to doctors.<br /><em>Now your mentors.</em></h1>
          <p className="hero-description">Personal guidance for your journey to medical school in Europe—from choosing where to apply to preparing your next step.</p>
          <div className="hero-actions">
            <BookButton />
            <a className="text-link" href="#who-we-are">Meet your mentors <Icon name="arrow-down" size={16} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Site() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll-reveal, as in the original: add .is-visible once 12% is on screen.
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll('.reveal, .journey-map').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // A refresh always starts at the top: drop any #section left by in-page
  // links and stop the browser restoring the old scroll position. A fresh
  // visit to a deep link (old multi-page URLs land on /#faq etc.) still
  // jumps to its section once the sections exist.
  useEffect(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav?.type === 'reload') {
      history.scrollRestoration = 'manual';
      if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
      window.scrollTo(0, 0);
      return;
    }
    const id = window.location.hash.slice(1);
    if (!id) return undefined;
    // Jump now, and again once images and fonts have settled the layout.
    const jump = () => document.getElementById(id)?.scrollIntoView();
    jump();
    if (document.readyState === 'complete') return undefined;
    window.addEventListener('load', jump, { once: true });
    return () => window.removeEventListener('load', jump);
  }, []);

  return (
    <BookingProvider>
      <style>{bookingCss}</style>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="site-header">
        <div className="header-inner wrap">
          <a href="#" className="brand" aria-label="Doc. to Doc. home">
            <img src={asset('logo-header.webp')} width="562" height="409" alt="Doc. to Doc." />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {NAV.map((item) => <a key={item.href} href={item.href}>{item.title}</a>)}
          </nav>
          <BookButton className="header-book" />
          <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
        </div>
      </header>

      <main id="main">
        <Hero />

        <section id="introduction" className="introduction wrap section-space">
          <div className="intro-copy reveal">
            <p className="handwritten intro-note">It’s about</p>
            <h2>the doctor<br />you’re going<br />to become.</h2>
            <p>Choosing a medical school is a big decision. You don’t have to figure it all out on your own.</p>
            <a href="#how-we-help" className="text-link">Find your next step <Icon name="arrow-up-right" size={18} /></a>
          </div>
          <figure className="intro-photo reveal">
            <img src={asset('mentors-study-artwork.webp')} width="1122" height="1402" loading="lazy"
              alt="Doc. to Doc. artwork showing four mentors around anatomy books and laptops against a deep blue background" />
            <figcaption className="handwritten">There’s a future doctor in you.</figcaption>
          </figure>
          <figure className="intro-detail reveal">
            <img src={asset('study-conversation.webp')} width="1122" height="1402" loading="lazy"
              alt="A warmly lit study desk with a laptop, books and plants, overlaid with a message asking what are you up to these days" />
            <figcaption>THE BIG DREAM.<br />THE LITTLE EVERYDAY STEPS.</figcaption>
          </figure>
          <div className="intro-closing reveal">
            <p>We bring firsthand experience, personal guidance, and a little perspective to your next chapter.</p>
            <h3>No two journeys<br />are ever the same.</h3>
            <span className="handwritten">Let’s find yours.</span>
          </div>
        </section>

        <section id="who-we-are" className="about-section section-space">
          <div className="wrap">
            <div className="about-heading reveal">
              <p className="eyebrow">01 / WHO WE ARE</p>
              <h2>We’ve been<br /><em>where you are.</em></h2>
            </div>
            <div className="team-scene reveal">
              <img className="team-photo" src={asset('team.webp')} width="1500" height="1006" loading="lazy"
                alt="Andrea, Gal, Virginia and Ishit spending time together on a park bench" />
            </div>
            <div className="about-copy reveal">
              <h3>Doctors. Medical students.<br /><em>Your people.</em></h3>
              <p>Founded by doctors and medical students who know where you are right now. We bring our own experience of applications, studying abroad, and life in medical school to help you take your next step with greater clarity and confidence.</p>
            </div>
            <div className="founder-heading">
              <p className="eyebrow">MEET YOUR MENTORS</p>
              <span className="handwritten">The people in your corner</span>
            </div>
            <div className="founders">
              {MENTORS.map((m) => (
                <figure key={m.image} className="founder reveal">
                  <div className="founder-image">
                    <img src={asset(`${m.image}.webp`)} width="750" height="503" alt={m.name} loading="lazy" />
                  </div>
                  <figcaption>
                    <h3>{m.name}</h3>
                    <span className="mentor-role">{m.role}</span>
                    <span className="mentor-education">{m.education}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="how-we-help" className="help-anatomy" aria-labelledby="help-anatomy-title">
          <div className="anatomy-poster">
            <p className="anatomy-kicker">HOW WE HELP</p>
            <h2 id="help-anatomy-title" className="anatomy-title"><span>( DOC. TO DOC. )</span>THE PATH TO<br />MEDICAL SCHOOL.</h2>
            <ol className="anatomy-services">
              <li className="anatomy-service anatomy-selection">
                <div className="service-step-heading">
                  <span className="anatomy-number" aria-hidden="true">01</span>
                  <p className="handwritten anatomy-note">what does your<br />future look like?</p>
                </div>
                <h3>( UNIVERSITY SELECTION )</h3>
                <p className="anatomy-description">Explore medical schools and build a shortlist around your goals, priorities, and circumstances. </p>
              </li>
              <li className="anatomy-service anatomy-application">
                <div className="service-step-heading">
                  <span className="anatomy-number" aria-hidden="true">02</span>
                  <p className="handwritten anatomy-note">where do you<br />want to go?</p>
                </div>
                <h3>(&nbsp;APPLICATION &amp;<br />DOCUMENTS&nbsp;)</h3>
                <p className="anatomy-description">Understand the application steps. Organise your documents. Get support preparing and reviewing your materials, with attention to every detail.</p>
              </li>
              <li className="anatomy-service anatomy-mentoring">
                <div className="service-step-heading">
                  <span className="anatomy-number" aria-hidden="true">03</span>
                  <p className="handwritten anatomy-note">a little guidance,<br />a little more confidence.</p>
                </div>
                <h3>( ONE-TO-ONE MENTORING )</h3>
                <p className="anatomy-description">Studying medicine. Moving abroad. Finding your feet. Talk it through with people who have firsthand experience, and someone in your corner.</p>
              </li>
            </ol>
          </div>
        </section>

        <section id="your-journey" className="journey-section section-space">
          <div className="wrap journey-layout">
            <div className="journey-intro">
              <p className="eyebrow">03 / YOUR JOURNEY WITH US</p>
              <h2>A little direction.<br /><em>A world of possibility.</em></h2>
              <figure className="journey-photo journey-logo reveal">
                <img src={asset('logo-blue.webp')} width="966" height="522" loading="lazy"
                  alt="Doc. to Doc. — From applicants to doctors. Now your mentors." />
              </figure>
              <span className="handwritten journey-note">Let’s take it together.</span>
            </div>
            <div className="journey-map">
              <svg className="journey-path" viewBox="0 0 660 930" preserveAspectRatio="none" fill="none" aria-hidden="true">
                <path d="M45 48C-15 90 55 211 194 207S260 103 207 119 243 252 376 269 620 324 613 434 384 472 237 485 51 503 44 545 34 671 159 710 327 618 274 617 284 795 408 800 551 829 601 883"
                  stroke="currentColor" strokeWidth="1.6" pathLength="1" />
              </svg>
              <ol className="journey-steps">
                {STEPS.map((s, i) => (
                  <li key={s.title} className={`journey-step step-${i + 1}`}>
                    <span className="step-dot" aria-hidden="true" />
                    <span className="step-number">0{i + 1}</span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                    <span className="handwritten">{s.note}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="faq" className="faq-section section-space wrap">
          <div className="faq-heading reveal">
            <p className="eyebrow">A LITTLE MORE CLARITY</p>
            <h2>Good questions.<br /><em>Honest answers.</em></h2>
            <p>Still wondering about something?<br /><a href={`mailto:${EMAIL}`} className="inline-link">We’re here to talk.</a></p>
          </div>
          <Faq />
        </section>

        <section id="contact" className="contact-section">
          <div className="wrap contact-layout">
            <figure className="contact-image reveal">
              <img src={asset('laptop-blue.webp')} width="1125" height="1398" loading="lazy"
                alt="A laptop displaying the Doc. to Doc. logo, ready for an online mentoring conversation" />
            </figure>
            <div className="contact-copy reveal">
              <p className="eyebrow">04 / LET’S TALK</p>
              <h2>Your next chapter starts with<br /><em>a conversation.</em></h2>
              <p>Tell us where you are in your journey, what you’re considering, and what you’d like help with.</p>
              <BookButton />
              <span className="booking-note">Pick a time that suits you — 30 minutes on Google Meet.</span>
              <div className="contact-links">
                <a href={`mailto:${EMAIL}`}>{EMAIL}<Icon name="arrow-up-right" size={17} /></a>
                <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Instagram · @doctodcomentor<Icon name="arrow-up-right" size={17} /></a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-wordmark" aria-hidden="true">doc. <i>to</i> doc.</div>
          <div className="footer-main">
            <a href="#" className="footer-logo footer-brand-text" aria-label="Doc. to Doc. home">Doc.<br />to Doc.</a>
            <p>From applicants to doctors.<br /><em>Now your mentors.</em></p>
            <nav aria-label="Footer navigation">
              {NAV.map((item) => <a key={item.href} href={item.href}>{item.title}</a>)}
            </nav>
            <a className="back-top" href="#" aria-label="Back to top"><Icon name="arrow-up-right" size={25} /></a>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Doc. to Doc.</span>
            <span>Personal guidance. Firsthand experience.</span>
            <span className="footer-legal">
              <a href={`${import.meta.env.BASE_URL}privacy`}>Privacy policy</a>
              {' · '}
              <button type="button" onClick={openConsent} style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer' }}>Cookie settings</button>
            </span>
          </div>
        </div>
      </footer>
      <Consent />
    </BookingProvider>
  );
}

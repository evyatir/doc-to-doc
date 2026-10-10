// Google Analytics 4 with Consent Mode v2. Storage stays denied until the
// visitor accepts in the cookie banner (Consent.jsx); the choice is kept in
// localStorage. /admin is never tracked (main.jsx only calls this on the site).
const GA_ID = 'G-5BSQ5SBEGS';
const CHOICE_KEY = 'dtd-consent';

window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }

export function getChoice() {
  try { return localStorage.getItem(CHOICE_KEY); } catch { return null; }
}

function consentState(granted) {
  const v = granted ? 'granted' : 'denied';
  return { analytics_storage: v, ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
}

export function setChoice(granted) {
  try { localStorage.setItem(CHOICE_KEY, granted ? 'granted' : 'denied'); } catch { /* private mode */ }
  gtag('consent', 'update', consentState(granted));
}

// Conversions: every "Book a free introductory call" button (it opens the
// booking pop-up), a confirmed booking (trackBooking, called
// by the picker), the plain email link, and Instagram.
function trackClicks() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    if (a.classList.contains('button') && a.href.startsWith('mailto:')) {
      const section = a.closest('section, header')?.id || (a.closest('header') ? 'header' : a.closest('.mobile-sheet') ? 'mobile-menu' : 'hero');
      gtag('event', 'book_call_click', { location: section });
    } else if (a.href.startsWith('mailto:')) {
      gtag('event', 'email_click');
    } else if (a.href.includes('instagram.com')) {
      gtag('event', 'instagram_click');
    }
  });
}

export function trackBooking() {
  gtag('event', 'booking_confirmed');
}

export function initAnalytics() {
  gtag('consent', 'default', { ...consentState(getChoice() === 'granted'), wait_for_update: 500 });
  gtag('js', new Date());
  gtag('config', GA_ID);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  trackClicks();
}

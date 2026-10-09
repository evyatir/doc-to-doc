// Cookie banner for Google Analytics. Shown until the visitor chooses; styled
// with the site's own tokens so it reads as part of the page.
import React, { useEffect, useState } from 'react';
import { getChoice, setChoice } from './analytics.js';

const bar = {
  position: 'fixed', left: 16, right: 16, bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', zIndex: 40,
  maxWidth: 560, marginInline: 'auto', padding: '18px 22px',
  background: 'var(--cream)', color: 'var(--brown)', border: '1px solid var(--border)',
  boxShadow: '0 10px 30px #2712031a', fontFamily: 'var(--font-current-sans)', fontSize: '.9rem', lineHeight: 1.55,
};
const actions = { display: 'flex', gap: 24, marginTop: 10, flexWrap: 'wrap' };
const btn = {
  background: 'none', border: 0, borderBottom: '1px solid', padding: '8px 0 4px', minHeight: 44,
  color: 'var(--orange)', font: 'inherit', cursor: 'pointer',
};

// "Cookie settings" links call this to bring the banner back.
const OPEN_EVENT = 'dtd-open-consent';
export const openConsent = () => window.dispatchEvent(new Event(OPEN_EVENT));

export default function Consent() {
  const [open, setOpen] = useState(() => getChoice() === null);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, []);
  if (!open) return null;
  const choose = (granted) => { setChoice(granted); setOpen(false); };
  return (
    <div role="region" aria-label="Cookie consent" style={bar}>
      <p style={{ margin: 0 }}>We use analytics cookies to understand how visitors find and use this site. Nothing is used for advertising. <a href={`${import.meta.env.BASE_URL}privacy`} style={{ color: 'var(--orange)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Privacy policy</a></p>
      <div style={actions}>
        <button type="button" style={btn} onClick={() => choose(true)}>Accept</button>
        <button type="button" style={btn} onClick={() => choose(false)}>Decline</button>
      </div>
    </div>
  );
}

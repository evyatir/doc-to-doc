import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, CATEGORIES, DROPS, FEATURES, PAGES } from '@client/config';
import { useFocusTrap } from './focusTrap.js';

export default function MobileMenu({ onClose }) {
  const ref = useFocusTrap(true, onClose);
  const item = (to, label) => (
    <Link to={to} onClick={onClose} className="quiet">{label}</Link>
  );
  return (
    <div className="mobile-menu" ref={ref} role="dialog" aria-modal="true" aria-label="Menu">
      <button className="mobile-close quiet" onClick={onClose} aria-label="Close menu">Close ✕</button>
      {item('/', 'Home')}
      {item('/shop', 'All products')}
      {CATEGORIES.map((c) => (
        <Link key={c.id} to={`/shop/${c.id}`} onClick={onClose} className="quiet">{c.label}</Link>
      ))}
      {FEATURES.drops && DROPS.length > 0 && item('/drops', 'Drops')}
      {FEATURES.giftCard && item('/gift-card', 'Gift card')}
      {PAGES['about'] && item('/p/about', PAGES['about'].title)}
      {item('/contact', 'Contact')}
      {FEATURES.accounts && item('/signup', 'Sign up / Log in')}
      {FEATURES.cart && item('/cart', 'Cart')}
      <p className="footer-line">{BRAND.footerLine}</p>
    </div>
  );
}

// Simple marketing-site header: logo left, nav + one CTA right. No cart, no
// search, no accounts — this site converts on booking a call, not buying.
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BRAND, NAV } from '@client/config';
import { useFocusTrap } from './focusTrap.js';

const cls = ({ isActive }) => `navlink${isActive ? ' active' : ''}`;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="header-wrap sticky">
      <header className="header">
        <Link to="/" className="brand-logo" aria-label={`${BRAND.name} home`}>
          <img src={BRAND.logo} alt={BRAND.name} />
        </Link>

        <nav className="nav" aria-label="Main">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={cls}>{item.label}</NavLink>
          ))}
        </nav>

        <div className="header-icons">
          <Link to="/book" className="btn btn-commerce header-cta">Talk to a Doc.</Link>
          <button
            className="icon-btn burger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </header>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
}

function MobileMenu({ onClose }) {
  const ref = useFocusTrap(true, onClose);
  return (
    <div className="mobile-menu" ref={ref} role="dialog" aria-modal="true" aria-label="Menu">
      <button className="mobile-close quiet" onClick={onClose} aria-label="Close menu">Close ✕</button>
      {NAV.map((item) => (
        <Link key={item.to} to={item.to} onClick={onClose} className="quiet">{item.label}</Link>
      ))}
      <Link to="/book" onClick={onClose} className="quiet">Talk to a Doc.</Link>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BRAND, CATEGORIES, DROPS, FEATURES } from '@client/config';
import { useCart } from '../cart.js';
import { useToast } from './Toast.jsx';
import Ticker from './Ticker.jsx';
import MobileMenu from './MobileMenu.jsx';
import SearchOverlay from './SearchOverlay.jsx';

const cls = ({ isActive }) => `navlink${isActive ? ' active' : ''}`;

export default function Header() {
  const cart = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className={`header-wrap${FEATURES.stickyHeader ? ' sticky' : ''}`}>
      <Ticker />
      <header className="header">
        <button
          className="icon-btn burger"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        <nav className="nav" aria-label="Main">
          <NavLink to="/" className={cls} end>Home</NavLink>
          <NavLink to="/shop" className={cls} end>All products</NavLink>
          {CATEGORIES.map((c) => (
            <NavLink key={c.id} to={`/shop/${c.id}`} className={cls}>{c.label}</NavLink>
          ))}
          {FEATURES.drops && DROPS.length > 0 && (
            <div className="has-sub">
              <NavLink to="/drops" className={cls}>Drops</NavLink>
              <div className="submenu">
                {DROPS.map((d) => (
                  <NavLink key={d.id} to={`/drops/${d.id}`} className={cls}>{d.label}</NavLink>
                ))}
              </div>
            </div>
          )}
          {FEATURES.giftCard && <NavLink to="/gift-card" className={cls}>Gift card</NavLink>}
        </nav>

        <Link to="/" className="logo quiet" aria-label={`${BRAND.name} home`}>
          {BRAND.name}
        </Link>

        <div className="header-icons">
          {FEATURES.search && (
            <button
              className="icon-btn"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M15 15l6 6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          )}
          <button
            className="icon-btn"
            aria-label="Account"
            onClick={() => (FEATURES.accounts ? navigate('/') : toast('Accounts coming soon'))}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          {FEATURES.cart && (
            <Link to="/cart" className="icon-btn" aria-label={`Cart with ${cart.count} items`}>
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 8h12l-1 12H7L6 8z" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="badge">{cart.count}</span>
            </Link>
          )}
        </div>
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </div>
  );
}

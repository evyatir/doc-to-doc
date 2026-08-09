import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, CATEGORIES, FEATURES, PAGES, SIZE_GUIDE } from '@client/config';
import Newsletter from './Newsletter.jsx';

const ext = (href, label) =>
  href ? (
    <a className="quiet" href={href} target="_blank" rel="noreferrer">{label}</a>
  ) : null;

export default function Footer() {
  const page = (slug, label) =>
    PAGES[slug] ? <Link className="quiet" to={`/p/${slug}`}>{label || PAGES[slug].title}</Link> : null;

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h2>{BRAND.name}</h2>
          {BRAND.footerLine && <p className="footer-line">{BRAND.footerLine}</p>}
          <div className="social-row">
            {ext(BRAND.igUrl, 'Instagram')}
            {ext(BRAND.tiktokUrl, 'TikTok')}
          </div>
        </div>
        <nav className="footer-col" aria-label="Shop">
          <h3>Shop</h3>
          <Link className="quiet" to="/shop">All products</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.id} className="quiet" to={`/shop/${c.id}`}>{c.label}</Link>
          ))}
          {FEATURES.giftCard && <Link className="quiet" to="/gift-card">Gift card</Link>}
        </nav>
        <nav className="footer-col" aria-label="Help">
          <h3>Help</h3>
          {SIZE_GUIDE.enabled && <Link className="quiet" to="/size-guide">Size guide</Link>}
          {page('shipping-returns')}
          {page('store-policy')}
          <Link className="quiet" to="/contact">Contact us</Link>
        </nav>
        <nav className="footer-col" aria-label="Brand">
          <h3>Brand</h3>
          {page('about')}
          {FEATURES.drops && <Link className="quiet" to="/drops">Drops</Link>}
          {page('privacy-policy')}
        </nav>
        <div className="footer-col">
          {FEATURES.newsletter && <Newsletter />}
        </div>
      </div>
    </footer>
  );
}

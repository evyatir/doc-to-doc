import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, NAV } from '@client/config';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col footer-col-wide">
          <img src={BRAND.logo} alt={BRAND.name} className="footer-logo" />
          {BRAND.footerLine && <p className="footer-line">{BRAND.footerLine}</p>}
        </div>
        <nav className="footer-col" aria-label="Site">
          <h3>Site</h3>
          {NAV.map((item) => (
            <Link key={item.to} className="quiet" to={item.to}>{item.label}</Link>
          ))}
        </nav>
        <nav className="footer-col" aria-label="Get in touch">
          <h3>Get in touch</h3>
          <Link className="quiet" to="/book">Talk to a Doc.</Link>
          {BRAND.email && <a className="quiet" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>}
          {BRAND.igUrl && <a className="quiet" href={BRAND.igUrl} target="_blank" rel="noreferrer">Instagram</a>}
        </nav>
      </div>
    </footer>
  );
}

// Phone-only sticky booking bar. The header CTA collapses into the burger
// menu below 900px, which hides the one action this site converts on — this
// keeps it in reach without the visitor opening a menu first.
// Hidden on /book itself (you are already there) and on /admin.
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BOOK } from '@client/config';

export default function MobileCta() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/book') || pathname.startsWith('/admin')) return null;

  return (
    <div className="mobile-cta">
      <Link to="/book" className="btn btn-commerce">{BOOK.cta}</Link>
    </div>
  );
}

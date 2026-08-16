import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, TESTIMONIALS } from '@client/config';
import { useSeo } from '../seo.js';

export default function Testimonials() {
  useSeo('What They Say About Us', `What students and parents say about ${BRAND.name}.`);

  return (
    <main className="page page-narrow">
      <p className="section-kicker section-kicker-center">WHAT THEY SAY ABOUT US</p>
      <h1 className="page-h1">Hear it from people who've sat where you're sitting.</h1>

      {TESTIMONIALS.length === 0 ? (
        <div className="empty-state">
          <p>We're just getting started collecting reviews — check back soon.</p>
          <p className="empty-state-sub">In the meantime, the fastest way to know if this is right for you is a free 15-minute call.</p>
          <Link to="/book" className="btn btn-commerce" style={{ marginTop: 20 }}>Book the free call →</Link>
        </div>
      ) : (
        <div className="testimonial-grid">
          {TESTIMONIALS.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <p className="testimonial-quote">“{t.quote}”</p>
              <p className="testimonial-author">{t.name}{t.detail ? ` — ${t.detail}` : ''}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

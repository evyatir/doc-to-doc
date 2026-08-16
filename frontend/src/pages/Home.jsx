import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, HERO, REASSURANCE, STEPS, HOW_IT_WORKS, BOOK } from '@client/config';
import { useSeo } from '../seo.js';
import Img from '../components/Img.jsx';

export default function Home() {
  useSeo('Home', BRAND.tagline);

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">{HERO.eyebrow}</p>
          <h1 className="hero-h1">
            {HERO.headline.map((line, i) => (
              <span key={i} className={i === 1 ? 'hero-h1-accent' : ''}>{line}<br /></span>
            ))}
          </h1>
          <p className="hero-body">{HERO.body}</p>
          <div className="hero-ctas">
            <Link to={HERO.ctaPrimary.href} className="btn btn-commerce hero-cta-primary">
              {HERO.ctaPrimary.label} →
            </Link>
            <Link to={HERO.ctaSecondary.href} className="hero-cta-secondary quiet">
              {HERO.ctaSecondary.label} ↓
            </Link>
          </div>
        </div>
        <div className="hero-photo-wrap">
          <Img className="hero-photo" src={HERO.photo} alt="" label="Studying together" />
          {HERO.photoCaption && <p className="hero-note">{HERO.photoCaption}</p>}
        </div>
      </section>

      <section className="quote-band">
        <div className="quote-band-inner">
          {REASSURANCE.questions.map((q) => (
            <p key={q} className="quote-question">{q}</p>
          ))}
          <p className="quote-line">{REASSURANCE.line}</p>
        </div>
      </section>

      <section className="steps-teaser">
        <h2 className="section-h2">
          {HOW_IT_WORKS.headline.map((line, i) => (
            <span key={i} className={i === 1 ? 'section-h2-accent' : ''}>{line}<br /></span>
          ))}
        </h2>
        <p className="section-kicker">HOW IT WORKS</p>
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div className="step-card" key={s.n}>
              <span className="step-n">{s.n}</span>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="steps-cta">
          <Link to="/how-it-works" className="btn">See how it works in detail</Link>
        </div>
      </section>

      <section className="why-band">
        <p className="why-kicker">{HOW_IT_WORKS.quote.kicker}</p>
        <p className="why-text">“{HOW_IT_WORKS.quote.text}”</p>
      </section>

      <section className="final-cta">
        <h2 className="section-h2">
          {BOOK.headline.map((line, i) => <span key={i}>{line}<br /></span>)}
        </h2>
        <p className="final-cta-sub">{BOOK.sub}</p>
        <Link to="/book" className="btn btn-commerce final-cta-btn">{BOOK.cta}</Link>
      </section>
    </main>
  );
}

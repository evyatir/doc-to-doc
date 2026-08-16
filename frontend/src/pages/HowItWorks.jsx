import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, STEPS, HOW_IT_WORKS } from '@client/config';
import { useSeo } from '../seo.js';

export default function HowItWorks() {
  useSeo('How It Works', `How ${BRAND.name} actually works, step by step.`);

  return (
    <main className="page">
      <h1 className="page-h1">
        {HOW_IT_WORKS.headline.map((line, i) => (
          <span key={i} className={i === 1 ? 'section-h2-accent' : ''}>{line}<br /></span>
        ))}
      </h1>
      <p className="section-kicker section-kicker-center">HOW IT WORKS</p>

      <div className="steps-grid steps-grid-full">
        {STEPS.map((s) => (
          <div className="step-card" key={s.n}>
            <span className="step-n">{s.n}</span>
            <h2 className="step-title">{s.title}</h2>
            <p className="step-body">{s.body}</p>
          </div>
        ))}
      </div>

      <section className="why-band why-band-inline">
        <p className="why-kicker">{HOW_IT_WORKS.quote.kicker}</p>
        <p className="why-text">“{HOW_IT_WORKS.quote.text}”</p>
      </section>

      <div className="steps-cta">
        <Link to="/book" className="btn btn-commerce">Start with the free call →</Link>
      </div>
    </main>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, FAQ } from '@client/config';
import { useSeo } from '../seo.js';
import Accordion from '../components/Accordion.jsx';

export default function Faq() {
  useSeo('FAQ', `Questions people usually have before booking with ${BRAND.name}.`);

  return (
    <main className="page page-narrow">
      <p className="section-kicker">FAQ</p>
      <h1 className="page-h1 faq-h1">The questions your browser history knows well.</h1>
      <Accordion items={FAQ.map((f) => ({ title: f.q, body: f.a }))} />
      <div className="steps-cta">
        <Link to="/book" className="btn btn-commerce">Still unsure? Book the free call →</Link>
      </div>
    </main>
  );
}

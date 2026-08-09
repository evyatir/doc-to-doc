// Drops index: stacked full-bleed photo tiles, one per drop, each linking to
// its lookbook. Drops are galleries, not shops.
import React from 'react';
import { Link } from 'react-router-dom';
import { DROPS } from '@client/config';
import { useSeo } from '../seo.js';
import Img from '../components/Img.jsx';

export default function Drops() {
  useSeo('Drops', 'Collection drops and lookbooks');
  return (
    <main>
      {DROPS.map((d) => (
        <Link key={d.id} to={`/drops/${d.id}`} className="band band-tall" aria-label={`${d.label} lookbook`}>
          <Img className="band-img" src={d.heroImg} alt="" label={d.label} />
          <div className="band-label">
            <h2 style={{ fontSize: 'var(--fs-h2)' }}>{d.label}</h2>
            {d.note && <p style={{ fontFamily: 'var(--font-body)', fontSize: 14 }}>{d.note}</p>}
          </div>
        </Link>
      ))}
    </main>
  );
}

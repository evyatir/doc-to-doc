// Home: full-bleed hero (current drop) -> category photo bands (zero gap) ->
// accent band -> Instagram -> footer. Bands are the links.
import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, CATEGORIES, DROPS } from '@client/config';
import { useSeo } from '../seo.js';
import Img from '../components/Img.jsx';
import InstagramGrid from '../components/InstagramGrid.jsx';

export default function Home() {
  useSeo('Home', `${BRAND.name} — ${BRAND.footerLine || 'shop the collection'}`);
  const current = DROPS[0];

  return (
    <main>
      <Link to="/shop" className="band band-tall" aria-label="Shop all products">
        <Img className="band-img" src={current?.heroImg} alt="" label={current?.label || 'Hero'} />
        <div className="band-label">
          <h1 style={{ fontSize: 'var(--fs-h2)' }}>All Products</h1>
        </div>
      </Link>

      {current && (
        <section className="accent-band">
          <h2>{current.label}</h2>
          {current.sub && <p>{current.sub}</p>}
        </section>
      )}

      {CATEGORIES.map((c) => (
        <Link key={c.id} to={`/shop/${c.id}`} className="band band-tall" aria-label={`Shop ${c.label}`}>
          <Img className="band-img" src={c.img} alt="" label={c.label} />
          <div className="band-label">
            <h2 style={{ fontSize: 'var(--fs-h2)' }}>{c.label}</h2>
          </div>
        </Link>
      ))}

      <InstagramGrid />
    </main>
  );
}

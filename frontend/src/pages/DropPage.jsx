// Lookbook page: hero band (optional "shop now" link) + stacked photo bands.
// No grids, no prices.
import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { DROPS } from '@client/config';
import { useSeo } from '../seo.js';
import Img from '../components/Img.jsx';

export default function DropPage() {
  const { dropId } = useParams();
  const drop = DROPS.find((d) => d.id === dropId);
  useSeo(drop ? drop.label : 'Drop', drop?.sub || '');
  if (!drop) return <Navigate to="/drops" replace />;

  return (
    <main>
      <div className="band band-tall">
        <Img className="band-img" src={drop.heroImg} alt="" label={drop.label} />
        <div className="band-label">
          <h1 style={{ fontSize: 'var(--fs-hero-lg)' }}>{drop.label}</h1>
          {drop.sub && <p style={{ fontFamily: 'var(--font-body)' }}>{drop.sub}</p>}
          {drop.shopNowHref && (
            <p style={{ marginTop: 16 }}>
              <Link to={drop.shopNowHref} className="btn">shop now</Link>
            </p>
          )}
        </div>
      </div>
      {(drop.photos || []).map((src, i) => (
        <div key={i} className="band band-tall">
          <Img className="band-img" src={src} alt={`${drop.label} lookbook photo ${i + 1}`} label={`${drop.label} ${i + 1}`} />
        </div>
      ))}
    </main>
  );
}

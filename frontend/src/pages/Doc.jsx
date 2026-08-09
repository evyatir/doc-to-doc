// Content pages from PAGES config: photo hero + display h1 + paragraph blocks.
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { PAGES } from '@client/config';
import { useSeo } from '../seo.js';
import Img from '../components/Img.jsx';

export default function Doc() {
  const { slug } = useParams();
  const page = PAGES[slug];
  useSeo(page ? page.title : 'Page', page ? page.body[0] : '');
  if (!page) return <Navigate to="/" replace />;
  return (
    <main>
      <div className="band band-hero-doc">
        <Img className="band-img" src={page.heroImg} alt="" label={page.title} />
        <div className="band-label">
          <h1 className="doc-h1">{page.title}</h1>
        </div>
      </div>
      <div className="doc-body">
        {page.body.map((block, i) => <p key={i}>{block}</p>)}
      </div>
    </main>
  );
}

// Static Instagram grid from config — no API. 6 visible, Load more reveals 6.
import React, { useState } from 'react';
import { BRAND, IG_POSTS, FEATURES } from '@client/config';
import Img from './Img.jsx';

export default function InstagramGrid() {
  const [shown, setShown] = useState(6);
  if (!FEATURES.instagram || !IG_POSTS.length) return null;
  return (
    <section className="page" aria-label="Instagram">
      <h2 className="ig-h2">Follow us on Instagram {BRAND.handle}</h2>
      <div className="ig-grid">
        {IG_POSTS.slice(0, shown).map((post, i) => (
          <a
            key={i}
            className="ig-tile"
            href={post.url}
            target="_blank"
            rel="noreferrer"
            aria-label={post.caption || 'Instagram post'}
          >
            <Img src={post.img} alt={post.caption || 'Instagram post'} label="IG" />
            <span className="ig-cap" aria-hidden="true">{post.caption}</span>
          </a>
        ))}
      </div>
      {shown < IG_POSTS.length && (
        <div className="load-more-wrap">
          <button className="btn btn-outline" onClick={() => setShown((n) => n + 6)}>Load more</button>
        </div>
      )}
    </section>
  );
}

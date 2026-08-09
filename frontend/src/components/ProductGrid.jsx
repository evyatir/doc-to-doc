// Standard grid + optional "Load More" pagination (12 per page).
import React, { useState } from 'react';
import ProductCard from './ProductCard.jsx';
import Img from './Img.jsx';

// Loading skeleton: same card layout, blur-up placeholder as the media
// (spec: reuse the existing blur-up placeholder — no new spinner language).
export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="card" key={i}>
          <div className="card-media"><Img src="" alt="" label="" /></div>
          <h2 className="card-name">&nbsp;</h2>
          <div className="card-divider" />
          <p className="card-price">&nbsp;</p>
        </div>
      ))}
    </div>
  );
}

export default function ProductGrid({ products, pageSize = 0, onNavigate }) {
  const [shown, setShown] = useState(pageSize || products.length);
  const visible = pageSize ? products.slice(0, shown) : products;
  return (
    <>
      <div className="grid">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
        ))}
      </div>
      {pageSize > 0 && shown < products.length && (
        <div className="load-more-wrap">
          <button className="btn btn-outline" onClick={() => setShown((n) => n + pageSize)}>
            Load More
          </button>
        </div>
      )}
    </>
  );
}

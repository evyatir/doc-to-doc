// Inline search under the header: live filter on name/category/description/family.
import React, { useEffect, useRef, useState } from 'react';
import { useProducts } from '../api.js';
import ProductGrid from './ProductGrid.jsx';

export default function SearchOverlay({ onClose }) {
  const [q, setQ] = useState('');
  const { products } = useProducts();
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const needle = q.trim().toLowerCase();
  const results = needle
    ? (products || []).filter((p) =>
        [p.name, p.cat, p.desc, p.family].filter(Boolean).join(' ').toLowerCase().includes(needle))
    : [];

  return (
    <div style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      <div className="search-bar">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
        />
        {needle && (
          <span className="search-count" aria-live="polite">
            {results.length} result{results.length === 1 ? '' : 's'}
          </span>
        )}
        <button className="btn" onClick={onClose}>Close</button>
      </div>
      {needle && (
        <div className="page" style={{ paddingTop: 0 }}>
          <ProductGrid products={results} onNavigate={onClose} />
        </div>
      )}
    </div>
  );
}

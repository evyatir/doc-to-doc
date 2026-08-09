import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { CATEGORIES } from '@client/config';
import { useSeo } from '../seo.js';
import { useProducts } from '../api.js';
import ProductGrid, { GridSkeleton } from '../components/ProductGrid.jsx';

export default function Shop() {
  const { categoryId } = useParams();
  const cat = categoryId ? CATEGORIES.find((c) => c.id === categoryId) : null;
  const title = cat ? cat.label : 'All products';
  useSeo(title, `Shop ${title}`);
  const { products, loading, error, retry } = useProducts(cat ? { category: cat.id } : {});

  if (categoryId && !cat) return <Navigate to="/shop" replace />;

  return (
    <main className="page">
      <h1 className="page-h1">{title}</h1>
      {loading && <GridSkeleton />}
      {!loading && error && (
        <div className="empty-cart">
          <p>Couldn&apos;t load products.</p>
          <button className="btn" onClick={retry}>Try again</button>
        </div>
      )}
      {!loading && !error && <ProductGrid products={products} pageSize={12} />}
    </main>
  );
}

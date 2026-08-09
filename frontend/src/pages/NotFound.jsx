import React from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '../seo.js';

export default function NotFound() {
  useSeo('Not found');
  return (
    <main className="page">
      <h1 className="page-h1">Page not found</h1>
      <div className="empty-cart">
        <Link to="/" className="btn">Back home</Link>
      </div>
    </main>
  );
}

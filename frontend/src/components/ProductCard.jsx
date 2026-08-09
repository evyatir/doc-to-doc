// Product card: 1:1 media with two stacked images (second cross-fades in on
// hover — the site's ONE hover effect), centered name, divider, centered price.
// Sold-out shows "Out of stock" instead of the price. No badges, no quick-view.
import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '@client/config';
import Img from './Img.jsx';

export default function ProductCard({ product, onNavigate }) {
  const [imgA, imgB] = [product.imgs?.[0], product.imgs?.[1] ?? product.imgs?.[0]];
  return (
    <Link to={`/product/${product.id}`} className="card" onClick={onNavigate}>
      <div className="card-media">
        <Img src={imgA} alt={product.name} label={product.name} />
        <Img src={imgB} alt="" label={`${product.name} 2`} className="card-img-b" aria-hidden="true" />
      </div>
      <h2 className="card-name">{product.name}</h2>
      <div className="card-divider" aria-hidden="true" />
      {product.soldOut ? (
        <p className="card-price card-oos">Out of stock</p>
      ) : (
        <p className="card-price">{BRAND.currency}{product.price.toFixed(2)}</p>
      )}
    </Link>
  );
}

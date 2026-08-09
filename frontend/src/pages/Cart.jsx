// Canonical cart surface. Empty state mirrors the reference verbatim.
// Checkout lives in CheckoutForm: customer form + recorded order when the
// backend is up, plain WhatsApp handoff when it isn't.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '@client/config';
import { useSeo } from '../seo.js';
import { useCart } from '../cart.js';
import QuantityStepper from '../components/QuantityStepper.jsx';
import CheckoutForm from '../components/CheckoutForm.jsx';
import Img from '../components/Img.jsx';

export default function Cart() {
  useSeo('My cart', 'Your shopping cart');
  const cart = useCart();
  const [orderId, setOrderId] = useState(null);

  if (orderId) {
    return (
      <main className="page">
        <h1 className="page-h1">Thank you!</h1>
        <div className="empty-cart">
          <p className="ok-note" role="status">
            Order #{orderId} received. We opened WhatsApp so you can send it to us —
            we&apos;ll confirm from there.
          </p>
          <Link to="/shop" className="quiet" style={{ textDecoration: 'underline' }}>
            Continue Browsing
          </Link>
        </div>
      </main>
    );
  }

  if (!cart.lines.length) {
    return (
      <main className="page">
        <h1 className="page-h1">My cart</h1>
        <div className="empty-cart">
          <p>Cart is empty</p>
          <Link to="/shop" className="quiet" style={{ textDecoration: 'underline' }}>
            Continue Browsing
          </Link>
        </div>
      </main>
    );
  }

  const toFree = BRAND.freeShipOver > 0 ? Math.max(0, BRAND.freeShipOver - cart.subtotal) : 0;
  const pct = BRAND.freeShipOver > 0 ? Math.min(100, (cart.subtotal / BRAND.freeShipOver) * 100) : 0;

  return (
    <main className="page">
      <h1 className="page-h1">My cart</h1>
      <div className="cart-lines">
        {cart.lines.map((l) => (
          <div className="cart-line" key={`${l.id}:${l.size}`}>
            <Img src={l.img} alt={l.name} label={l.name} />
            <div>
              <p className="card-name" style={{ textAlign: 'left', marginTop: 0 }}>{l.name}</p>
              <p className="cart-meta">{l.size}</p>
              <div className="line-actions" style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
                <QuantityStepper value={l.qty} onChange={(q) => cart.setQty(l.id, l.size, q)} idPrefix={`${l.id}-${l.size}`} />
                <button className="quiet" style={{ textDecoration: 'underline' }} onClick={() => cart.remove(l.id, l.size)}>
                  Remove
                </button>
              </div>
            </div>
            <p className="card-price">{BRAND.currency}{(l.price * l.qty).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        {BRAND.freeShipOver > 0 && (
          <div>
            <div className="ship-bar" role="img" aria-label={toFree > 0 ? `${BRAND.currency}${toFree} away from free shipping` : 'Free shipping unlocked'}>
              <div className="ship-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="ship-note">
              {toFree > 0
                ? `${BRAND.currency}${toFree.toFixed(2)} away from free shipping`
                : 'Free shipping unlocked!'}
            </p>
          </div>
        )}
        <p className="subtotal">
          <span>Subtotal</span>
          <span>{BRAND.currency}{cart.subtotal.toFixed(2)}</span>
        </p>
        <CheckoutForm onSuccess={setOrderId} idPrefix="cart-co" />
      </div>
    </main>
  );
}

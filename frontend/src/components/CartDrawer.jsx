import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BRAND, FEATURES } from '@client/config';
import { useCart } from '../cart.js';
import { useFocusTrap } from './focusTrap.js';
import CheckoutForm from './CheckoutForm.jsx';
import Img from './Img.jsx';

export default function CartDrawer() {
  const cart = useCart();
  const [orderId, setOrderId] = useState(null);
  const ref = useFocusTrap(cart.drawerOpen, cart.closeDrawer);

  if (!FEATURES.cartDrawer || !cart.drawerOpen) return null;

  // Success only right after checkout emptied the cart; a repopulated cart
  // means a new shopping round, so the stale order screen must not show.
  const showSuccess = orderId && !cart.lines.length;

  return (
    <>
      <div className="scrim" onClick={cart.closeDrawer} aria-hidden="true" />
      <aside className="drawer" ref={ref} role="dialog" aria-modal="true" aria-label="Cart">
        {showSuccess ? (
          <>
            <h2 className="drawer-h2">Thank you!</h2>
            <p className="ok-note" role="status">
              Order #{orderId} received. We opened WhatsApp so you can send it to us —
              we&apos;ll confirm from there.
            </p>
            <button className="btn btn-outline" onClick={cart.closeDrawer}>
              Continue Browsing
            </button>
          </>
        ) : (
          <>
            <h2 className="drawer-h2">Added to cart</h2>
            <div className="drawer-lines">
              {cart.lines.map((l) => (
                <div className="drawer-line" key={`${l.id}:${l.size}`}>
                  <Img src={l.img} alt={l.name} label={l.name} />
                  <span>
                    {l.name} · {l.size} × {l.qty}
                    <br />
                    {BRAND.currency}{(l.price * l.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <p className="subtotal">
              <span>Subtotal</span>
              <span>{BRAND.currency}{cart.subtotal.toFixed(2)}</span>
            </p>
            <Link
              to="/cart"
              className="btn"
              onClick={cart.closeDrawer}
            >
              View Cart
            </Link>
            <CheckoutForm onSuccess={setOrderId} idPrefix="drawer-co" />
            <button className="btn btn-outline" onClick={cart.closeDrawer}>
              Continue Browsing
            </button>
          </>
        )}
      </aside>
    </>
  );
}

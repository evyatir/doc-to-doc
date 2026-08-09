// Checkout, shared by the cart page and the drawer.
//
// Backend present (source 'api'): minimal customer form -> POST /api/orders ->
// onSuccess(orderId) -> WhatsApp opens with "Order #N — " prepended. A 409
// lists the short lines and offers to adjust the cart (nothing decremented
// server-side — the transaction rolled back).
//
// Backend absent (config fallback / unreachable): skips the POST entirely and
// goes straight to the WhatsApp link — the pre-backend behavior.
import React, { useState } from 'react';
import { FEATURES } from '@client/config';
import { useCart, whatsappHref } from '../cart.js';
import { useToast } from './Toast.jsx';
import { useApiSource, postOrder, isBackendAbsent } from '../api.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutForm({ onSuccess, idPrefix = 'co' }) {
  const cart = useCart();
  const toast = useToast();
  const source = useApiSource();
  const [values, setValues] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [shortages, setShortages] = useState(null);

  const openWhatsApp = (prefix = '') =>
    window.open(whatsappHref(cart.lines, cart.subtotal, prefix), '_blank', 'noopener');

  // FEATURES.checkout=true is still the payments stub, per the frontend spec.
  if (FEATURES.checkout) {
    return (
      <button className="btn btn-commerce" onClick={() => toast('Checkout coming soon')}>
        Checkout
      </button>
    );
  }

  if (source !== 'api') {
    const direct = () => {
      if (import.meta.env.DEV) {
        console.info('[checkout] backend absent — WhatsApp handoff only, order not recorded');
      }
      openWhatsApp();
    };
    return (
      <button className="btn btn-commerce" onClick={direct}>Order on WhatsApp</button>
    );
  }

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const adjust = () => {
    for (const s of shortages) {
      if (s.available <= 0) cart.remove(String(s.productId), s.size);
      else cart.setQty(String(s.productId), s.size, s.available);
    }
    setShortages(null);
    toast('Cart adjusted to available stock');
  };

  const submit = async () => {
    const errs = {};
    if (!values.name.trim()) errs.name = 'Required';
    if (!values.phone.trim()) errs.phone = 'Required';
    if (values.email && !EMAIL_RE.test(values.email)) errs.email = 'Enter a valid email';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    setShortages(null);
    try {
      const { orderId } = await postOrder({
        customer: {
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim() || undefined,
        },
        items: cart.lines.map((l) => ({ productId: Number(l.id), size: l.size, qty: l.qty })),
      });
      // Build the WhatsApp text BEFORE clearing the cart.
      const href = whatsappHref(cart.lines, cart.subtotal, `Order #${orderId} — `);
      cart.clear();
      window.open(href, '_blank', 'noopener');
      if (onSuccess) onSuccess(orderId);
    } catch (err) {
      if (err.status === 409 && err.body && err.body.lines) {
        setShortages(err.body.lines);
      } else if (isBackendAbsent(err)) {
        // Backend vanished mid-session: fall back to the plain handoff.
        if (import.meta.env.DEV) {
          console.info('[checkout] backend absent — WhatsApp handoff only, order not recorded');
        }
        openWhatsApp();
      } else if (err.status === 400) {
        toast('Some cart items are outdated — please re-add them.');
      } else {
        toast('Something went wrong. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };
  const onEnter = (e) => e.key === 'Enter' && submit();

  const lineName = (s) => {
    const line = cart.lines.find((l) => l.id === String(s.productId) && l.size === s.size);
    return line ? line.name : 'Item';
  };

  return (
    <div className="checkout-form" role="group" aria-label="Checkout">
      <div className="field" style={{ marginTop: 0 }}>
        <label htmlFor={`${idPrefix}-name`}>Full Name*</label>
        <input id={`${idPrefix}-name`} value={values.name} onChange={set('name')} onKeyDown={onEnter} autoComplete="name" />
        {errors.name && <p className="err" role="alert">{errors.name}</p>}
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-phone`}>Phone*</label>
        <input id={`${idPrefix}-phone`} type="tel" value={values.phone} onChange={set('phone')} onKeyDown={onEnter} autoComplete="tel" />
        {errors.phone && <p className="err" role="alert">{errors.phone}</p>}
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-email`}>Email (optional)</label>
        <input id={`${idPrefix}-email`} type="email" value={values.email} onChange={set('email')} onKeyDown={onEnter} autoComplete="email" />
        {errors.email && <p className="err" role="alert">{errors.email}</p>}
      </div>

      {shortages && (
        <div className="stock-warn" role="alert">
          <p>Not enough stock for:</p>
          <ul>
            {shortages.map((s) => (
              <li key={`${s.productId}:${s.size}`}>
                {lineName(s)} ({s.size}) — {s.available <= 0 ? 'out of stock' : `only ${s.available} left`}, you asked for {s.requested}
              </li>
            ))}
          </ul>
          <button className="btn" onClick={adjust}>Adjust cart</button>
        </div>
      )}

      <button className="btn btn-commerce" style={{ marginTop: 12 }} disabled={busy} onClick={submit}>
        {busy ? 'Placing order…' : 'Place Order'}
      </button>
    </div>
  );
}

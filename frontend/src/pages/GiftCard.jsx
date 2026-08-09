// Native gift card page (the reference embeds an unreadable Wix iframe — ours
// is real): amount presets from FEATURES.giftCard, adds to cart with the
// amount as its "size".
import React, { useState } from 'react';
import { BRAND, FEATURES } from '@client/config';
import { useSeo } from '../seo.js';
import { useCart } from '../cart.js';
import { useToast } from '../components/Toast.jsx';
import Img from '../components/Img.jsx';

export default function GiftCard() {
  useSeo('Gift Card', `Give the gift of ${BRAND.name}`);
  const cart = useCart();
  const toast = useToast();
  const amounts = Array.isArray(FEATURES.giftCard) ? FEATURES.giftCard : [50, 100, 150, 200];
  const [amount, setAmount] = useState(null);

  const add = () => {
    if (amount == null) return;
    cart.add({
      id: 'gift-card',
      name: `${BRAND.name} Gift Card`,
      price: amount,
      size: `${BRAND.currency}${amount}`,
      qty: 1,
      img: '',
    });
    if (!FEATURES.cartDrawer) toast('Gift card added to cart');
  };

  return (
    <main className="page" style={{ maxWidth: 720 }}>
      <h1 className="page-h1">Gift Card</h1>
      <div className="pdp-main" style={{ maxWidth: 420, margin: '0 auto' }}>
        <Img src="" alt={`${BRAND.name} gift card`} label="Gift Card" />
      </div>
      <p style={{ textAlign: 'center', marginTop: 24 }}>
        Can't decide? Let them pick. Delivered as a code, redeemable at checkout.
      </p>
      <div className="gift-amounts" role="radiogroup" aria-label="Gift card amount">
        {amounts.map((a) => (
          <button
            key={a}
            className={`btn${amount === a ? ' selected' : ''}`}
            role="radio"
            aria-checked={amount === a}
            onClick={() => setAmount(a)}
          >
            {BRAND.currency}{a}
          </button>
        ))}
      </div>
      <button className="btn btn-commerce" disabled={amount == null} onClick={add}>
        {amount == null ? 'Select an amount' : 'Add To Cart'}
      </button>
    </main>
  );
}

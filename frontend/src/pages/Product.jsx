// PDP: gallery left (main + up to 4 thumbs, click swaps, no zoom), 355px
// details right. Sold-out swaps both CTAs for Notify When Available.
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BRAND, FEATURES, PAGES, SIZE_GUIDE } from '@client/config';
import { useSeo } from '../seo.js';
import { useProduct, useProducts } from '../api.js';
import { useCart } from '../cart.js';
import { useToast } from '../components/Toast.jsx';
import Img from '../components/Img.jsx';
import Accordion from '../components/Accordion.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import ProductCard from '../components/ProductCard.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Product() {
  const { id } = useParams();
  const { product, loading, error, retry } = useProduct(id);
  const { products } = useProducts();
  useSeo(product ? product.name : 'Product', product?.desc || product?.name || '');
  const cart = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyState, setNotifyState] = useState('closed'); // closed | open | error

  const siblings = useMemo(() => {
    if (!product || !products) return [];
    if (product.family) {
      return products.filter((p) => p.family === product.family && p.id !== product.id);
    }
    return products.filter((p) => p.cat === product.cat && p.id !== product.id).slice(0, 4);
  }, [product, products]);

  if (loading) {
    // Skeleton = the existing blur-up placeholder, no new loading language.
    return (
      <main className="page">
        <div className="pdp" aria-busy="true">
          <div className="pdp-gallery">
            <div className="pdp-main"><Img src="" alt="" label="" /></div>
          </div>
          <div>
            <h1 className="pdp-title">&nbsp;</h1>
            <p className="pdp-price">&nbsp;</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <h1 className="page-h1">Something went wrong</h1>
        <div className="empty-cart">
          <p>Couldn&apos;t load this product.</p>
          <button className="btn" onClick={retry}>Try again</button>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="page">
        <h1 className="page-h1">Product not found</h1>
        <div className="empty-cart"><Link className="btn" to="/shop">Back to shop</Link></div>
      </main>
    );
  }

  const imgs = (product.imgs && product.imgs.length ? product.imgs : ['']).slice(0, 5);
  const sizeLabel = product.sizeLabel || 'Size';

  // null = stock unknown (config fallback mode) -> never disable sizes.
  const stockFor = (s) => {
    if (!product.variants) return null;
    const variant = product.variants.find((v) => v.size === s);
    return variant ? variant.stock : 0;
  };

  const add = ({ buyNow = false } = {}) => {
    if (!size) return;
    const stock = stockFor(size); // check the chosen variant, not the product
    if (stock !== null && stock <= 0) { toast('Out of stock in this size'); return; }
    cart.add(
      { id: product.id, name: product.name, price: product.price, size, qty, img: imgs[0] },
      { openDrawer: !buyNow }
    );
    if (!FEATURES.cartDrawer && !buyNow) toast('Added to cart');
    if (buyNow) navigate('/cart');
  };

  const notifySubmit = () => {
    if (!EMAIL_RE.test(notifyEmail)) { setNotifyState('error'); return; }
    setNotifyState('closed');
    setNotifyEmail('');
    toast("You're on the list!");
  };

  const accordions = [
    PAGES['product-care'] && {
      title: 'Product Care',
      body: PAGES['product-care'].body.map((t, i) => <p key={i}>{t}</p>),
    },
    PAGES['shipping-returns'] && {
      title: 'Shipping & Returns',
      body: (
        <p>
          {PAGES['shipping-returns'].body[0]}{' '}
          <Link className="quiet" to="/p/shipping-returns" style={{ textDecoration: 'underline' }}>
            Read the full policy
          </Link>
        </p>
      ),
    },
    SIZE_GUIDE.enabled && {
      title: 'Size Guide',
      body: (
        <p>
          Not sure about your size?{' '}
          <Link className="quiet" to="/size-guide" style={{ textDecoration: 'underline' }}>
            Open the size guide
          </Link>
        </p>
      ),
    },
  ].filter(Boolean);

  return (
    <main className="page">
      <div className="pdp">
        <div className="pdp-gallery">
          <div className="pdp-main">
            <Img src={imgs[imgIndex]} alt={product.name} label={product.name} />
          </div>
          {imgs.length > 1 && (
            <div className="pdp-thumbs">
              {imgs.slice(0, 4).map((src, i) => (
                <button
                  key={i}
                  className={`pdp-thumb${i === imgIndex ? ' active' : ''}`}
                  aria-label={`Image ${i + 1} of ${product.name}`}
                  onClick={() => setImgIndex(i)}
                >
                  <Img src={src} alt="" label={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="pdp-title">{product.name}</h1>
          <p className="pdp-price">
            {BRAND.currency}{product.price.toFixed(2)}
            <br />
            <span className="microlabel">Price</span>
          </p>
          {product.desc && <p style={{ marginTop: 16 }}>{product.desc}</p>}

          <div className="field">
            <label htmlFor="size-select">{sizeLabel}*</label>
            <select
              id="size-select"
              value={size}
              required
              onChange={(e) => setSize(e.target.value)}
            >
              <option value="" disabled className="placeholder-opt">Select</option>
              {product.sizes.map((s) => {
                const stock = stockFor(s);
                const out = stock !== null && stock <= 0;
                return (
                  <option key={s} value={s} disabled={out}>
                    {out ? `${s} — out of stock` : s}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="field">
            <label htmlFor="qty-input">Quantity*</label>
            <QuantityStepper value={qty} onChange={setQty} />
          </div>

          {product.soldOut ? (
            <>
              <p className="oos-line">Out of stock</p>
              {FEATURES.notifyWhenAvailable && (
                <div className="pdp-ctas">
                  {notifyState === 'closed' ? (
                    <button className="btn btn-commerce" onClick={() => setNotifyState('open')}>
                      Notify When Available
                    </button>
                  ) : (
                    <div className="field" style={{ marginTop: 0 }}>
                      <label htmlFor="notify-email">Email me when it's back</label>
                      <input
                        id="notify-email"
                        type="email"
                        value={notifyEmail}
                        placeholder="Enter your email here…"
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && notifySubmit()}
                      />
                      {notifyState === 'error' && (
                        <p className="err" role="alert">Please enter a valid email.</p>
                      )}
                      <div style={{ marginTop: 10 }}>
                        <button className="btn btn-commerce" onClick={notifySubmit}>Notify Me</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="pdp-ctas">
              <button className="btn btn-commerce" disabled={!size} onClick={() => add()}>
                {size ? 'Add To Cart' : 'Select a size'}
              </button>
              <button className="btn btn-commerce" disabled={!size} onClick={() => add({ buyNow: true })}>
                Buy Now
              </button>
            </div>
          )}

          {accordions.length > 0 && <Accordion items={accordions} />}
        </div>
      </div>

      {siblings.length > 0 && (
        <section aria-label={product.family ? 'Complete the set' : 'More like this'}>
          <h2 className="strip-h2">{product.family ? 'Complete the set' : 'You may also like'}</h2>
          <div className="strip">
            {siblings.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

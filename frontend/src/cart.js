// Cart state + localStorage persistence, namespaced per client.
import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { BRAND, PRODUCTS, FEATURES } from '@client/config';

const KEY = `storefront-cart:${BRAND.name || 'client'}`;
const CartCtx = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Lines: { id, name, price, size, qty, img } keyed by id+size.
function reducer(lines, action) {
  switch (action.type) {
    case 'add': {
      const { line } = action;
      const i = lines.findIndex((l) => l.id === line.id && l.size === line.size);
      if (i >= 0) {
        const next = [...lines];
        next[i] = { ...next[i], qty: next[i].qty + (line.qty || 1) };
        return next;
      }
      return [...lines, { ...line, qty: line.qty || 1 }];
    }
    case 'setQty': {
      const { id, size, qty } = action;
      if (qty < 1) return lines;
      return lines.map((l) => (l.id === id && l.size === size ? { ...l, qty } : l));
    }
    case 'remove':
      return lines.filter((l) => !(l.id === action.id && l.size === action.size));
    case 'clear':
      return [];
    default:
      return lines;
  }
}

export function CartProvider({ children }) {
  const [lines, dispatch] = useReducer(reducer, undefined, load);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* private mode */ }
  }, [lines]);

  const api = useMemo(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0);
    return {
      lines, count, subtotal,
      add: (line, { openDrawer = true } = {}) => {
        dispatch({ type: 'add', line });
        if (openDrawer && FEATURES.cartDrawer) setDrawerOpen(true);
      },
      setQty: (id, size, qty) => dispatch({ type: 'setQty', id, size, qty }),
      remove: (id, size) => dispatch({ type: 'remove', id, size }),
      clear: () => dispatch({ type: 'clear' }),
      drawerOpen,
      closeDrawer: () => setDrawerOpen(false),
    };
  }, [lines, drawerOpen]);

  // .js file (per spec structure) — createElement instead of JSX
  return React.createElement(CartCtx.Provider, { value: api }, children);
}

export function useCart() {
  return useContext(CartCtx);
}

// Readable order text for the WhatsApp handoff. `prefix` prepends the
// server-side order number ("Order #12 — ") once checkout records orders.
export function whatsappHref(lines, subtotal, prefix = '') {
  const items = lines
    .map((l) => `- ${l.name} (${l.size}) x${l.qty} — ${BRAND.currency}${l.price * l.qty}`)
    .join('\n');
  const text = `${prefix}Hi ${BRAND.name}! I'd like to order:\n${items}\nSubtotal: ${BRAND.currency}${subtotal}`;
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function productById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

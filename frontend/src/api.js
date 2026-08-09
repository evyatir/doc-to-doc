// Tiny fetch wrapper + product hooks. Products come from the API when a
// database is connected; a 503 (database not configured) or an unreachable
// server falls back to @client/config PRODUCTS — the storefront must be fully
// usable with the backend absent. CATEGORIES/DROPS/THEME/BRAND/PAGES/
// SIZE_GUIDE/IG_POSTS always stay in config; the database owns products/orders.
import { useCallback, useEffect, useState } from 'react';
import { PRODUCTS } from '@client/config';

// Dev: '' + Vite proxy. Production: set VITE_API_URL to the API's origin.
const API_BASE = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(status, body) {
    super((body && body.error) || `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

export async function fetchJson(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, { error: 'Server unreachable' });
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

// "Backend absent" -> fall back to config products. Covers: 503 (database not
// configured), 0 (fetch failed — server unreachable, no dev proxy), and 5xx
// with a non-JSON body (the dev proxy / a hosting gateway answering for a dead
// server). A real API 500 always carries an { error } JSON body and is NOT
// absent — that's the retryable error state instead.
export const isBackendAbsent = (err) =>
  err instanceof ApiError &&
  (err.status === 503 || err.status === 0 || (err.status >= 500 && !err.body));

// API product -> the config shape every component already consumes.
function fromApi(p) {
  return {
    id: String(p.id),
    name: p.name,
    price: p.priceAgorot / 100,
    cat: p.category,
    drop: p.dropId || undefined,
    sizes: p.variants.map((v) => v.size),
    sizeLabel: p.sizeLabel || undefined,
    family: p.family || undefined,
    cut: p.cut || undefined,
    desc: p.description || undefined,
    imgs: p.images || [],
    soldOut: p.soldOut,
    variants: p.variants, // [{ id, size, stock }] — PDP disables empty sizes
  };
}

// Config product -> same shape; variants null = stock unknown (config mode).
const fromConfig = (p) => ({ ...p, soldOut: !!p.soldOut, variants: null });

const configProducts = () => ({ products: PRODUCTS.map(fromConfig), source: 'config' });

let cache = null; // { products, source: 'api' | 'config' }
let inflight = null;

function noteFallback() {
  if (import.meta.env.DEV) {
    console.info('[api] backend absent — config products, WhatsApp-only checkout');
  }
}

async function loadProducts(force = false) {
  if (cache && !force) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const data = await fetchJson('/api/products');
      cache = { products: data.map(fromApi), source: 'api' };
    } catch (err) {
      if (!isBackendAbsent(err)) throw err;
      noteFallback();
      cache = configProducts();
    } finally {
      inflight = null;
    }
    return cache;
  })();
  return inflight;
}

// 'api' | 'config' | null (not loaded yet). Checkout uses this to decide
// between POST /api/orders and the direct WhatsApp handoff.
export function getSource() {
  return cache ? cache.source : null;
}

// Resolves the source even on direct /cart landings where no product list has
// loaded yet. Any load failure counts as 'config' — checkout must never block.
export function useApiSource() {
  const [source, setSource] = useState(getSource());
  useEffect(() => {
    if (source) return;
    let alive = true;
    loadProducts(false).then(
      (c) => alive && setSource(c.source),
      () => alive && setSource('config')
    );
    return () => { alive = false; };
  }, [source]);
  return source;
}

export function useProducts({ category, family } = {}) {
  const [state, setState] = useState(() => ({
    data: cache, loading: !cache, error: null,
  }));

  const load = useCallback((force) => {
    setState((s) => ({ ...s, loading: !s.data, error: null }));
    loadProducts(force).then(
      (data) => setState({ data, loading: false, error: null }),
      () => setState((s) => ({ ...s, loading: false, error: 'Could not load products.' }))
    );
  }, []);

  useEffect(() => { load(false); }, [load]);

  let products = state.data ? state.data.products : null;
  if (products && category) products = products.filter((p) => p.cat === category);
  if (products && family) products = products.filter((p) => p.family === family);

  return {
    products,
    loading: state.loading,
    error: state.error,
    source: state.data ? state.data.source : null,
    retry: () => load(true),
  };
}

// PDP: fetch the single product fresh when the API is live (accurate stock);
// config mode resolves from the config list. notFound covers 404/inactive.
export function useProduct(id) {
  const [state, setState] = useState({ product: null, loading: true, error: null, notFound: false, source: null });

  const load = useCallback(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null, notFound: false }));
    (async () => {
      const { source, products } = await loadProducts(false);
      if (source === 'config') {
        const product = products.find((p) => p.id === id) || null;
        return { product, source, notFound: !product };
      }
      try {
        const product = fromApi(await fetchJson(`/api/products/${id}`));
        return { product, source, notFound: false };
      } catch (err) {
        if (err.status === 404) return { product: null, source, notFound: true };
        throw err;
      }
    })().then(
      (r) => alive && setState({ ...r, loading: false, error: null }),
      () => alive && setState((s) => ({ ...s, loading: false, error: 'Could not load this product.' }))
    );
    return () => { alive = false; };
  }, [id]);

  useEffect(() => load(), [load]);

  return { ...state, retry: load };
}

// ---------- mutations ----------

export function postOrder({ customer, note, items }) {
  return fetchJson('/api/orders', { method: 'POST', body: { customer, note, items } });
}

export function postNewsletter(email) {
  return fetchJson('/api/newsletter', { method: 'POST', body: { email } });
}

export function postContact(fields) {
  return fetchJson('/api/contact', { method: 'POST', body: fields });
}

// Orders tab: newest first, expandable items, per-order status dropdown with
// server-enforced transitions, status counts at the top.
import React, { useCallback, useEffect, useState } from 'react';
import { BRAND } from '@client/config';
import { adminFetch } from './adminApi.js';

const STATUSES = ['new', 'confirmed', 'fulfilled', 'cancelled'];
const NEXT = {
  new: ['confirmed', 'cancelled'],
  confirmed: ['fulfilled', 'cancelled'],
  fulfilled: [],
  cancelled: [],
};

const agorot = (n) => `${BRAND.currency}${(n / 100).toFixed(2)}`;

export default function AdminOrders({ onAuthError }) {
  const [data, setData] = useState(null); // { orders, counts }
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const qs = filter ? `?status=${filter}` : '';
      setData(await adminFetch(`/api/admin/orders${qs}`));
      setError('');
    } catch (err) {
      if (err.status === 401) return onAuthError();
      setError(err.message || 'Failed to load orders');
    }
  }, [filter, onAuthError]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (order, status) => {
    try {
      await adminFetch(`/api/admin/orders/${order.id}`, { method: 'PUT', body: { status } });
      await load();
    } catch (err) {
      if (err.status === 401) return onAuthError();
      setError(err.message || 'Status update failed');
    }
  };

  if (error && !data) return <p className="err" role="alert">{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      {error && <p className="err" role="alert">{error}</p>}
      <div className="admin-counts">
        {STATUSES.map((s) => (
          <span key={s} className="admin-count">{s}: {data.counts[s] || 0}</span>
        ))}
        <label className="admin-filter">
          Filter
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
            <option value="">all</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      {!data.orders.length && <p>No orders{filter ? ` with status "${filter}"` : ' yet'}.</p>}

      {data.orders.map((o) => (
        <details className="admin-order" key={o.id}>
          <summary>
            <span>#{o.id} · {o.customerName} · {agorot(o.subtotalAgorot)}</span>
            <span className={`admin-status admin-status-${o.status}`}>{o.status}</span>
          </summary>
          <div className="admin-order-body">
            <p>
              {o.customerPhone}
              {o.customerEmail ? ` · ${o.customerEmail}` : ''}
              {' · '}{new Date(o.createdAt).toLocaleString()}
            </p>
            {o.note && <p>Note: {o.note}</p>}
            <ul>
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.productName} ({i.size}) × {i.qty} — {agorot(i.unitPriceAgorot * i.qty)}
                </li>
              ))}
            </ul>
            {NEXT[o.status].length > 0 && (
              <label className="admin-filter">
                Set status
                <select
                  value={o.status}
                  aria-label={`Status of order ${o.id}`}
                  onChange={(e) => setStatus(o, e.target.value)}
                >
                  <option value={o.status} disabled>{o.status}</option>
                  {NEXT[o.status].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

// /admin — store-owner panel in the same React app. Deliberately excluded
// from the public nav and footer; plain and dense, styled with the same
// theme tokens so it reads as the same product family.
import React, { useState } from 'react';
import { BRAND } from '@client/config';
import { useSeo } from '../../seo.js';
import { getToken, setToken, login } from './adminApi.js';
import AdminProducts from './AdminProducts.jsx';
import AdminOrders from './AdminOrders.jsx';
import AdminMessages from './AdminMessages.jsx';

const TABS = [
  { id: 'products', label: 'Products', C: AdminProducts },
  { id: 'orders', label: 'Orders', C: AdminOrders },
  { id: 'messages', label: 'Messages', C: AdminMessages },
];

function Login({ onDone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!password) return;
    setBusy(true);
    setError('');
    try {
      await login(password);
      onDone();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <h1 className="page-h1">{BRAND.name} — Admin</h1>
      <div className="field">
        <label htmlFor="admin-pass">Password</label>
        <input
          id="admin-pass"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        {error && <p className="err" role="alert">{error}</p>}
      </div>
      <button className="btn btn-commerce" style={{ marginTop: 16 }} disabled={busy} onClick={submit}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </div>
  );
}

export default function Admin() {
  useSeo('Admin', 'Store administration');
  const [authed, setAuthed] = useState(() => !!getToken());
  const [tab, setTab] = useState('products');

  if (!authed) {
    return (
      <main className="page admin">
        <Login onDone={() => setAuthed(true)} />
      </main>
    );
  }

  const logout = () => { setToken(null); setAuthed(false); };
  const active = TABS.find((t) => t.id === tab);

  return (
    <main className="page admin">
      <div className="admin-bar">
        <h1 className="page-h1" style={{ margin: 0 }}>{BRAND.name} — Admin</h1>
        <button className="quiet" style={{ textDecoration: 'underline' }} onClick={logout}>
          Sign out
        </button>
      </div>
      <div className="admin-tabs" role="tablist" aria-label="Admin sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`admin-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Session expiry inside a tab bounces back to login. */}
      <active.C onAuthError={() => setAuthed(false)} />
    </main>
  );
}

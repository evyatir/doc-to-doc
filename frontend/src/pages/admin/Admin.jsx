// /admin — internal panel to see who's booked a consultation. Deliberately
// excluded from the public nav and footer; plain and dense, styled with the
// same theme tokens so it reads as the same product family.
import React, { useState } from 'react';
import { BRAND } from '@client/config';
import { useSeo } from '../../seo.js';
import { getToken, setToken, login } from './adminApi.js';
import AdminMessages from './AdminMessages.jsx';

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
  useSeo('Admin', 'Internal — leads from the consultation form');
  const [authed, setAuthed] = useState(() => !!getToken());

  if (!authed) {
    return (
      <main className="page admin">
        <Login onDone={() => setAuthed(true)} />
      </main>
    );
  }

  const logout = () => { setToken(null); setAuthed(false); };

  return (
    <main className="page admin">
      <div className="admin-bar">
        <h1 className="page-h1" style={{ margin: 0 }}>{BRAND.name} — Admin</h1>
        <button className="quiet" style={{ textDecoration: 'underline' }} onClick={logout}>
          Sign out
        </button>
      </div>
      {/* Session expiry bounces back to login. */}
      <AdminMessages onAuthError={() => setAuthed(false)} />
    </main>
  );
}

// Messages tab: contact messages + subscriber list (read-only); subscriber
// emails copyable as one comma-separated string.
import React, { useCallback, useEffect, useState } from 'react';
import { adminFetch } from './adminApi.js';

export default function AdminMessages({ onAuthError }) {
  const [messages, setMessages] = useState(null);
  const [subscribers, setSubscribers] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const [msgs, subs] = await Promise.all([
        adminFetch('/api/admin/messages'),
        adminFetch('/api/admin/subscribers'),
      ]);
      setMessages(msgs);
      setSubscribers(subs);
      setError('');
    } catch (err) {
      if (err.status === 401) return onAuthError();
      setError(err.message || 'Failed to load messages');
    }
  }, [onAuthError]);

  useEffect(() => { load(); }, [load]);

  if (error && !messages) return <p className="err" role="alert">{error}</p>;
  if (!messages || !subscribers) return <p>Loading…</p>;

  const copyEmails = async () => {
    try {
      await navigator.clipboard.writeText(subscribers.map((s) => s.email).join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div>
      <h2 className="admin-h2">Contact messages</h2>
      {!messages.length && <p>No messages yet.</p>}
      {messages.map((m) => (
        <div className="admin-message" key={m.id}>
          <p className="admin-message-head">
            {m.firstName} {m.lastName} &lt;{m.email}&gt;
            {m.phone ? ` · ${m.phone}` : ''}
            {m.wantsNewsletter ? ' · wants newsletter' : ''}
            {' · '}{new Date(m.createdAt).toLocaleString()}
          </p>
          <p>{m.message}</p>
        </div>
      ))}

      <h2 className="admin-h2" style={{ marginTop: 32 }}>Subscribers ({subscribers.length})</h2>
      {subscribers.length > 0 && (
        <div className="admin-actions">
          <button className="btn" onClick={copyEmails}>
            {copied ? 'Copied!' : 'Copy all emails'}
          </button>
        </div>
      )}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Email</th><th>Since</th></tr></thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td>{s.email}</td>
                <td>{new Date(s.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

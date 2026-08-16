// Leads tab: everyone who submitted the Book a Consultation intake form.
import React, { useCallback, useEffect, useState } from 'react';
import { adminFetch } from './adminApi.js';

const STAGE_LABEL = {
  confused: "Still confused — knows they want medicine, not where",
  vision: 'Has a clear vision for themselves',
};

export default function AdminMessages({ onAuthError }) {
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setMessages(await adminFetch('/api/admin/messages'));
      setError('');
    } catch (err) {
      if (err.status === 401) return onAuthError();
      setError(err.message || 'Failed to load leads');
    }
  }, [onAuthError]);

  useEffect(() => { load(); }, [load]);

  if (error && !messages) return <p className="err" role="alert">{error}</p>;
  if (!messages) return <p>Loading…</p>;

  return (
    <div>
      <h2 className="admin-h2">Leads ({messages.length})</h2>
      {!messages.length && <p>No one has booked a call yet.</p>}
      {messages.map((m) => (
        <div className="admin-message" key={m.id}>
          <p className="admin-message-head">
            {m.firstName} {m.lastName} &lt;{m.email}&gt;
            {m.phone ? ` · ${m.phone}` : ''}
            {m.role ? ` · ${m.role}` : ''}
            {' · '}{new Date(m.createdAt).toLocaleString()}
          </p>
          {m.stage && <p className="admin-message-meta">{STAGE_LABEL[m.stage] || m.stage}</p>}
          {m.message && <p>{m.message}</p>}
        </div>
      ))}
    </div>
  );
}

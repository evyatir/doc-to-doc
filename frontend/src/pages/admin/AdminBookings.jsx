// Calls tab: intro calls booked through the site's Cal.com picker (filled by
// the Cal.com webhook). Upcoming first, then past; cancelled and rescheduled
// ones stay listed, marked, so nothing silently disappears.
import React, { useCallback, useEffect, useState } from 'react';
import { adminFetch } from './adminApi.js';

const fmt = (d) => new Date(d).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function Booking({ b }) {
  const off = b.status !== 'booked';
  return (
    <div className="admin-message" style={off ? { opacity: 0.55 } : undefined}>
      <p className="admin-message-head">
        {fmt(b.startsAt)} · {b.name} &lt;{b.email}&gt;
        {b.timeZone ? ` · ${b.timeZone}` : ''}
        {off ? ` · ${b.status.toUpperCase()}` : ''}
      </p>
      {b.note && <p>{b.note}</p>}
      {b.meetingUrl && !off && <p className="admin-message-meta"><a href={b.meetingUrl} target="_blank" rel="noopener noreferrer">Meeting link</a></p>}
    </div>
  );
}

export default function AdminBookings({ onAuthError }) {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setBookings(await adminFetch('/api/admin/bookings'));
      setError('');
    } catch (err) {
      if (err.status === 401) return onAuthError();
      setError(err.message || 'Failed to load calls');
    }
  }, [onAuthError]);

  useEffect(() => { load(); }, [load]);

  if (error && !bookings) return <p className="err" role="alert">{error}</p>;
  if (!bookings) return <p>Loading…</p>;

  const now = Date.now();
  const upcoming = bookings.filter((b) => new Date(b.startsAt) >= now).reverse();
  const past = bookings.filter((b) => new Date(b.startsAt) < now);

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 className="admin-h2">Upcoming calls ({upcoming.filter((b) => b.status === 'booked').length})</h2>
      {!upcoming.length && <p>No calls booked yet.</p>}
      {upcoming.map((b) => <Booking key={b.id} b={b} />)}
      {past.length > 0 && <h2 className="admin-h2">Past calls ({past.length})</h2>}
      {past.map((b) => <Booking key={b.id} b={b} />)}
    </div>
  );
}

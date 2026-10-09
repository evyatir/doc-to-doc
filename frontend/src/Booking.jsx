// Booking designs (branch booking-designs) — three ways to let a lead pick a
// free 30-minute Zoom call instead of writing an email. Slots and bookings go
// through cal.js: real Cal.com when VITE_CAL_USERNAME is set, fake otherwise.
//
// Pick a design with ?design=a|b|c; a small switcher bar is shown for review.
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { getSlots, book, LIVE, TIME_ZONE as TZ } from './cal.js';
import { trackBooking } from './analytics.js';

const API_BASE = import.meta.env.VITE_API_URL || '';

const EMAIL = 'Doctodocmentors@gmail.com';

export const DESIGNS = {
  a: { name: 'Pop-up', blurb: 'Button opens a calendar window' },
  b: { name: 'On the page', blurb: 'Calendar sits in the Contact section' },
  c: { name: 'Quick times', blurb: 'Next free times shown as one-tap chips' },
};

export function currentDesign() {
  const d = new URLSearchParams(window.location.search).get('design');
  return DESIGNS[d] ? d : 'a';
}

// The switcher bar is for review links only (?design=…), never for visitors.
export const REVIEWING = DESIGNS[new URLSearchParams(window.location.search).get('design')] !== undefined;

// Pop-up state shared by every "Book" button on the page (design A).
const BookingCtx = createContext({ openPopup: () => {} });
export const useBooking = () => useContext(BookingCtx);

export function BookingProvider({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <BookingCtx.Provider value={{ openPopup: () => setOpen(true) }}>
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bk-overlay" />
          <Dialog.Content className="bk-dialog" aria-describedby={undefined}>
            <div className="bk-dialog-top">
              <Dialog.Title className="bk-title">Book your free introductory call</Dialog.Title>
              <Dialog.Close className="bk-close" aria-label="Close">×</Dialog.Close>
            </div>
            <Picker />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </BookingCtx.Provider>
  );
}

// Loads free slots once per mount. { days, error } — days null while loading.
function useSlots() {
  const [state, setState] = useState({ days: null, error: false });
  useEffect(() => {
    let live = true;
    // Wake the API (Render free tier sleeps): by the time the visitor has
    // picked a time and confirmed, it's up to receive Cal.com's webhook.
    if (LIVE) fetch(`${API_BASE}/api/health`).catch(() => {});
    getSlots().then(
      (days) => live && setState({ days, error: false }),
      () => live && setState({ days: [], error: true }),
    );
    return () => { live = false; };
  }, []);
  return state;
}

function SlotsFallback({ error }) {
  return (
    <p className="bk-muted">
      {error ? 'We couldn’t load the calendar right now.' : 'No free times in the next few weeks.'}{' '}
      <a className="bk-link" href={`mailto:${EMAIL}`}>Email us</a> and we’ll find a time together.
    </p>
  );
}

const fmtDay = (d) => d.toLocaleDateString('en-GB', { weekday: 'short' });
const fmtNum = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const fmtTime = (d) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const fmtFull = (d) => d.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

function DetailsForm({ slot, onBack, onDone }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    setBusy(true);
    setError('');
    try {
      const res = await book({ start: slot, name: f.get('name'), email: f.get('email'), note: f.get('note') });
      trackBooking();
      onDone({ ...res, email: f.get('email') });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };
  return (
    <form className="bk-form" onSubmit={submit}>
      <p className="bk-chosen">{fmtFull(slot)} · 30 min · Zoom</p>
      <label>Your name<input name="name" required autoComplete="name" /></label>
      <label>Your email<input name="email" type="email" required autoComplete="email" /></label>
      <label>Where are you in your journey? <span>(optional)</span><textarea name="note" rows={2} /></label>
      <div className="bk-form-actions">
        <button type="button" className="bk-link" onClick={onBack}>← Change time</button>
        <button type="submit" className="bk-primary" disabled={busy}>{busy ? 'Booking…' : 'Confirm booking'}</button>
      </div>
      {error && <p className="bk-error" role="alert">{error}</p>}
    </form>
  );
}

function Done({ booking: { start: slot, email } }) {
  return (
    <div className="bk-done">
      <p className="bk-done-mark">✓</p>
      <p className="bk-done-title">You’re booked.</p>
      <p>{fmtFull(slot)}</p>
      <p className="bk-muted">A calendar invite with the Zoom link is on its way to <b>{email}</b>.</p>
      {!LIVE && <p className="bk-preview-note">Preview only — nothing was booked.</p>}
    </div>
  );
}

// Full picker: day strip → times → details → done. Used by designs A and B.
export function Picker() {
  const { days, error } = useSlots();
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState(null);
  const [booking, setBooking] = useState(null);
  if (booking) return <Done booking={booking} />;
  if (slot) return <DetailsForm slot={slot} onBack={() => setSlot(null)} onDone={setBooking} />;
  if (!days) return <p className="bk-muted">Loading available times…</p>;
  if (!days.length) return <SlotsFallback error={error} />;
  return (
    <div className="bk-picker">
      <p className="bk-step">1. Pick a day</p>
      <div className="bk-days" role="listbox" aria-label="Day">
        {days.map((d, i) => (
          <button key={i} type="button" role="option" aria-selected={i === day}
            className={`bk-day ${i === day ? 'is-on' : ''}`} onClick={() => setDay(i)}>
            <span>{fmtDay(d.date)}</span><b>{d.date.getDate()}</b><span>{d.date.toLocaleDateString('en-GB', { month: 'short' })}</span>
          </button>
        ))}
      </div>
      <p className="bk-step">2. Pick a time <span className="bk-muted">({TZ})</span></p>
      <div className="bk-times">
        {days[day].times.map((t) => (
          <button key={+t} type="button" className="bk-time" onClick={() => setSlot(t)}>{fmtTime(t)}</button>
        ))}
      </div>
      <p className="bk-muted bk-small">30-minute Zoom call · free · no commitment</p>
    </div>
  );
}

// Design C: the next few free times as chips, a link to show the full picker.
export function QuickTimes() {
  const { days, error } = useSlots();
  const [slot, setSlot] = useState(null);
  const [booking, setBooking] = useState(null);
  const [more, setMore] = useState(false);
  if (more) return <div className="bk-inline"><Picker /></div>;
  if (booking) return <div className="bk-inline"><Done booking={booking} /></div>;
  if (slot) return <div className="bk-inline"><DetailsForm slot={slot} onBack={() => setSlot(null)} onDone={setBooking} /></div>;
  if (!days) return <p className="bk-quick bk-muted">Loading available times…</p>;
  if (!days.length) return <div className="bk-quick"><SlotsFallback error={error} /></div>;
  const next = days.flatMap((d) => d.times).slice(0, 6);
  return (
    <div className="bk-quick">
      <p className="bk-step">Next free times <span className="bk-muted">({TZ})</span></p>
      <div className="bk-chips">
        {next.map((t) => (
          <button key={+t} type="button" className="bk-chip" onClick={() => setSlot(t)}>
            <span>{fmtDay(t)} {fmtNum(t)}</span><b>{fmtTime(t)}</b>
          </button>
        ))}
      </div>
      <button type="button" className="bk-link" onClick={() => setMore(true)}>See all available times →</button>
    </div>
  );
}

// Floating bar so the reviewer can flip between designs.
export function DesignSwitcher({ design }) {
  const go = (d) => { const u = new URL(window.location.href); u.searchParams.set('design', d); window.location.href = u.toString(); };
  return (
    <div className="bk-switcher" role="navigation" aria-label="Design preview">
      <span>Booking design:</span>
      {Object.entries(DESIGNS).map(([k, v]) => (
        <button key={k} type="button" className={k === design ? 'is-on' : ''} onClick={() => go(k)} title={v.blurb}>
          {k.toUpperCase()} · {v.name}
        </button>
      ))}
    </div>
  );
}

export const bookingCss = `
.bk-overlay{position:fixed;inset:0;z-index:60;background:rgba(20,30,40,.55)}
.bk-dialog{position:fixed;z-index:61;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;background:#f0ede8;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.25);font-family:"DM Sans",Arial,sans-serif;color:#1f2a33}
.bk-dialog-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}
.bk-title{font-family:"Cormorant Garamond",Georgia,serif;font-size:1.9rem;line-height:1.1;font-weight:500;color:#1f2a33}
.bk-close{font-size:1.8rem;line-height:1;background:none;border:0;cursor:pointer;color:#496677}
.bk-step{font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;color:#496677;margin:18px 0 10px;font-weight:500}
.bk-step:first-child{margin-top:0}
.bk-muted{color:#6b7780;text-transform:none;letter-spacing:0;font-weight:400}
.bk-small{font-size:.85rem;margin-top:16px}
.bk-days{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;scrollbar-width:thin}
.bk-day{flex:0 0 auto;width:64px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 0;border:1px solid #c9cfd3;background:#fff;cursor:pointer;font-size:.75rem;color:#496677}
.bk-day b{font-size:1.35rem;font-weight:500;color:#1f2a33}
.bk-day.is-on{background:#496677;border-color:#496677;color:#fff}
.bk-day.is-on b{color:#fff}
.bk-times{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px}
.bk-time{padding:12px 0;border:1px solid #496677;background:#fff;color:#496677;font-size:1rem;cursor:pointer}
.bk-time:hover,.bk-chip:hover{background:#496677;color:#fff}
.bk-chip:hover span{color:#fff}
.bk-form{display:flex;flex-direction:column;gap:14px}
.bk-chosen{font-weight:500;color:#496677;border-left:3px solid #496677;padding-left:10px}
.bk-form label{display:flex;flex-direction:column;gap:6px;font-size:.85rem;color:#1f2a33}
.bk-form label span{color:#6b7780}
.bk-form input,.bk-form textarea{font:inherit;font-size:1rem;padding:10px 12px;border:1px solid #c9cfd3;background:#fff;color:#1f2a33}
.bk-form-actions{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:6px}
.bk-primary{background:#496677;color:#fff;border:0;padding:13px 22px;font:inherit;font-size:.95rem;cursor:pointer}
.bk-link{background:none;border:0;padding:0;font:inherit;font-size:.9rem;color:#496677;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.bk-done{text-align:center;padding:12px 0;display:flex;flex-direction:column;gap:6px}
.bk-done-mark{font-size:2rem;color:#496677}
.bk-done-title{font-family:"Cormorant Garamond",Georgia,serif;font-size:1.8rem}
.bk-error{color:#a0352b;font-size:.9rem}
.bk-primary:disabled{opacity:.6;cursor:default}
.bk-preview-note{margin-top:10px;font-size:.75rem;color:#a0552b}
.bk-inline{background:#fff;border:1px solid #d8dcdf;padding:22px;margin-top:26px;font-family:"DM Sans",Arial,sans-serif;color:#1f2a33}
.bk-inline .bk-day{background:#f0ede8}
.bk-inline .bk-day.is-on{background:#496677}
.bk-quick{margin-top:26px;font-family:"DM Sans",Arial,sans-serif}
.bk-chips{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:16px}
.bk-chip{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:12px 14px;border:1px solid #496677;background:#fff;color:#1f2a33;cursor:pointer;text-align:left}
.bk-chip span{font-size:.78rem;color:#496677}
.bk-chip b{font-size:1.15rem;font-weight:500}
.bk-switcher{position:fixed;z-index:70;left:50%;bottom:16px;transform:translateX(-50%);display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center;max-width:calc(100vw - 32px);background:#1f2a33;color:#fff;padding:8px 10px;font:13px "DM Sans",Arial,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.3)}
.bk-switcher span{opacity:.75;padding:0 4px}
.bk-switcher button{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.35);padding:6px 10px;font:inherit;cursor:pointer}
.bk-switcher button.is-on{background:#fff;color:#1f2a33}
@media (max-width:600px){.bk-switcher{flex-wrap:nowrap;gap:4px;padding:6px;font-size:11px;bottom:10px}.bk-switcher span{display:none}.bk-switcher button{padding:5px 7px;white-space:nowrap}}
`;

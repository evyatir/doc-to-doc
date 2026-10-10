// Cal.com client for the booking picker. Talks to Cal.com's public API v2
// straight from the browser (CORS is open, no API key needed for reading
// free slots or booking as an attendee). Cal.com owns the rest: it checks the
// team's Google Calendar, creates the Google Meet link, and emails the invite to
// the lead and to Doctodocmentors@gmail.com.
//
// VITE_CAL_USERNAME unset = preview mode: fake slots, nothing is booked.
const API = 'https://api.cal.com/v2';
export const CAL_USERNAME = import.meta.env.VITE_CAL_USERNAME || '';
const EVENT_SLUG = import.meta.env.VITE_CAL_EVENT || 'intro-call';
export const LIVE = Boolean(CAL_USERNAME);

export const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

const ymd = (d) => d.toISOString().slice(0, 10);

// Preview slots: next 10 weekdays, a few fixed times, some marked taken.
function fakeSlots() {
  const days = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.length < 10) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const times = [10, 13, 17, 19]
      .filter((h, i) => (d.getDate() + i) % 3 !== 0)
      .map((h) => { const t = new Date(d); t.setHours(h, (h === 13 ? 30 : 0)); return t; });
    days.push({ date: new Date(d), times });
  }
  return days;
}

// Free slots for the next `days` days, grouped by local day:
// [{ date: Date, times: [Date] }], empty days dropped.
export async function getSlots(days = 21) {
  if (!LIVE) return fakeSlots();
  const start = new Date();
  const end = new Date(start.getTime() + days * 86400000);
  const params = new URLSearchParams({
    username: CAL_USERNAME, eventTypeSlug: EVENT_SLUG,
    start: ymd(start), end: ymd(end), timeZone: TIME_ZONE,
  });
  const res = await fetch(`${API}/slots?${params}`, { headers: { 'cal-api-version': '2024-09-04' } });
  if (!res.ok) throw new Error(`Cal.com slots ${res.status}`);
  const { data } = await res.json();
  return Object.keys(data).sort().map((day) => ({
    date: new Date(`${day}T00:00:00`),
    times: data[day].map((s) => new Date(s.start)),
  })).filter((d) => d.times.length);
}

// Book a slot. Resolves with { uid, start, meetingUrl } or throws with a
// message safe to show the visitor.
export async function book({ start, name, email, note }) {
  if (!LIVE) {
    await new Promise((r) => setTimeout(r, 600));
    return { uid: 'preview', start, meetingUrl: null };
  }
  const res = await fetch(`${API}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'cal-api-version': '2024-08-13' },
    body: JSON.stringify({
      start: start.toISOString(),
      username: CAL_USERNAME,
      eventTypeSlug: EVENT_SLUG,
      attendee: { name, email, timeZone: TIME_ZONE, language: 'en' },
      ...(note ? { bookingFieldsResponses: { notes: note } } : {}),
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message || '';
    // Someone else took the slot between loading and confirming.
    if (res.status === 409 || /no.*available|already.*booked/i.test(msg)) {
      throw new Error('That time was just taken. Please pick another one.');
    }
    throw new Error('We couldn’t book that time. Please try again, or email us.');
  }
  const b = body.data;
  return { uid: b.uid, start: new Date(b.start), meetingUrl: b.meetingUrl || b.location || null };
}

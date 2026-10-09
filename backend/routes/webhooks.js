// Cal.com webhook: every booking, reschedule and cancellation of the intro
// call lands in the bookings table, so /admin shows them next to the leads.
// Cal.com signs each delivery: X-Cal-Signature-256 = hex HMAC-SHA256 of the
// raw body with CAL_WEBHOOK_SECRET. Unsigned or badly signed calls are
// rejected; without the secret configured the endpoint is off (503).
import { Router } from 'express';
import crypto from 'node:crypto';
import { query } from '../db.js';

const router = Router();

function validSignature(req) {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  const got = req.get('x-cal-signature-256') || '';
  if (!req.rawBody || !/^[0-9a-f]{64}$/i.test(got)) return false;
  const want = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(want, 'hex'), Buffer.from(got, 'hex'));
}

// Cal.com puts form answers in `responses` ({ field: { value } } or plain
// values, depending on version); attendees[0] is the person who booked.
function answer(p, key) {
  const r = p.responses?.[key];
  return (r && typeof r === 'object' ? r.value : r) || null;
}

function bookingRow(p) {
  const who = p.attendees?.[0] || {};
  return [
    p.uid,
    p.startTime,
    p.endTime || null,
    who.name || answer(p, 'name') || '(no name)',
    who.email || answer(p, 'email') || '',
    who.timeZone || null,
    answer(p, 'notes') || p.additionalNotes || p.description || null,
    p.videoCallData?.url || p.metadata?.videoCallUrl || null,
    p.rescheduleUid || null,
  ];
}

const UPSERT = `
  INSERT INTO bookings (cal_uid, starts_at, ends_at, name, email, time_zone, note, meeting_url, replaces, status)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'booked')
  ON CONFLICT (cal_uid) DO UPDATE SET
    starts_at = EXCLUDED.starts_at, ends_at = EXCLUDED.ends_at, name = EXCLUDED.name,
    email = EXCLUDED.email, time_zone = EXCLUDED.time_zone, note = EXCLUDED.note,
    meeting_url = COALESCE(EXCLUDED.meeting_url, bookings.meeting_url),
    replaces = COALESCE(EXCLUDED.replaces, bookings.replaces), updated_at = now()`;

router.post('/cal', async (req, res, next) => {
  if (!process.env.CAL_WEBHOOK_SECRET) return res.status(503).json({ error: 'Webhook not configured' });
  if (!validSignature(req)) return res.status(401).json({ error: 'Bad signature' });

  const { triggerEvent, payload: p } = req.body || {};
  // Cal.com's "Ping test" button sends no booking.
  if (!p?.uid || !p?.startTime) return res.json({ ok: true, ignored: triggerEvent || 'no booking' });

  try {
    if (triggerEvent === 'BOOKING_CREATED' || triggerEvent === 'BOOKING_RESCHEDULED') {
      await query(UPSERT, bookingRow(p));
      if (p.rescheduleUid) {
        await query(`UPDATE bookings SET status = 'rescheduled', updated_at = now() WHERE cal_uid = $1`, [p.rescheduleUid]);
      }
    } else if (triggerEvent === 'BOOKING_CANCELLED' || triggerEvent === 'BOOKING_REJECTED') {
      // Insert first in case the "created" delivery never arrived.
      await query(UPSERT, bookingRow(p));
      await query(`UPDATE bookings SET status = 'cancelled', updated_at = now() WHERE cal_uid = $1`, [p.uid]);
    } else {
      return res.json({ ok: true, ignored: triggerEvent });
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;

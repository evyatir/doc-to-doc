-- Intro calls booked through Cal.com (the site's booking picker). Rows come
-- from the Cal.com webhook (routes/webhooks.js); Cal.com stays the source of
-- truth for the calendar, this is the leads view of it.
-- status: booked | cancelled | rescheduled (replaced by a newer booking).

CREATE TABLE IF NOT EXISTS bookings (
  id          serial PRIMARY KEY,
  cal_uid     text NOT NULL UNIQUE,
  status      text NOT NULL DEFAULT 'booked',
  starts_at   timestamptz NOT NULL,
  ends_at     timestamptz,
  name        text NOT NULL,
  email       text NOT NULL,
  time_zone   text,
  note        text,
  meeting_url text,
  replaces    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

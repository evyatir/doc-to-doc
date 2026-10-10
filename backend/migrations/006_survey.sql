-- The 12-second survey emailed right after a booking (frontend
-- /survey?b=<cal booking uid>). One answer set per booking; a resubmit
-- replaces it. survey_email_id lets a cancellation cancel the scheduled email.

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS survey_email_id text;

CREATE TABLE IF NOT EXISTS survey_responses (
  id           serial PRIMARY KEY,
  booking_uid  text UNIQUE,
  start_years  jsonb NOT NULL DEFAULT '[]',
  countries    jsonb NOT NULL DEFAULT '[]',
  created_at   timestamptz NOT NULL DEFAULT now()
);

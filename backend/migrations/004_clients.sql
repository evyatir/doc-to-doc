-- Applicant accounts: email+password or Google sign-in (or both, once a
-- password account later links Google). password_hash and google_sub are
-- both nullable because a Google-only account never gets a password.

CREATE TABLE IF NOT EXISTS clients (
  id            serial PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL UNIQUE,
  phone         text,
  password_hash text,
  google_sub    text UNIQUE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

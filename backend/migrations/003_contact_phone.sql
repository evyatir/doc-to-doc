-- Optional phone number on contact messages, so a "we'll call you back" CTA
-- has something to call. Nullable: existing rows have none, and re-running
-- migrate.js must stay a no-op on a column that already exists.

ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS phone text;

-- The consultation intake form (Book a Consultation page) asks two things
-- the original contact form didn't: whether the visitor is a student or a
-- parent, and what stage of the process they're at. Both nullable — the
-- plain /contact usage (if any) never sends them.

ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS stage text;

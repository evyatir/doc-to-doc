-- Product display order (admin drag & drop). Nullable on purpose: migrate.js
-- re-runs every file, and only a NULLS-guarded backfill is safe to repeat —
-- a DEFAULT-value backfill would clobber admin ordering on every migrate.
-- Rows that somehow miss a position sort last (queries use NULLS LAST).

ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order integer;

UPDATE products SET sort_order = id WHERE sort_order IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products (sort_order);

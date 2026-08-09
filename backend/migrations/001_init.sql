-- Storefront schema (BACKEND_SPEC §2). Money is integer agorot everywhere.
-- Sold-out is DERIVED (all variants stock 0) — deliberately no soldOut column.
-- Idempotent: IF NOT EXISTS throughout, safe to re-run.

CREATE TABLE IF NOT EXISTS products (
  id           serial PRIMARY KEY,
  name         text NOT NULL,
  price_agorot integer NOT NULL,
  category     text NOT NULL,
  drop_id      text,
  family       text,
  cut          text,
  size_label   text,
  description  text,
  images       jsonb NOT NULL DEFAULT '[]',
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS variants (
  id         serial PRIMARY KEY,
  product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       text NOT NULL,
  stock      integer NOT NULL DEFAULT 0,
  UNIQUE (product_id, size)
);

CREATE TABLE IF NOT EXISTS orders (
  id              serial PRIMARY KEY,
  -- new -> confirmed -> fulfilled; new/confirmed -> cancelled (enforced in API)
  status          text NOT NULL DEFAULT 'new',
  customer_name   text NOT NULL,
  customer_phone  text NOT NULL,
  customer_email  text,
  note            text,
  subtotal_agorot integer NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id                serial PRIMARY KEY,
  order_id          integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        integer REFERENCES products(id),
  -- SET NULL so deleting a size in admin never breaks order history;
  -- name/size/price are copied below so orders survive product edits.
  variant_id        integer REFERENCES variants(id) ON DELETE SET NULL,
  product_name      text NOT NULL,
  size              text NOT NULL,
  qty               integer NOT NULL,
  unit_price_agorot integer NOT NULL
);

CREATE TABLE IF NOT EXISTS subscribers (
  id         serial PRIMARY KEY,
  email      text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id               serial PRIMARY KEY,
  first_name       text NOT NULL,
  last_name        text NOT NULL,
  email            text NOT NULL,
  message          text NOT NULL,
  wants_newsletter boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

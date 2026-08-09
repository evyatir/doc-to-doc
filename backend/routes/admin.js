// Admin API. Everything except /login sits behind requireAdmin (JWT).
import express, { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { query, tx } from '../db.js';
import { fetchProducts } from '../queries.js';
import { signAdminToken, requireAdmin } from '../auth.js';
import { getStorage, IMAGE_TYPES } from '../storage/index.js';

const router = Router();

function parseBody(schema, req, res) {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Invalid request',
      fields: result.error.flatten().fieldErrors,
    });
    return null;
  }
  return result.data;
}

const loginSchema = z.object({ password: z.string().min(1) });

router.post('/login', async (req, res, next) => {
  const body = parseBody(loginSchema, req, res);
  if (!body) return;
  try {
    if (!process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD_HASH) {
      return res.status(503).json({ error: 'Admin not configured (set JWT_SECRET and ADMIN_PASSWORD_HASH)' });
    }
    const ok = await bcrypt.compare(body.password, process.env.ADMIN_PASSWORD_HASH);
    if (!ok) return res.status(401).json({ error: 'Wrong password' });
    res.json({ token: signAdminToken() });
  } catch (err) { next(err); }
});

router.use(requireAdmin);

// ---------- image upload ----------

// Body is the raw file bytes (Content-Type gates which requests parse), name
// via ?filename=. Deliberately not multipart: one file per request keeps this
// dependency-free. A wrong content type skips express.raw, leaving req.body
// as {} -> clean 400 below. Oversize -> 413 via the global error handler.
router.post('/upload',
  express.raw({ type: IMAGE_TYPES, limit: '5mb' }),
  async (req, res, next) => {
    try {
      if (!Buffer.isBuffer(req.body) || !req.body.length) {
        return res.status(400).json({
          error: `Send the image file as the request body (${IMAGE_TYPES.join(', ')}; max 5 MB)`,
        });
      }
      const { url } = await getStorage().uploadImage(req.body, {
        filename: String(req.query.filename || ''),
        contentType: req.headers['content-type'],
      });
      res.status(201).json({ url });
    } catch (err) { next(err); }
  });

// ---------- products ----------

const variantSchema = z.object({
  size: z.string().trim().min(1),
  stock: z.number().int().min(0),
});

const productSchema = z.object({
  name: z.string().trim().min(1),
  priceAgorot: z.number().int().min(0),
  category: z.string().trim().min(1),
  dropId: z.string().trim().optional().nullable(),
  family: z.string().trim().optional().nullable(),
  cut: z.string().trim().optional().nullable(),
  sizeLabel: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  images: z.array(z.string().trim()).default([]),
  active: z.boolean().default(true),
  variants: z.array(variantSchema).min(1)
    .refine(
      (vs) => new Set(vs.map((v) => v.size)).size === vs.length,
      { message: 'Duplicate sizes' }
    ),
});

router.get('/products', async (req, res, next) => {
  try {
    res.json(await fetchProducts({ activeOnly: false }));
  } catch (err) { next(err); }
});

router.post('/products', async (req, res, next) => {
  const body = parseBody(productSchema, req, res);
  if (!body) return;
  try {
    const id = await tx(async (client) => {
      const inserted = await client.query(
        `INSERT INTO products (name, price_agorot, category, drop_id, family, cut,
           size_label, description, images, active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
           (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM products)) RETURNING id`,
        [body.name, body.priceAgorot, body.category, body.dropId || null,
         body.family || null, body.cut || null, body.sizeLabel || null,
         body.description || null, JSON.stringify(body.images), body.active]
      );
      const productId = inserted.rows[0].id;
      for (const v of body.variants) {
        await client.query(
          'INSERT INTO variants (product_id, size, stock) VALUES ($1, $2, $3)',
          [productId, v.size, v.stock]
        );
      }
      return productId;
    });
    const [product] = await fetchProducts({ activeOnly: false, id });
    res.status(201).json(product);
  } catch (err) { next(err); }
});

// Registered before /products/:id so ":id" can't capture the word "reorder".
// Takes the complete ordered id list from the admin table (active + inactive)
// and rewrites sort_order as 1..N in one atomic statement.
const reorderSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1)
    .refine((a) => new Set(a).size === a.length, { message: 'Duplicate ids' }),
});

router.put('/products/reorder', async (req, res, next) => {
  const body = parseBody(reorderSchema, req, res);
  if (!body) return;
  try {
    const result = await query(
      `UPDATE products AS p SET sort_order = x.ord
       FROM unnest($1::int[]) WITH ORDINALITY AS x(id, ord)
       WHERE p.id = x.id`,
      [body.ids]
    );
    if (result.rowCount !== body.ids.length) {
      return res.status(409).json({ error: 'Product list changed, reload and retry' });
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.put('/products/:id', async (req, res, next) => {
  const body = parseBody(productSchema, req, res);
  if (!body) return;
  try {
    const id = Number(req.params.id);
    const updated = await tx(async (client) => {
      const result = await client.query(
        `UPDATE products SET name=$1, price_agorot=$2, category=$3, drop_id=$4,
           family=$5, cut=$6, size_label=$7, description=$8, images=$9, active=$10
         WHERE id=$11 RETURNING id`,
        [body.name, body.priceAgorot, body.category, body.dropId || null,
         body.family || null, body.cut || null, body.sizeLabel || null,
         body.description || null, JSON.stringify(body.images), body.active, id]
      );
      if (!result.rows.length) return false;
      // Reconcile variants: upsert incoming sizes, drop removed ones
      // (order_items.variant_id is ON DELETE SET NULL, history is safe).
      const sizes = body.variants.map((v) => v.size);
      await client.query(
        'DELETE FROM variants WHERE product_id = $1 AND NOT (size = ANY($2))',
        [id, sizes]
      );
      for (const v of body.variants) {
        await client.query(
          `INSERT INTO variants (product_id, size, stock) VALUES ($1, $2, $3)
           ON CONFLICT (product_id, size) DO UPDATE SET stock = EXCLUDED.stock`,
          [id, v.size, v.stock]
        );
      }
      return true;
    });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    const [product] = await fetchProducts({ activeOnly: false, id });
    res.json(product);
  } catch (err) { next(err); }
});

// Soft delete — orders keep their history, product just leaves the storefront.
router.delete('/products/:id', async (req, res, next) => {
  try {
    const result = await query(
      'UPDATE products SET active = false WHERE id = $1 RETURNING id',
      [Number(req.params.id)]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ---------- orders ----------

// new -> confirmed -> fulfilled; cancel allowed while not fulfilled.
const TRANSITIONS = {
  new: ['confirmed', 'cancelled'],
  confirmed: ['fulfilled', 'cancelled'],
  fulfilled: [],
  cancelled: [],
};

router.get('/orders', async (req, res, next) => {
  try {
    const params = [];
    let where = '';
    if (req.query.status) {
      params.push(req.query.status);
      where = 'WHERE o.status = $1';
    }
    const result = await query(
      `SELECT o.*,
         COALESCE(
           json_agg(json_build_object(
             'id', i.id, 'productId', i.product_id, 'variantId', i.variant_id,
             'productName', i.product_name, 'size', i.size, 'qty', i.qty,
             'unitPriceAgorot', i.unit_price_agorot
           ) ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL),
           '[]'
         ) AS items
       FROM orders o
       LEFT JOIN order_items i ON i.order_id = o.id
       ${where}
       GROUP BY o.id ORDER BY o.id DESC`,
      params
    );
    const counts = await query('SELECT status, count(*)::int AS n FROM orders GROUP BY status');
    res.json({
      orders: result.rows.map((o) => ({
        id: o.id,
        status: o.status,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        customerEmail: o.customer_email,
        note: o.note,
        subtotalAgorot: o.subtotal_agorot,
        createdAt: o.created_at,
        items: o.items,
      })),
      counts: Object.fromEntries(counts.rows.map((r) => [r.status, r.n])),
    });
  } catch (err) { next(err); }
});

const statusSchema = z.object({
  status: z.enum(['new', 'confirmed', 'fulfilled', 'cancelled']),
});

router.put('/orders/:id', async (req, res, next) => {
  const body = parseBody(statusSchema, req, res);
  if (!body) return;
  try {
    const outcome = await tx(async (client) => {
      const found = await client.query(
        'SELECT status FROM orders WHERE id = $1 FOR UPDATE',
        [Number(req.params.id)]
      );
      if (!found.rows.length) return { missing: true };
      const current = found.rows[0].status;
      if (!(TRANSITIONS[current] || []).includes(body.status)) {
        return { invalid: current };
      }
      await client.query('UPDATE orders SET status = $1 WHERE id = $2',
        [body.status, Number(req.params.id)]);
      return { ok: true };
    });
    if (outcome.missing) return res.status(404).json({ error: 'Order not found' });
    if (outcome.invalid) {
      return res.status(409).json({ error: `Cannot change status from "${outcome.invalid}" to "${body.status}"` });
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ---------- messages & subscribers ----------

router.get('/messages', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, first_name, last_name, email, phone, message, wants_newsletter, created_at
       FROM contact_messages ORDER BY id DESC`
    );
    res.json(result.rows.map((m) => ({
      id: m.id,
      firstName: m.first_name,
      lastName: m.last_name,
      email: m.email,
      phone: m.phone,
      message: m.message,
      wantsNewsletter: m.wants_newsletter,
      createdAt: m.created_at,
    })));
  } catch (err) { next(err); }
});

router.get('/subscribers', async (req, res, next) => {
  try {
    const result = await query('SELECT id, email, created_at FROM subscribers ORDER BY id DESC');
    res.json(result.rows.map((s) => ({ id: s.id, email: s.email, createdAt: s.created_at })));
  } catch (err) { next(err); }
});

export default router;

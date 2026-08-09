// Public storefront API: products, orders, newsletter, contact.
import { Router } from 'express';
import { z } from 'zod';
import { query, tx } from '../db.js';
import { fetchProducts } from '../queries.js';

const router = Router();

// zod parse -> 400 { error, fields } on failure, null on success (response sent).
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

router.get('/products', async (req, res, next) => {
  try {
    const products = await fetchProducts({
      activeOnly: true,
      category: req.query.category || undefined,
      family: req.query.family || undefined,
    });
    res.json(products);
  } catch (err) { next(err); }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(404).json({ error: 'Product not found' });
    const [product] = await fetchProducts({ activeOnly: true, id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
});

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1),
    phone: z.string().trim().min(3),
    email: z.string().trim().email().optional().or(z.literal('')),
  }),
  note: z.string().trim().max(2000).optional(),
  items: z.array(z.object({
    productId: z.coerce.number().int().positive(),
    size: z.string().min(1),
    qty: z.number().int().min(1).max(99),
  })).min(1)
    .refine(
      (items) => new Set(items.map((i) => `${i.productId}:${i.size}`)).size === items.length,
      { message: 'Duplicate order lines' }
    ),
});

// Stock check + decrement + order insert in ONE transaction. Any short line
// aborts the whole order with per-line detail (409); nothing is decremented.
router.post('/orders', async (req, res, next) => {
  const body = parseBody(orderSchema, req, res);
  if (!body) return;
  try {
    const outcome = await tx(async (client) => {
      const shortages = [];
      const lines = [];
      for (const item of body.items) {
        const found = await client.query(
          `SELECT v.id AS variant_id, v.stock, p.id AS product_id, p.name,
                  p.price_agorot, p.active
           FROM variants v JOIN products p ON p.id = v.product_id
           WHERE v.product_id = $1 AND v.size = $2
           FOR UPDATE OF v`,
          [item.productId, item.size]
        );
        const row = found.rows[0];
        if (!row || !row.active) {
          shortages.push({ productId: item.productId, size: item.size, requested: item.qty, available: 0 });
        } else if (row.stock < item.qty) {
          shortages.push({ productId: item.productId, size: item.size, requested: item.qty, available: row.stock });
        } else {
          lines.push({ ...item, variantId: row.variant_id, name: row.name, unitPrice: row.price_agorot });
        }
      }
      if (shortages.length) return { shortages };

      for (const line of lines) {
        await client.query('UPDATE variants SET stock = stock - $1 WHERE id = $2', [line.qty, line.variantId]);
      }
      const subtotal = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
      const order = await client.query(
        `INSERT INTO orders (customer_name, customer_phone, customer_email, note, subtotal_agorot)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [body.customer.name, body.customer.phone, body.customer.email || null, body.note || null, subtotal]
      );
      const orderId = order.rows[0].id;
      for (const line of lines) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, variant_id, product_name, size, qty, unit_price_agorot)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [orderId, line.productId, line.variantId, line.name, line.size, line.qty, line.unitPrice]
        );
      }
      return { orderId, subtotal };
    });

    if (outcome.shortages) {
      return res.status(409).json({ error: 'Insufficient stock', lines: outcome.shortages });
    }
    res.status(201).json({ orderId: outcome.orderId, subtotal: outcome.subtotal });
  } catch (err) { next(err); }
});

const emailSchema = z.object({ email: z.string().trim().email() });

router.post('/newsletter', async (req, res, next) => {
  const body = parseBody(emailSchema, req, res);
  if (!body) return;
  try {
    await query(
      'INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
      [body.email.toLowerCase()]
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

const contactSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  message: z.string().trim().min(1).max(5000),
  wantsNewsletter: z.boolean().optional().default(false),
});

router.post('/contact', async (req, res, next) => {
  const body = parseBody(contactSchema, req, res);
  if (!body) return;
  try {
    await query(
      `INSERT INTO contact_messages (first_name, last_name, email, phone, message, wants_newsletter)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [body.firstName, body.lastName, body.email, body.phone || null, body.message, body.wantsNewsletter]
    );
    if (body.wantsNewsletter) {
      await query(
        'INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
        [body.email.toLowerCase()]
      );
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;

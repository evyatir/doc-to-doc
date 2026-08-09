// Seeds products + variants from clients/demo/config.js PRODUCTS.
//
// Idempotency strategy (documented per spec): UPSERT, not truncate — truncating
// would cascade into order history. Products are keyed on their unique config
// name (the schema has no slug column); re-running updates product fields in
// place. Variants insert with ON CONFLICT (product_id, size) DO NOTHING so a
// re-run never duplicates rows AND never clobbers stock the admin has edited.
// Default stock 10 per size; config `soldOut: true` seeds stock 0.
import 'dotenv/config';
import { configured, tx, end } from '../db.js';
import { PRODUCTS } from '../../clients/demo/config.js';

if (!configured) {
  console.error('db:seed needs a database. Set DATABASE_URL in .env (see .env.example).');
  process.exit(1);
}

try {
  await tx(async (client) => {
    for (const p of PRODUCTS) {
      const fields = [
        p.price * 100, // config prices are shekels; DB is agorot
        p.cat,
        p.drop || null,
        p.family || null,
        p.cut || null,
        p.sizeLabel || null,
        p.desc || null,
        JSON.stringify(p.imgs || []),
      ];
      const existing = await client.query('SELECT id FROM products WHERE name = $1', [p.name]);
      let productId;
      if (existing.rows.length) {
        productId = existing.rows[0].id;
        // sort_order deliberately untouched here — like stock, ordering the
        // admin has set must survive a re-seed.
        await client.query(
          `UPDATE products SET price_agorot=$1, category=$2, drop_id=$3, family=$4,
             cut=$5, size_label=$6, description=$7, images=$8, active=true
           WHERE id=$9`,
          [...fields, productId]
        );
      } else {
        const inserted = await client.query(
          `INSERT INTO products (name, price_agorot, category, drop_id, family, cut,
             size_label, description, images, sort_order)
           VALUES ($9, $1, $2, $3, $4, $5, $6, $7, $8,
             (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM products)) RETURNING id`,
          [...fields, p.name]
        );
        productId = inserted.rows[0].id;
      }
      const stock = p.soldOut ? 0 : 10;
      for (const size of p.sizes || []) {
        await client.query(
          `INSERT INTO variants (product_id, size, stock) VALUES ($1, $2, $3)
           ON CONFLICT (product_id, size) DO NOTHING`,
          [productId, size, stock]
        );
      }
    }
  });
  console.log(`Seeded ${PRODUCTS.length} products (existing stock preserved).`);
} catch (err) {
  console.error(`Seed failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await end();
}

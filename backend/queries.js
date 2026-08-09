// Shared product read queries (public + admin routes).
import { query } from './db.js';

// Rows -> API shape. soldOut is DERIVED: no purchasable variant has stock.
export function toProductJson(row) {
  const variants = row.variants || [];
  return {
    id: row.id,
    name: row.name,
    priceAgorot: row.price_agorot,
    category: row.category,
    dropId: row.drop_id,
    family: row.family,
    cut: row.cut,
    sizeLabel: row.size_label,
    description: row.description,
    images: row.images || [],
    active: row.active,
    createdAt: row.created_at,
    variants,
    soldOut: variants.every((v) => v.stock <= 0),
  };
}

const PRODUCT_SELECT = `
  SELECT p.*,
    COALESCE(
      json_agg(json_build_object('id', v.id, 'size', v.size, 'stock', v.stock)
               ORDER BY v.id)
      FILTER (WHERE v.id IS NOT NULL),
      '[]'
    ) AS variants
  FROM products p
  LEFT JOIN variants v ON v.product_id = p.id`;

export async function fetchProducts({ activeOnly = true, category, family, id } = {}) {
  const where = [];
  const params = [];
  if (activeOnly) where.push('p.active = true');
  if (category) { params.push(category); where.push(`p.category = $${params.length}`); }
  if (family) { params.push(family); where.push(`p.family = $${params.length}`); }
  if (id != null) { params.push(id); where.push(`p.id = $${params.length}`); }
  const sql = `${PRODUCT_SELECT}
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    GROUP BY p.id ORDER BY p.sort_order NULLS LAST, p.id`;
  const result = await query(sql, params);
  return result.rows.map(toProductJson);
}

// Dev-only config validation. Warn, never throw — a half-filled config must render.
import { BRAND, CATEGORIES, DROPS, PRODUCTS, SIZE_GUIDE } from '@client/config';

export function validateConfig() {
  if (!import.meta.env.DEV) return;
  const warn = (msg) => console.warn(`[config] ${msg}`);

  ['name'].forEach((k) => {
    if (!BRAND[k]) warn(`BRAND.${k} is empty (required)`);
  });

  const ids = new Set();
  const catIds = new Set(CATEGORIES.map((c) => c.id));
  const dropIds = new Set(DROPS.map((d) => d.id));
  const familyCounts = {};

  PRODUCTS.forEach((p) => {
    if (ids.has(p.id)) warn(`duplicate product id "${p.id}"`);
    ids.add(p.id);
    if (p.cat && !catIds.has(p.cat)) warn(`product "${p.id}" references missing category "${p.cat}"`);
    if (p.drop && !dropIds.has(p.drop)) warn(`product "${p.id}" references missing drop "${p.drop}"`);
    if (p.family) familyCounts[p.family] = (familyCounts[p.family] || 0) + 1;
  });
  Object.entries(familyCounts).forEach(([f, n]) => {
    if (n < 2) warn(`family "${f}" has only one product — "Complete the set" needs siblings`);
  });

  // Size-guide ranges must ascend row-to-row (catches the reference's "72-72cm" typo class).
  (SIZE_GUIDE.tables || []).forEach((t) => {
    for (let col = 1; col < (t.cols || []).length; col++) {
      let prev = -Infinity;
      (t.rows || []).forEach((row, ri) => {
        const nums = String(row[col] || '').match(/\d+/g);
        if (!nums) return;
        const [lo, hi] = [Number(nums[0]), Number(nums[1] ?? nums[0])];
        if (hi < lo) warn(`size guide "${t.title}" row ${ri + 1} (${t.cols[col]}): range ${row[col]} is descending`);
        if (lo < prev) warn(`size guide "${t.title}" row ${ri + 1} (${t.cols[col]}): ${row[col]} not ascending vs previous row`);
        prev = lo;
      });
    }
  });
}

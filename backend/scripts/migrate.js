// Runs every .sql file in backend/migrations in filename order.
// Files are idempotent (IF NOT EXISTS), so re-running is safe.
import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { configured, query, end } from '../db.js';

if (!configured) {
  console.error('db:migrate needs a database. Set DATABASE_URL in .env (see .env.example).');
  process.exit(1);
}

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

try {
  for (const file of files) {
    const sql = await readFile(path.join(dir, file), 'utf8');
    await query(sql);
    console.log(`migrated: ${file}`);
  }
  console.log('Migration complete.');
} catch (err) {
  console.error(`Migration failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await end();
}

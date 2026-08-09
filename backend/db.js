// The ONLY module that touches the database driver. Routes import { query, tx }
// from here and never `pg` directly — if the database technology ever changes,
// this file is the only thing that changes.
//
// With no DATABASE_URL the pool is never created; `configured` is false and the
// gate middleware in index.js turns every data route into a 503. Nothing else
// in the server may branch on database presence.
import pg from 'pg';

const url = process.env.DATABASE_URL || '';

export const configured = Boolean(url);

// DATABASE_SSL: auto (TLS unless localhost) | require | off.
function sslFor(connectionString) {
  const mode = (process.env.DATABASE_SSL || 'auto').toLowerCase();
  if (mode === 'off') return false;
  if (mode === 'require') return { rejectUnauthorized: false };
  try {
    const host = new URL(connectionString).hostname;
    const local = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    return local ? false : { rejectUnauthorized: false };
  } catch {
    return { rejectUnauthorized: false };
  }
}

let pool = null;
function getPool() {
  if (!configured) {
    const err = new Error('Database not configured');
    err.status = 503;
    throw err;
  }
  if (!pool) {
    pool = new pg.Pool({ connectionString: url, ssl: sslFor(url) });
  }
  return pool;
}

export function query(text, params) {
  return getPool().query(text, params);
}

// Run `fn(client)` inside a transaction; rolls back on any throw.
export async function tx(fn) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function end() {
  if (pool) await pool.end();
}

// Storefront API server. Boots with an EMPTY .env: without DATABASE_URL it
// runs degraded — health reports db:false and the gate below turns every data
// route into an honest 503 (the frontend's signal to fall back to config
// products). That gate is the ONLY code path that branches on the database.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { configured } from './db.js';
import { UPLOADS_DIR } from './storage/local.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Trust one hop of proxy (Render/Coolify/any reverse-proxy deploy) so
// req.ip is the visitor's real address, not the proxy's — the /api/contact
// rate limiter is per-IP and useless if every request looks like it came
// from the same load balancer.
app.set('trust proxy', 1);

// CORS_ORIGIN empty = same-origin only (dev proxy needs no CORS headers).
if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) }));
}
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: configured });
});

// Uploaded product images. Mounted BEFORE the degraded-mode gate: already-
// uploaded files must keep serving even with the database down. Filenames are
// unique per upload (see storage/local.js), so far-future caching is safe.
app.use('/api/uploads', express.static(UPLOADS_DIR, {
  immutable: true,
  maxAge: '365d',
  fallthrough: true,
}));

// Degraded-mode gate. Admin login is exempt (it only reads env vars).
app.use('/api', (req, res, next) => {
  if (!configured && req.path !== '/admin/login') {
    return res.status(503).json({ error: 'Database not configured' });
  }
  next();
});

app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Static frontend (single-container production deploy) ---
// When a Vite build exists at frontend/dist, this same server also serves the
// storefront, so ONE container = the whole site (no separate frontend host, no
// CORS). Skipped in dev / API-only mode (no dist present), where Vite's dev
// server or a CDN serves the frontend instead. /api/* never reaches here — the
// /api 404 above already responded.
const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'frontend', 'dist');
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir));
  // SPA fallback: deep links / refreshes (React Router) return index.html.
  app.get('*', (req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

// Errors leave as { error } — never a stack trace.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Server error' : err.message });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(configured
    ? `API listening on http://localhost:${port} (db: configured)`
    : `API listening on http://localhost:${port} — DATABASE_URL not set: data routes return 503, storefront falls back to config products`);
});

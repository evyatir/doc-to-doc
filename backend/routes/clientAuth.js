// Applicant accounts: email+password signup/login, or Google sign-in.
// Separate from admin auth (routes/admin.js) — clients never get store access.
import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { query } from '../db.js';
import { signClientToken, requireClient } from '../auth.js';

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

const signupSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

router.post('/signup', async (req, res, next) => {
  const body = parseBody(signupSchema, req, res);
  if (!body) return;
  try {
    const passwordHash = await bcrypt.hash(body.password, 10);
    const result = await query(
      `INSERT INTO clients (name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [body.name, body.email, body.phone || null, passwordHash]
    );
    if (!result.rows.length) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    res.status(201).json({ token: signClientToken(result.rows[0].id) });
  } catch (err) { next(err); }
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

router.post('/login', async (req, res, next) => {
  const body = parseBody(loginSchema, req, res);
  if (!body) return;
  try {
    const result = await query('SELECT id, password_hash FROM clients WHERE email = $1', [body.email]);
    const row = result.rows[0];
    const ok = row?.password_hash && (await bcrypt.compare(body.password, row.password_hash));
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ token: signClientToken(row.id) });
  } catch (err) { next(err); }
});

const googleSchema = z.object({ credential: z.string().min(1) });
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

router.post('/google', async (req, res, next) => {
  const body = parseBody(googleSchema, req, res);
  if (!body) return;
  if (!googleClient) return res.status(503).json({ error: 'Google sign-in not configured' });
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();
    // Upsert by email: a password account that later signs in with the same
    // Google email just gets a google_sub attached, not a duplicate row.
    const result = await query(
      `INSERT INTO clients (name, email, google_sub)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET google_sub = EXCLUDED.google_sub
       RETURNING id`,
      [payload.name || email, email, payload.sub]
    );
    res.json({ token: signClientToken(result.rows[0].id) });
  } catch (err) {
    if (err.message?.includes('Token used too late') || err.message?.includes('Wrong number of segments')) {
      return res.status(401).json({ error: 'Google sign-in failed, please try again' });
    }
    next(err);
  }
});

router.get('/me', requireClient, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, phone, created_at FROM clients WHERE id = $1',
      [req.clientId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

export default router;

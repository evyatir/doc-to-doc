// Admin-only JWT auth. No customer accounts.
import jwt from 'jsonwebtoken';

const TOKEN_TTL = '24h';

export function signAdminToken() {
  return jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

// 401 on missing/invalid/expired token. Applied to everything under
// /api/admin except /api/admin/login.
export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !process.env.JWT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

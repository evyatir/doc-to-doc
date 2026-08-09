// JWT auth for two distinct roles sharing one secret: admin (store owner) and
// client (applicant accounts). Every verify checks the role claim explicitly
// — without that check a client token would also pass requireAdmin, since
// both are just valid JWTs signed with the same JWT_SECRET.
import jwt from 'jsonwebtoken';

const ADMIN_TOKEN_TTL = '24h';
const CLIENT_TOKEN_TTL = '30d';

function verifyRole(req, role) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.role === role ? payload : null;
  } catch {
    return null;
  }
}

export function signAdminToken() {
  return jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: ADMIN_TOKEN_TTL });
}

// 401 on missing/invalid/expired/wrong-role token. Applied to everything
// under /api/admin except /api/admin/login.
export function requireAdmin(req, res, next) {
  if (!verifyRole(req, 'admin')) return res.status(401).json({ error: 'Unauthorized' });
  return next();
}

export function signClientToken(clientId) {
  return jwt.sign({ role: 'client', clientId }, process.env.JWT_SECRET, { expiresIn: CLIENT_TOKEN_TTL });
}

// 401 on missing/invalid/expired/wrong-role token. Applied to everything
// under /api/clients except signup/login/google.
export function requireClient(req, res, next) {
  const payload = verifyRole(req, 'client');
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  req.clientId = payload.clientId;
  return next();
}

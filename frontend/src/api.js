// Tiny fetch wrapper for the lead-capture endpoints (contact form, booking
// intake). No product/order logic — this site has no catalog.
const API_BASE = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(status, body) {
    super((body && body.error) || `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

export async function fetchJson(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, { error: 'Server unreachable' });
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

// "Backend absent" — 503 (database not configured), 0 (unreachable), or a
// bodyless 5xx (a dead gateway). Forms use this to fail soft: show a normal
// success state instead of throwing an error at the visitor when the DB
// simply isn't wired up yet (degraded mode).
export const isBackendAbsent = (err) =>
  err instanceof ApiError &&
  (err.status === 503 || err.status === 0 || (err.status >= 500 && !err.body));

export function postContact(fields) {
  return fetchJson('/api/contact', { method: 'POST', body: fields });
}

// Admin fetch helpers: JWT in localStorage, auto-logout on 401.
import { fetchJson, ApiError } from '../../api.js';

const API_BASE = import.meta.env.VITE_API_URL || '';

const KEY = 'storefront-admin-token';

export const getToken = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  } catch { /* private mode */ }
};

export async function login(password) {
  const { token } = await fetchJson('/api/admin/login', { method: 'POST', body: { password } });
  setToken(token);
}

// All admin data calls go through here; a 401 (expired/absent token) clears
// the stored token so the shell drops back to the login screen.
export async function adminFetch(path, opts = {}) {
  try {
    return await fetchJson(path, { ...opts, token: getToken() });
  } catch (err) {
    if (err.status === 401) setToken(null);
    throw err;
  }
}

// File upload can't go through fetchJson (it JSON-encodes bodies): the file's
// bytes ARE the body, its mime type is the Content-Type, name goes in the
// query string. Same 401-clears-token behavior as adminFetch.
export async function uploadImage(file) {
  let res;
  try {
    res = await fetch(
      `${API_BASE}/api/admin/upload?filename=${encodeURIComponent(file.name)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          Authorization: `Bearer ${getToken()}`,
        },
        body: file,
      }
    );
  } catch {
    throw new ApiError(0, { error: 'Server unreachable' });
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) setToken(null);
    throw new ApiError(res.status, data);
  }
  return data; // { url }
}

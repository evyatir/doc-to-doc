// Applicant-account auth: JWT in localStorage, separate namespace from the
// admin token in pages/admin/adminApi.js so a client and an admin session can
// coexist in the same browser.
import { fetchJson } from './api.js';

const KEY = 'storefront-client-token';

export const getClientToken = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

const setClientToken = (token) => {
  try {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  } catch { /* private mode */ }
};

export const isSignedIn = () => Boolean(getClientToken());

export async function signup({ name, email, phone, password }) {
  const { token } = await fetchJson('/api/clients/signup', {
    method: 'POST',
    body: { name, email, phone, password },
  });
  setClientToken(token);
}

export async function login(email, password) {
  const { token } = await fetchJson('/api/clients/login', {
    method: 'POST',
    body: { email, password },
  });
  setClientToken(token);
}

export async function loginWithGoogle(credential) {
  const { token } = await fetchJson('/api/clients/google', {
    method: 'POST',
    body: { credential },
  });
  setClientToken(token);
}

export function logout() {
  setClientToken(null);
}

export async function fetchMe() {
  return fetchJson('/api/clients/me', { token: getClientToken() });
}

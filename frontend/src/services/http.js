// Shared HTTP layer for the frontend: base URL, session storage and the single
// request() used by every service. Attaches the Bearer token and, on a 401,
// clears the session and notifies the app so it can return to the login screen.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const TOKEN_KEY = 'g4_token';
const USER_KEY = 'g4_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function isAdmin() {
  return getUser()?.role === 'admin';
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function request(path, { auth = true, ...options } = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está no ar.');
  }

  let payload = null;
  const text = await response.text();
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = null; }
  }

  if (response.status === 401 && auth) {
    // Session expired/invalid: drop it and let the app show the login screen.
    clearSession();
    window.dispatchEvent(new Event('g4:unauthorized'));
  }

  if (!response.ok) {
    const error = new Error(payload?.message || `Erro ${response.status}`);
    error.code = payload?.code;
    error.status = response.status;
    error.details = payload?.details;
    throw error;
  }

  return payload?.data;
}

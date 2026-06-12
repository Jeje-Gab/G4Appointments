import {
  request,
  setSession,
  clearSession,
  getUser,
  isAuthenticated,
  isAdmin,
} from './http.js';

export { getUser, isAuthenticated, isAdmin };

// Logs in any role (admin | user) and stores the session.
export async function login(username, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ username, password }),
  });
  setSession(data.token, data.user);
  return data.user;
}

export async function logout() {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } finally {
    clearSession();
  }
}

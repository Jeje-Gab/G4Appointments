// Users service: user management (/api/admin/users). Admin role only — the
// backend enforces it; the UI also hides this area from non-admins.
import { request } from './http.js';

export function listUsers() {
  return request('/api/admin/users');
}

export function createUser({ username, password, role }) {
  return request('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify({ username, password, role }),
  });
}

export function changeUserPassword(id, password) {
  return request(`/api/admin/users/${id}/password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

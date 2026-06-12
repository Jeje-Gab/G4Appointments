// Admin service: API key management (/api/admin/*). Requires the 'admin' role —
// the backend enforces it; the UI also hides this area from non-admins.
import { request } from './http.js';

export function listClients() {
  return request('/api/admin/clients');
}

export function createClient(name) {
  return request('/api/admin/clients', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function revokeClient(id) {
  return request(`/api/admin/clients/${id}/revoke`, { method: 'POST' });
}

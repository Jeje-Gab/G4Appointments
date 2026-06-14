import { request } from './http.js';

export function listPatients() {
  return request('/api/patients');
}

import { request } from './http.js';

export function listPatients() {
  return request('/api/patients');
}

export function getPatient(id) {
  return request(`/api/patients/${id}`);
}

export function createPatient(body) {
  return request('/api/patients', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// Consultations service (internal API /api/*). All calls require a logged-in
// session — the shared request() attaches the Bearer token automatically.
import { request } from './http.js';

export function listConsultations(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.patientId) params.set('patientId', filters.patientId);
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  const qs = params.toString();
  return request(`/api/consultations${qs ? `?${qs}` : ''}`);
}

export function getConsultation(id) {
  return request(`/api/consultations/${id}`);
}

export function createConsultation(body) {
  return request('/api/consultations', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateConsultationStatus(id, status) {
  return request(`/api/consultations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function cancelConsultation(id) {
  return request(`/api/consultations/${id}`, { method: 'DELETE' });
}

export function getPatientHistory(patientId) {
  return request(`/api/patients/${patientId}/consultations/history`);
}

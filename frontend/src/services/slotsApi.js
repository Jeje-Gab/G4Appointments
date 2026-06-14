import { request } from './http.js';

export function listAvailableSlots() {
  return request('/api/slots');
}

export function listAllSlots() {
  return request('/api/slots/all');
}

export function createSlot(body) {
  return request('/api/slots', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

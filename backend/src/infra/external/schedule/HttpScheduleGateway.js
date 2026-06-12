import { ScheduleGateway } from './ScheduleGateway.js';
import { ExternalServiceError } from '../../../errors/index.js';

// Real HTTP implementation of the G3 - Schedule gateway.
// Expects:
//   GET  {baseURL}/slots/:id          -> 200 { id, available, ... } | 404
//   POST {baseURL}/slots/:id/reserve  -> 2xx
//   POST {baseURL}/slots/:id/release  -> 2xx
export class HttpScheduleGateway extends ScheduleGateway {
  constructor(httpClient) {
    super();
    this.http = httpClient;
  }

  async getAvailableSlot(slotId) {
    let response;
    try {
      response = await this.http.get(`/slots/${encodeURIComponent(slotId)}`);
    } catch (err) {
      throw new ExternalServiceError(`G3 (Schedule) request failed: ${err.message}`);
    }

    if (response.status === 404) return null;
    if (response.status >= 200 && response.status < 300) {
      const slot = response.data;
      // Treat a slot that is not available as "no slot" for booking purposes.
      if (slot && slot.available === false) return null;
      return slot;
    }

    throw new ExternalServiceError(
      `G3 (Schedule) returned unexpected status ${response.status}.`,
    );
  }

  async reserveSlot(slotId) {
    let response;
    try {
      response = await this.http.post(`/slots/${encodeURIComponent(slotId)}/reserve`);
    } catch (err) {
      throw new ExternalServiceError(`G3 (Schedule) reserve failed: ${err.message}`);
    }
    if (response.status < 200 || response.status >= 300) {
      throw new ExternalServiceError(
        `G3 (Schedule) reserve returned status ${response.status}.`,
      );
    }
    return response.data;
  }

  async releaseSlot(slotId) {
    let response;
    try {
      response = await this.http.post(`/slots/${encodeURIComponent(slotId)}/release`);
    } catch (err) {
      throw new ExternalServiceError(`G3 (Schedule) release failed: ${err.message}`);
    }
    if (response.status < 200 || response.status >= 300) {
      throw new ExternalServiceError(
        `G3 (Schedule) release returned status ${response.status}.`,
      );
    }
    return response.data;
  }
}

import { ScheduleGateway } from './ScheduleGateway.js';

// In-memory mock of G3 - Schedule, controlled by USE_MOCK_GATEWAYS.
// Slots are available by default; reserving marks them taken, releasing frees them.
// A few reserved ids simulate "slot does not exist / unavailable".
const UNAVAILABLE_IDS = new Set(['taken', 'unavailable', 'not-found']);

export class MockScheduleGateway extends ScheduleGateway {
  constructor() {
    super();
    // slotId -> 'reserved'. Absence means "free".
    this.reserved = new Map();
  }

  async getAvailableSlot(slotId) {
    if (UNAVAILABLE_IDS.has(String(slotId))) return null;
    if (this.reserved.has(slotId)) return null;
    return { id: slotId, available: true, _mock: true };
  }

  async reserveSlot(slotId) {
    this.reserved.set(slotId, 'reserved');
    return { id: slotId, reserved: true, _mock: true };
  }

  async releaseSlot(slotId) {
    this.reserved.delete(slotId);
    return { id: slotId, reserved: false, _mock: true };
  }
}

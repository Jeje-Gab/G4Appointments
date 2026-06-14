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

  async listAllSlots() {
    return [
      { id: 'slot-1', startsAt: '2026-07-01T09:00:00.000Z', doctorName: 'Dr. João Silva', specialty: 'Cardiologia', available: !this.reserved.has('slot-1') },
      { id: 'slot-2', startsAt: '2026-07-01T10:00:00.000Z', doctorName: 'Dra. Ana Lima', specialty: 'Dermatologia', available: !this.reserved.has('slot-2') },
      { id: 'slot-3', startsAt: '2026-07-02T14:00:00.000Z', doctorName: 'Dr. Carlos Mendes', specialty: 'Ortopedia', available: !this.reserved.has('slot-3') },
    ];
  }

  async createSlot(data) {
    const slot = { ...data, available: true };
    return slot;
  }

  async listAvailableSlots() {
    const taken = this.reserved;
    return [
      { id: 'slot-1', startsAt: '2026-07-01T09:00:00.000Z', doctorName: 'Dr. João Silva', specialty: 'Cardiologia', available: true },
      { id: 'slot-2', startsAt: '2026-07-01T10:00:00.000Z', doctorName: 'Dra. Ana Lima', specialty: 'Dermatologia', available: true },
      { id: 'slot-3', startsAt: '2026-07-02T14:00:00.000Z', doctorName: 'Dr. Carlos Mendes', specialty: 'Ortopedia', available: true },
    ].filter((s) => !taken.has(s.id));
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

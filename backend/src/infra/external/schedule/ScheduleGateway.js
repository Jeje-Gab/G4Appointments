/* eslint-disable no-unused-vars */
// Contract (port) for the G3 - Schedule module.
export class ScheduleGateway {
  // Return all available slots as an array.
  async listAvailableSlots() {
    throw new Error('ScheduleGateway.listAvailableSlots not implemented');
  }

  // Return the slot object if it exists and is available, or null otherwise.
  // Shape (example): { id, available: boolean, startsAt }
  async getAvailableSlot(slotId) {
    throw new Error('ScheduleGateway.getAvailableSlot not implemented');
  }

  // Reserve a slot. Resolves on success, throws on failure.
  async reserveSlot(slotId) {
    throw new Error('ScheduleGateway.reserveSlot not implemented');
  }

  // Release a previously reserved slot. Resolves on success, throws on failure.
  async releaseSlot(slotId) {
    throw new Error('ScheduleGateway.releaseSlot not implemented');
  }

  // Return all slots (available and taken).
  async listAllSlots() {
    throw new Error('ScheduleGateway.listAllSlots not implemented');
  }

  // Create a new slot. Returns the created slot.
  async createSlot(data) {
    throw new Error('ScheduleGateway.createSlot not implemented');
  }
}

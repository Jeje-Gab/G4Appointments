/* eslint-disable no-unused-vars */
// Contract (port) for the G3 - Schedule module.
export class ScheduleGateway {
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
}

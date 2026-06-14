import crypto from 'node:crypto';
import { ValidationError } from '../errors/index.js';

export class CreateSlotUseCase {
  constructor({ scheduleGateway }) {
    this.scheduleGateway = scheduleGateway;
  }

  async execute({ startsAt, doctorName, specialty }) {
    if (!startsAt || !doctorName?.trim() || !specialty?.trim()) {
      throw new ValidationError('startsAt, doctorName e specialty são obrigatórios.');
    }
    const id = crypto.randomUUID();
    return this.scheduleGateway.createSlot({ id, startsAt, doctorName, specialty });
  }
}

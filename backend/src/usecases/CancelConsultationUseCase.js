import { ConsultationStatus } from '../entities/ConsultationStatus.js';
import { UpdateConsultationStatusUseCase } from './UpdateConsultationStatusUseCase.js';

// Logical cancellation: never deletes the row, just transitions to 'cancelled'.
// Reuses the status use case so the slot-release side effect and the domain
// rules stay in a single place.
export class CancelConsultationUseCase {
  constructor({ consultationRepository, scheduleGateway }) {
    this.updateStatusUseCase = new UpdateConsultationStatusUseCase({
      consultationRepository,
      scheduleGateway,
    });
  }

  async execute(id) {
    return this.updateStatusUseCase.execute(id, ConsultationStatus.CANCELLED);
  }
}

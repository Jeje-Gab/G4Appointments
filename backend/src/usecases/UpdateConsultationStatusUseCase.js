import { ConsultationStatus } from '../entities/ConsultationStatus.js';
import { ConsultationNotFoundError } from '../errors/index.js';

// Updates a consultation status applying the domain transition rules
// (enforced inside the Consultation entity). When a scheduled consultation is
// cancelled, the slot is released back to G3.
export class UpdateConsultationStatusUseCase {
  constructor({ consultationRepository, scheduleGateway }) {
    this.consultationRepository = consultationRepository;
    this.scheduleGateway = scheduleGateway;
  }

  async execute(id, nextStatus) {
    const consultation = await this.consultationRepository.findById(id);
    if (!consultation) {
      throw new ConsultationNotFoundError(`Consultation "${id}" was not found.`);
    }

    const wasScheduled = consultation.isScheduled();

    // Domain rules: completing a future consultation, cancelling a completed
    // one, completing a cancelled one, etc. all throw here.
    consultation.changeStatus(nextStatus);

    const updated = await this.consultationRepository.updateStatus(consultation);

    // Free the slot in G3 when an active consultation is cancelled.
    if (wasScheduled && nextStatus === ConsultationStatus.CANCELLED) {
      try {
        await this.scheduleGateway.releaseSlot(updated.slotId);
      } catch {
        // The consultation is already cancelled in our system. Releasing the
        // slot is best-effort; we do not fail the whole operation for it.
      }
    }

    return updated;
  }
}

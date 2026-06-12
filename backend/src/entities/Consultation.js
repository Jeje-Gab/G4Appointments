import {
  ConsultationStatus,
  canTransition,
  isValidStatus,
} from './ConsultationStatus.js';
import {
  ValidationError,
  InvalidStatusTransitionError,
} from '../errors/index.js';

// Core domain entity. Holds the business rules around the consultation
// lifecycle. It is persistence-agnostic: repositories map rows to/from it.
export class Consultation {
  constructor({
    id,
    patientId,
    slotId,
    scheduledAt,
    doctorName,
    specialty,
    status = ConsultationStatus.SCHEDULED,
    notes = null,
    createdAt = null,
    updatedAt = null,
    cancelledAt = null,
    completedAt = null,
  }) {
    this.id = id;
    this.patientId = patientId;
    this.slotId = slotId;
    this.scheduledAt = scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
    this.doctorName = doctorName;
    this.specialty = specialty;
    this.status = status;
    this.notes = notes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.cancelledAt = cancelledAt;
    this.completedAt = completedAt;
  }

  isScheduled() {
    return this.status === ConsultationStatus.SCHEDULED;
  }

  isCompleted() {
    return this.status === ConsultationStatus.COMPLETED;
  }

  isCancelled() {
    return this.status === ConsultationStatus.CANCELLED;
  }

  // Whether the appointment time has already passed (relative to `now`).
  hasOccurred(now = new Date()) {
    return this.scheduledAt.getTime() <= now.getTime();
  }

  // Validates a requested transition and applies it, mutating the entity.
  // Throws domain errors when the transition is not allowed.
  changeStatus(nextStatus, now = new Date()) {
    if (!isValidStatus(nextStatus)) {
      throw new ValidationError(`Invalid status "${nextStatus}".`);
    }

    if (nextStatus === this.status) {
      throw new InvalidStatusTransitionError(
        `Consultation is already "${this.status}".`,
      );
    }

    if (!canTransition(this.status, nextStatus)) {
      throw new InvalidStatusTransitionError(
        `Cannot change status from "${this.status}" to "${nextStatus}".`,
      );
    }

    if (nextStatus === ConsultationStatus.COMPLETED) {
      // A consultation can only be completed after it has actually occurred.
      if (!this.hasOccurred(now)) {
        throw new InvalidStatusTransitionError(
          'Cannot complete a consultation that has not occurred yet.',
        );
      }
      this.status = ConsultationStatus.COMPLETED;
      this.completedAt = now;
    }

    if (nextStatus === ConsultationStatus.CANCELLED) {
      this.status = ConsultationStatus.CANCELLED;
      this.cancelledAt = now;
    }

    this.updatedAt = now;
    return this;
  }
}

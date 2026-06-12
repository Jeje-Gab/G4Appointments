import { Consultation } from '../entities/Consultation.js';
import { ConsultationStatus } from '../entities/ConsultationStatus.js';
import {
  PatientNotFoundError,
  SlotUnavailableError,
} from '../errors/index.js';

// Creates a consultation, coordinating the two external modules (G1, G3).
//
// Flow:
//   1. Validate patient exists (G1).
//   2. Validate slot is available (G3).
//   3. Persist consultation in our DB.
//   4. Reserve the slot in G3.
//   5. If the reservation fails, compensate by cancelling the consultation
//      we just created (Saga-style compensation) so we never leave a
//      "scheduled" consultation pointing at an unreserved slot.
export class CreateConsultationUseCase {
  constructor({ consultationRepository, patientsGateway, scheduleGateway }) {
    this.consultationRepository = consultationRepository;
    this.patientsGateway = patientsGateway;
    this.scheduleGateway = scheduleGateway;
  }

  async execute(input) {
    const { patientId, slotId } = input;

    // 1. Patient must exist in G1.
    const patient = await this.patientsGateway.findPatientById(patientId);
    if (!patient) {
      throw new PatientNotFoundError(`Patient "${patientId}" was not found.`);
    }

    // 2. Slot must be available in G3.
    const slot = await this.scheduleGateway.getAvailableSlot(slotId);
    if (!slot) {
      throw new SlotUnavailableError(`Slot "${slotId}" is not available.`);
    }

    // 3. Persist the consultation first, so a record exists before we touch G3.
    const entity = new Consultation({
      patientId,
      slotId,
      scheduledAt: input.scheduledAt,
      doctorName: input.doctorName,
      specialty: input.specialty,
      status: ConsultationStatus.SCHEDULED,
      notes: input.notes ?? null,
    });
    const created = await this.consultationRepository.create(entity);

    // 4. Reserve the slot. 5. Compensate on failure.
    try {
      await this.scheduleGateway.reserveSlot(slotId);
    } catch (reserveError) {
      // Compensation: undo the consultation so we don't keep an orphan booking.
      try {
        created.changeStatus(ConsultationStatus.CANCELLED);
        await this.consultationRepository.updateStatus(created);
      } catch {
        // Best-effort compensation; surface the original reservation error.
      }
      throw reserveError;
    }

    return created;
  }
}

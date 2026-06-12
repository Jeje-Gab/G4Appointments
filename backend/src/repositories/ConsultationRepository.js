/* eslint-disable no-unused-vars */
// Contract (port) for consultation persistence. Use cases depend on this
// abstraction; the concrete implementation lives in infra/database.
export class ConsultationRepository {
  // Persist a new Consultation entity. Returns the saved entity (with id/timestamps).
  async create(consultation) {
    throw new Error('ConsultationRepository.create not implemented');
  }

  // Return the Consultation with the given id, or null if not found.
  async findById(id) {
    throw new Error('ConsultationRepository.findById not implemented');
  }

  // Return an active (non-cancelled) Consultation for a slot, or null.
  async findActiveBySlotId(slotId) {
    throw new Error('ConsultationRepository.findActiveBySlotId not implemented');
  }

  // List consultations matching the given filters object:
  // { status, patientId, startDate, endDate } — all optional.
  async list(filters) {
    throw new Error('ConsultationRepository.list not implemented');
  }

  // Persist the status (and related timestamps) of an existing Consultation.
  async updateStatus(consultation) {
    throw new Error('ConsultationRepository.updateStatus not implemented');
  }

  // List only completed consultations for a patient (history).
  async findPatientHistory(patientId) {
    throw new Error('ConsultationRepository.findPatientHistory not implemented');
  }
}

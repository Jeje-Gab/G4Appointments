import { ValidationError } from '../errors/index.js';

// Returns the completed-consultations history for a patient. This is the
// endpoint consumed by downstream modules (Prontuário, Faturamento, Exames,
// Triagem, Autorização).
export class GetPatientConsultationHistoryUseCase {
  constructor({ consultationRepository }) {
    this.consultationRepository = consultationRepository;
  }

  async execute(patientId) {
    if (!patientId || !String(patientId).trim()) {
      throw new ValidationError('patientId is required.');
    }
    return this.consultationRepository.findPatientHistory(String(patientId));
  }
}

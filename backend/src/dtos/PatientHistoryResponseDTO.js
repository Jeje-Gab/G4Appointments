import { ConsultationResponseDTO } from './ConsultationResponseDTO.js';

// Response shape for the patient history endpoint. Wraps the list of completed
// consultations with the patient id and a count, which is convenient for the
// downstream modules that consume this (Prontuário, Faturamento, etc.).
export function PatientHistoryResponseDTO(patientId, consultations) {
  return {
    patientId,
    total: consultations.length,
    consultations: consultations.map(ConsultationResponseDTO),
  };
}

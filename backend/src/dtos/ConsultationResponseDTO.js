// Shapes a Consultation entity into the public JSON response contract.
// Keeping this explicit decouples the API shape from the DB/entity internals.
export function ConsultationResponseDTO(consultation) {
  if (!consultation) return null;
  return {
    id: consultation.id,
    patientId: consultation.patientId,
    slotId: consultation.slotId,
    scheduledAt: toISO(consultation.scheduledAt),
    doctorName: consultation.doctorName,
    specialty: consultation.specialty,
    status: consultation.status,
    notes: consultation.notes,
    createdAt: toISO(consultation.createdAt),
    updatedAt: toISO(consultation.updatedAt),
    cancelledAt: toISO(consultation.cancelledAt),
    completedAt: toISO(consultation.completedAt),
  };
}

export function ConsultationListResponseDTO(consultations) {
  return consultations.map(ConsultationResponseDTO);
}

function toISO(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

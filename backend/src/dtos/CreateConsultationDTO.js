import { ValidationError } from '../errors/index.js';

// Validates and normalizes the raw body for creating a consultation.
// Throws ValidationError (400) on bad input. Returns a clean plain object.
export function CreateConsultationDTO(body = {}) {
  const errors = [];

  const patientId = typeof body.patientId === 'string' ? body.patientId.trim() : body.patientId;
  const slotId = typeof body.slotId === 'string' ? body.slotId.trim() : body.slotId;
  const { scheduledAt, doctorName, specialty, notes } = body;

  if (!patientId) errors.push('patientId is required.');
  if (!slotId) errors.push('slotId is required.');
  if (!scheduledAt) errors.push('scheduledAt is required.');

  let scheduledDate = null;
  if (scheduledAt) {
    scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      errors.push('scheduledAt must be a valid date.');
    }
  }

  if (!doctorName || !String(doctorName).trim()) errors.push('doctorName is required.');
  if (!specialty || !String(specialty).trim()) errors.push('specialty is required.');

  if (errors.length > 0) {
    throw new ValidationError('Invalid consultation payload.', errors);
  }

  return {
    patientId: String(patientId),
    slotId: String(slotId),
    scheduledAt: scheduledDate,
    doctorName: String(doctorName).trim(),
    specialty: String(specialty).trim(),
    notes: notes != null ? String(notes) : null,
  };
}

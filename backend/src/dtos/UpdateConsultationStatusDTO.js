import { ValidationError } from '../errors/index.js';
import { isValidStatus, ALL_STATUSES } from '../entities/ConsultationStatus.js';

// Validates the body for a status update request.
export function UpdateConsultationStatusDTO(body = {}) {
  const status = typeof body.status === 'string' ? body.status.trim() : body.status;

  if (!status) {
    throw new ValidationError('status is required.', ['status is required.']);
  }
  if (!isValidStatus(status)) {
    throw new ValidationError(
      `status must be one of: ${ALL_STATUSES.join(', ')}.`,
      [`Invalid status "${status}".`],
    );
  }

  return { status };
}

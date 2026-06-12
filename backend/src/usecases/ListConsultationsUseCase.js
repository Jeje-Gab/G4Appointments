import { ValidationError } from '../errors/index.js';
import { isValidStatus, ALL_STATUSES } from '../entities/ConsultationStatus.js';

// Lists consultations applying optional filters coming from query params.
// Normalizes/validates the filters before handing them to the repository.
export class ListConsultationsUseCase {
  constructor({ consultationRepository }) {
    this.consultationRepository = consultationRepository;
  }

  async execute(rawFilters = {}) {
    const filters = {};

    if (rawFilters.status != null && rawFilters.status !== '') {
      if (!isValidStatus(rawFilters.status)) {
        throw new ValidationError(
          `status must be one of: ${ALL_STATUSES.join(', ')}.`,
        );
      }
      filters.status = rawFilters.status;
    }

    if (rawFilters.patientId != null && rawFilters.patientId !== '') {
      filters.patientId = String(rawFilters.patientId);
    }

    filters.startDate = parseDate(rawFilters.startDate, 'startDate');
    filters.endDate = parseDate(rawFilters.endDate, 'endDate');

    return this.consultationRepository.list(filters);
  }
}

function parseDate(value, field) {
  if (value == null || value === '') return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new ValidationError(`${field} must be a valid date.`);
  }
  return d;
}

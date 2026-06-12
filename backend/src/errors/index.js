// Standardized application errors. Each carries an HTTP status and an optional
// machine-readable `code`, so the HTTP error handler can render consistent
// JSON responses without knowing about the domain.

export class AppError extends Error {
  constructor(message, { statusCode = 500, code = 'INTERNAL_ERROR', details = null } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isAppError = true;
  }
}

// 400 — request payload failed basic validation.
export class ValidationError extends AppError {
  constructor(message = 'Validation error.', details = null) {
    super(message, { statusCode: 400, code: 'VALIDATION_ERROR', details });
  }
}

// 404 — a consultation was not found.
export class ConsultationNotFoundError extends AppError {
  constructor(message = 'Consultation not found.', details = null) {
    super(message, { statusCode: 404, code: 'CONSULTATION_NOT_FOUND', details });
  }
}

// 404 — the patient referenced by the request does not exist in G1.
export class PatientNotFoundError extends AppError {
  constructor(message = 'Patient not found.', details = null) {
    super(message, { statusCode: 404, code: 'PATIENT_NOT_FOUND', details });
  }
}

// 409 — the requested schedule slot is not available in G3.
export class SlotUnavailableError extends AppError {
  constructor(message = 'Schedule slot is not available.', details = null) {
    super(message, { statusCode: 409, code: 'SLOT_UNAVAILABLE', details });
  }
}

// 409 — a transition between statuses is not allowed by the domain rules.
export class InvalidStatusTransitionError extends AppError {
  constructor(message = 'Invalid status transition.', details = null) {
    super(message, { statusCode: 409, code: 'INVALID_STATUS_TRANSITION', details });
  }
}

// 401 — missing or invalid credentials (API key or admin session).
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized.', details = null) {
    super(message, { statusCode: 401, code: 'UNAUTHORIZED', details });
  }
}

// 403 — authenticated but not allowed to perform the action.
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden.', details = null) {
    super(message, { statusCode: 403, code: 'FORBIDDEN', details });
  }
}

// 502 — a downstream module (G1/G3) failed or was unreachable.
export class ExternalServiceError extends AppError {
  constructor(message = 'External service error.', details = null) {
    super(message, { statusCode: 502, code: 'EXTERNAL_SERVICE_ERROR', details });
  }
}

// 500 — database failure that we could not map to a more specific error.
export class DatabaseError extends AppError {
  constructor(message = 'Database error.', details = null) {
    super(message, { statusCode: 500, code: 'DATABASE_ERROR', details });
  }
}

// Domain object describing the consultation lifecycle.

export const ConsultationStatus = Object.freeze({
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

export const ALL_STATUSES = Object.freeze(Object.values(ConsultationStatus));

// Allowed transitions between statuses. Terminal states have no outgoing edges.
const TRANSITIONS = Object.freeze({
  [ConsultationStatus.SCHEDULED]: [ConsultationStatus.COMPLETED, ConsultationStatus.CANCELLED],
  [ConsultationStatus.COMPLETED]: [],
  [ConsultationStatus.CANCELLED]: [],
});

export function isValidStatus(status) {
  return ALL_STATUSES.includes(status);
}

export function canTransition(from, to) {
  if (!isValidStatus(from) || !isValidStatus(to)) return false;
  return TRANSITIONS[from].includes(to);
}

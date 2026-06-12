const LABELS = {
  scheduled: 'Agendada',
  completed: 'Realizada',
  cancelled: 'Cancelada',
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{LABELS[status] || status}</span>;
}

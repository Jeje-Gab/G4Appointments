import { useEffect, useState, useCallback } from 'react';
import {
  listConsultations,
  updateConsultationStatus,
  cancelConsultation,
} from '../services/consultationsApi.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Alert from '../components/Alert.jsx';
import { formatDateTime } from '../components/formatters.js';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'scheduled', label: 'Agendada' },
  { value: 'completed', label: 'Realizada' },
  { value: 'cancelled', label: 'Cancelada' },
];

export default function ConsultationsListPage() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({ status: '', patientId: '' });
  const [actingId, setActingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listConsultations(filters);
      setConsultations(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleComplete(id) {
    setActingId(id);
    setError('');
    setSuccess('');
    try {
      await updateConsultationStatus(id, 'completed');
      setSuccess('Consulta marcada como realizada.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActingId(null);
    }
  }

  async function handleCancel(id) {
    setActingId(id);
    setError('');
    setSuccess('');
    try {
      await cancelConsultation(id);
      setSuccess('Consulta cancelada.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="card">
      <h2>Consultas</h2>

      <div className="toolbar">
        <div className="field">
          <label htmlFor="f-status">Status</label>
          <select
            id="f-status"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-patient">Paciente (patientId)</label>
          <input
            id="f-patient"
            value={filters.patientId}
            placeholder="ex: p1"
            onChange={(e) => setFilters((f) => ({ ...f, patientId: e.target.value }))}
          />
        </div>
        <button className="btn secondary" onClick={load} disabled={loading}>
          {loading ? 'Carregando…' : 'Atualizar'}
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Especialidade</th>
              <th>Data/Hora</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {consultations.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="empty">Nenhuma consulta encontrada.</td>
              </tr>
            )}
            {consultations.map((c) => (
              <tr key={c.id}>
                <td>{c.patientId}</td>
                <td>{c.doctorName}</td>
                <td>{c.specialty}</td>
                <td>{formatDateTime(c.scheduledAt)}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>
                  <div className="actions-row">
                    {c.status === 'scheduled' && (
                      <>
                        <button
                          className="btn success small"
                          disabled={actingId === c.id}
                          onClick={() => handleComplete(c.id)}
                        >
                          Concluir
                        </button>
                        <button
                          className="btn danger small"
                          disabled={actingId === c.id}
                          onClick={() => handleCancel(c.id)}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {c.status !== 'scheduled' && <span className="muted">—</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

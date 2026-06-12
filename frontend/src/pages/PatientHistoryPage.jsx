import { useState } from 'react';
import { getPatientHistory } from '../services/consultationsApi.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Alert from '../components/Alert.jsx';
import { formatDateTime } from '../components/formatters.js';

export default function PatientHistoryPage() {
  const [patientId, setPatientId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!patientId.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await getPatientHistory(patientId.trim());
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Histórico de consultas realizadas</h2>
      <p className="muted">
        Retorna apenas consultas com status <strong>realizada</strong> de um paciente.
      </p>

      <form onSubmit={handleSearch} className="toolbar">
        <div className="field">
          <label htmlFor="hist-patient">Paciente (patientId)</label>
          <input
            id="hist-patient"
            value={patientId}
            placeholder="ex: p1"
            onChange={(e) => setPatientId(e.target.value)}
          />
        </div>
        <button className="btn" type="submit" disabled={loading || !patientId.trim()}>
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {result && (
        <>
          <p className="muted">
            {result.total} consulta(s) realizada(s) para o paciente <strong>{result.patientId}</strong>.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Médico</th>
                  <th>Especialidade</th>
                  <th>Data/Hora</th>
                  <th>Concluída em</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {result.consultations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty">Nenhuma consulta realizada encontrada.</td>
                  </tr>
                )}
                {result.consultations.map((c) => (
                  <tr key={c.id}>
                    <td>{c.doctorName}</td>
                    <td>{c.specialty}</td>
                    <td>{formatDateTime(c.scheduledAt)}</td>
                    <td>{formatDateTime(c.completedAt)}</td>
                    <td><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

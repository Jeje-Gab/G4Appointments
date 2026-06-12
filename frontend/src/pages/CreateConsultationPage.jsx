import { useState } from 'react';
import { createConsultation } from '../services/consultationsApi.js';
import Alert from '../components/Alert.jsx';

const EMPTY = {
  patientId: '',
  slotId: '',
  scheduledAt: '',
  doctorName: '',
  specialty: '',
  notes: '',
};

export default function CreateConsultationPage({ onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [details, setDetails] = useState(null);
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setDetails(null);
    setSuccess('');
    setSubmitting(true);
    try {
      // datetime-local gives "YYYY-MM-DDTHH:mm"; convert to ISO for the API.
      const payload = {
        ...form,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : '',
        notes: form.notes || null,
      };
      const created = await createConsultation(payload);
      setSuccess(`Consulta criada com sucesso (id: ${created.id}).`);
      setForm(EMPTY);
      if (onCreated) onCreated(created);
    } catch (err) {
      setError(err.message);
      setDetails(Array.isArray(err.details) ? err.details : null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h2>Agendar consulta</h2>

      <Alert type="error" message={error} onClose={() => setError('')} />
      {details && (
        <ul className="alert error" style={{ marginTop: -8 }}>
          {details.map((d) => <li key={d}>{d}</li>)}
        </ul>
      )}
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="patientId">Paciente (patientId) *</label>
            <input
              id="patientId"
              value={form.patientId}
              placeholder="ex: p1"
              onChange={(e) => update('patientId', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="slotId">Horário (slotId) *</label>
            <input
              id="slotId"
              value={form.slotId}
              placeholder="ex: slotA"
              onChange={(e) => update('slotId', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="scheduledAt">Data/Hora *</label>
            <input
              id="scheduledAt"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => update('scheduledAt', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="doctorName">Médico *</label>
            <input
              id="doctorName"
              value={form.doctorName}
              placeholder="ex: Dr. João Silva"
              onChange={(e) => update('doctorName', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="specialty">Especialidade *</label>
            <input
              id="specialty"
              value={form.specialty}
              placeholder="ex: Cardiologia"
              onChange={(e) => update('specialty', e.target.value)}
            />
          </div>
          <div className="field full">
            <label htmlFor="notes">Observações</label>
            <textarea
              id="notes"
              rows={3}
              value={form.notes}
              placeholder="Opcional"
              onChange={(e) => update('notes', e.target.value)}
            />
          </div>
        </div>
        <div className="actions-row" style={{ marginTop: 16 }}>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Agendando…' : 'Agendar'}
          </button>
          <button
            className="btn secondary"
            type="button"
            disabled={submitting}
            onClick={() => setForm(EMPTY)}
          >
            Limpar
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { createConsultation } from '../services/consultationsApi.js';
import { listPatients } from '../services/patientsApi.js';
import { listAvailableSlots } from '../services/slotsApi.js';
import { formatDateTime } from '../components/formatters.js';
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
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [error, setError] = useState('');
  const [details, setDetails] = useState(null);
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listPatients()
      .then(setPatients)
      .catch(() => setPatients([]))
      .finally(() => setPatientsLoading(false));

    listAvailableSlots()
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSlotChange(slotId) {
    const slot = slots.find((s) => String(s.id) === slotId);
    if (slot) {
      setForm((f) => ({
        ...f,
        slotId: slot.id,
        scheduledAt: slot.startsAt,
        doctorName: slot.doctorName,
        specialty: slot.specialty,
      }));
    } else {
      setForm((f) => ({ ...f, slotId: '', scheduledAt: '', doctorName: '', specialty: '' }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setDetails(null);
    setSuccess('');
    setSubmitting(true);
    try {
      const created = await createConsultation({
        ...form,
        notes: form.notes || null,
      });
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

  const selectedSlot = slots.find((s) => String(s.id) === String(form.slotId));

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
            <label htmlFor="patientId">Paciente *</label>
            <select
              id="patientId"
              value={form.patientId}
              onChange={(e) => update('patientId', e.target.value)}
              disabled={patientsLoading}
            >
              <option value="">
                {patientsLoading ? 'Carregando pacientes…' : 'Selecione um paciente'}
              </option>
              {patients.map((p) => (
                <option key={p.idpaciente} value={p.idpaciente}>
                  {p.nome} — CPF: {p.cpf}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="slotId">Horário disponível *</label>
            <select
              id="slotId"
              value={form.slotId}
              onChange={(e) => handleSlotChange(e.target.value)}
              disabled={slotsLoading}
            >
              <option value="">
                {slotsLoading ? 'Carregando horários…' : 'Selecione um horário'}
              </option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatDateTime(s.startsAt)} — {s.doctorName} ({s.specialty})
                </option>
              ))}
            </select>
          </div>

          {selectedSlot && (
            <>
              <div className="field">
                <label>Médico</label>
                <input value={form.doctorName} readOnly disabled />
              </div>
              <div className="field">
                <label>Especialidade</label>
                <input value={form.specialty} readOnly disabled />
              </div>
              <div className="field">
                <label>Data/Hora</label>
                <input value={formatDateTime(form.scheduledAt)} readOnly disabled />
              </div>
            </>
          )}

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

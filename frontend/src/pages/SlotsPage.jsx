import { useState, useEffect, useCallback } from 'react';
import { listAllSlots, createSlot } from '../services/slotsApi.js';
import { formatDateTime } from '../components/formatters.js';
import Alert from '../components/Alert.jsx';

const EMPTY = { startsAt: '', doctorName: '', specialty: '' };

export default function SlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSlots(await listAllSlots() || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      const slot = await createSlot({
        startsAt: new Date(form.startsAt).toISOString(),
        doctorName: form.doctorName,
        specialty: form.specialty,
      });
      setSuccess(`Horário criado: ${slot.doctorName} — ${formatDateTime(slot.startsAt)}`);
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div className="card">
        <h2>Criar horário</h2>
        <Alert type="error" message={error} onClose={() => setError('')} />
        <Alert type="success" message={success} onClose={() => setSuccess('')} />

        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="doctorName">Médico *</label>
              <input
                id="doctorName"
                value={form.doctorName}
                onChange={(e) => update('doctorName', e.target.value)}
                placeholder="ex: Dr. João Silva"
              />
            </div>
            <div className="field">
              <label htmlFor="specialty">Especialidade *</label>
              <input
                id="specialty"
                value={form.specialty}
                onChange={(e) => update('specialty', e.target.value)}
                placeholder="ex: Cardiologia"
              />
            </div>
            <div className="field">
              <label htmlFor="startsAt">Data/Hora *</label>
              <input
                id="startsAt"
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => update('startsAt', e.target.value)}
              />
            </div>
          </div>
          <div className="actions-row" style={{ marginTop: 16 }}>
            <button className="btn" type="submit" disabled={creating}>
              {creating ? 'Criando…' : 'Criar horário'}
            </button>
            <button className="btn secondary" type="button" onClick={() => setForm(EMPTY)} disabled={creating}>
              Limpar
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Horários cadastrados</h2>
          <button className="btn secondary" onClick={load} disabled={loading}>
            {loading ? 'Carregando…' : 'Atualizar'}
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Médico</th>
                <th>Especialidade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {slots.length === 0 && !loading && (
                <tr><td colSpan={4} className="empty">Nenhum horário cadastrado.</td></tr>
              )}
              {slots.map((s) => (
                <tr key={s.id}>
                  <td>{formatDateTime(s.startsAt)}</td>
                  <td>{s.doctorName}</td>
                  <td>{s.specialty}</td>
                  <td>
                    <span className={`badge ${s.available ? 'scheduled' : 'cancelled'}`}>
                      {s.available ? 'Disponível' : 'Reservado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

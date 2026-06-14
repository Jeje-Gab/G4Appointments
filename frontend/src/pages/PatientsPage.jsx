import { useState, useEffect, useCallback } from 'react';
import { listPatients, getPatient, createPatient } from '../services/patientsApi.js';
import Alert from '../components/Alert.jsx';

const EMPTY_FORM = {
  nome: '',
  cpf: '',
  telefone: '',
  data_nascimento: '',
  endereco: '',
  foto: '',
};

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Detail view
  const [searchId, setSearchId] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [searching, setSearching] = useState(false);

  // Create form
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPatients(await listPatients() || []);
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
      const patient = await createPatient({
        ...form,
        foto: form.foto || null,
      });
      setSuccess(`Paciente "${patient.nome}" cadastrado com sucesso (ID: ${patient.idpaciente}).`);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchId.trim()) return;
    setSearching(true);
    setDetail(null);
    setDetailError('');
    try {
      setDetail(await getPatient(searchId.trim()));
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Cadastrar ── */}
      <div className="card">
        <h2>Cadastrar paciente</h2>
        <Alert type="error" message={error} onClose={() => setError('')} />
        <Alert type="success" message={success} onClose={() => setSuccess('')} />

        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="nome">Nome *</label>
              <input id="nome" value={form.nome} onChange={(e) => update('nome', e.target.value)} placeholder="Maria da Silva" />
            </div>
            <div className="field">
              <label htmlFor="cpf">CPF * <span className="muted">(somente números)</span></label>
              <input id="cpf" value={form.cpf} onChange={(e) => update('cpf', e.target.value)} placeholder="12345678901" maxLength={11} />
            </div>
            <div className="field">
              <label htmlFor="telefone">Telefone *</label>
              <input id="telefone" value={form.telefone} onChange={(e) => update('telefone', e.target.value)} placeholder="11999998888" />
            </div>
            <div className="field">
              <label htmlFor="data_nascimento">Data de nascimento *</label>
              <input id="data_nascimento" type="date" value={form.data_nascimento} onChange={(e) => update('data_nascimento', e.target.value)} />
            </div>
            <div className="field full">
              <label htmlFor="endereco">Endereço *</label>
              <input id="endereco" value={form.endereco} onChange={(e) => update('endereco', e.target.value)} placeholder="Rua das Flores, 100" />
            </div>
            <div className="field full">
              <label htmlFor="foto">Foto <span className="muted">(URL, opcional)</span></label>
              <input id="foto" value={form.foto} onChange={(e) => update('foto', e.target.value)} placeholder="https://exemplo.com/foto.jpg" />
            </div>
          </div>
          <div className="actions-row" style={{ marginTop: 16 }}>
            <button className="btn" type="submit" disabled={creating}>
              {creating ? 'Cadastrando…' : 'Cadastrar'}
            </button>
            <button className="btn secondary" type="button" onClick={() => setForm(EMPTY_FORM)} disabled={creating}>
              Limpar
            </button>
          </div>
        </form>
      </div>

      {/* ── Buscar por ID ── */}
      <div className="card">
        <h2>Buscar por ID</h2>
        <form onSubmit={handleSearch} className="toolbar">
          <div className="field">
            <label htmlFor="searchId">ID do paciente</label>
            <input
              id="searchId"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="ex: 1"
            />
          </div>
          <button className="btn" type="submit" disabled={searching || !searchId.trim()}>
            {searching ? 'Buscando…' : 'Buscar'}
          </button>
        </form>

        {detailError && <Alert type="error" message={detailError} onClose={() => setDetailError('')} />}

        {detail && (
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table>
              <tbody>
                <tr><th>ID</th><td>{detail.idpaciente}</td></tr>
                <tr><th>Nome</th><td>{detail.nome}</td></tr>
                <tr><th>CPF</th><td>{detail.cpf}</td></tr>
                <tr><th>Telefone</th><td>{detail.telefone}</td></tr>
                <tr><th>Nascimento</th><td>{detail.data_nascimento}</td></tr>
                <tr><th>Endereço</th><td>{detail.endereco}</td></tr>
                <tr><th>Foto</th><td>{detail.foto ? <a href={detail.foto} target="_blank" rel="noreferrer">{detail.foto}</a> : '—'}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Lista ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Pacientes cadastrados</h2>
          <button className="btn secondary" onClick={load} disabled={loading}>
            {loading ? 'Carregando…' : 'Atualizar'}
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Nascimento</th>
                <th>Endereço</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 && !loading && (
                <tr><td colSpan={6} className="empty">Nenhum paciente encontrado.</td></tr>
              )}
              {patients.map((p) => (
                <tr key={p.idpaciente}>
                  <td>{p.idpaciente}</td>
                  <td>{p.nome}</td>
                  <td>{p.cpf}</td>
                  <td>{p.telefone}</td>
                  <td>{p.data_nascimento}</td>
                  <td>{p.endereco}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

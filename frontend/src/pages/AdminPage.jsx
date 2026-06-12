import { useEffect, useState, useCallback } from 'react';
import {
  listClients,
  createClient,
  revokeClient,
} from '../services/adminApi.js';
import Alert from '../components/Alert.jsx';
import { formatDateTime } from '../components/formatters.js';

// API key management. Only reachable by the 'admin' role — the App hides this
// tab for other roles and the backend enforces the role on every call.
export default function AdminPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  // The freshly generated key — shown once, then dismissed.
  const [generated, setGenerated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listClients();
      setClients(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const data = await createClient(newName.trim());
      setGenerated({ name: data.client.name, apiKey: data.apiKey });
      setNewName('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id, name) {
    if (!window.confirm(`Revogar a chave de "${name}"? Ela deixará de funcionar imediatamente.`)) {
      return;
    }
    setError('');
    try {
      await revokeClient(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <h2>Chaves de API — módulos externos</h2>
      <p className="muted">
        Gere uma chave por grupo consumidor (G5, G7, G10, G11, G13). A chave é exibida
        <strong> uma única vez</strong>. Eles devem enviá-la no header
        <code> Authorization: ApiKey &lt;chave&gt;</code> ao chamar <code>/external/v1</code>.
      </p>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {generated && (
        <div className="alert success">
          <strong>Chave gerada para “{generated.name}”.</strong> Copie agora — não será exibida novamente:
          <pre className="key-box">{generated.apiKey}</pre>
          <button className="btn small secondary" onClick={() => setGenerated(null)}>Ok, copiei</button>
        </div>
      )}

      <form onSubmit={handleCreate} className="toolbar">
        <div className="field">
          <label htmlFor="cli-name">Nome do consumidor</label>
          <input
            id="cli-name"
            value={newName}
            placeholder="ex: G10 - Faturamento"
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <button className="btn" type="submit" disabled={creating || !newName.trim()}>
          {creating ? 'Gerando…' : 'Gerar chave'}
        </button>
        <button className="btn secondary" type="button" onClick={load} disabled={loading}>
          {loading ? 'Carregando…' : 'Atualizar'}
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Prefixo</th>
              <th>Status</th>
              <th>Criada em</th>
              <th>Último uso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && !loading && (
              <tr><td colSpan={6} className="empty">Nenhuma chave cadastrada.</td></tr>
            )}
            {clients.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td><code>{c.keyPrefix}…</code></td>
                <td>
                  <span className={`badge ${c.active ? 'completed' : 'cancelled'}`}>
                    {c.active ? 'Ativa' : 'Revogada'}
                  </span>
                </td>
                <td>{formatDateTime(c.createdAt)}</td>
                <td>{c.lastUsedAt ? formatDateTime(c.lastUsedAt) : '—'}</td>
                <td>
                  {c.active ? (
                    <button className="btn danger small" onClick={() => handleRevoke(c.id, c.name)}>
                      Revogar
                    </button>
                  ) : <span className="muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { listUsers, createUser, changeUserPassword } from '../services/usersApi.js';
import { getUser } from '../services/auth.js';
import Alert from '../components/Alert.jsx';
import { formatDateTime } from '../components/formatters.js';

// User management (admin only): list users, create users, reset passwords.
export default function UsersAdminPage() {
  const me = getUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ username: '', password: '', role: 'user' });
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setUsers((await listUsers()) || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);
    try {
      const u = await createUser(form);
      setSuccess(`Usuário "${u.username}" (${u.role}) criado.`);
      setForm({ username: '', password: '', role: 'user' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleResetPassword(user) {
    const pwd = window.prompt(`Nova senha para "${user.username}" (mín. 6 caracteres):`);
    if (pwd == null) return;
    setError('');
    setSuccess('');
    try {
      await changeUserPassword(user.id, pwd);
      const isSelf = me && me.id === user.id;
      setSuccess(
        isSelf
          ? 'Sua senha foi alterada. Outras sessões suas foram encerradas.'
          : `Senha de "${user.username}" alterada. As sessões dele(a) foram encerradas.`,
      );
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card">
      <h2>Usuários</h2>
      <p className="muted">
        Crie usuários e redefina senhas. Papel <code>user</code> acessa as consultas;
        <code> admin</code> acessa também esta área e a gestão de API Keys.
      </p>

      <Alert type="error" message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <form onSubmit={handleCreate} className="toolbar">
        <div className="field">
          <label htmlFor="u-name">Usuário</label>
          <input
            id="u-name"
            value={form.username}
            placeholder="ex: maria"
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="u-pass">Senha (mín. 6)</label>
          <input
            id="u-pass"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="u-role">Papel</label>
          <select
            id="u-role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <button className="btn" type="submit" disabled={creating || !form.username || !form.password}>
          {creating ? 'Criando…' : 'Criar usuário'}
        </button>
        <button className="btn secondary" type="button" onClick={load} disabled={loading}>
          {loading ? 'Carregando…' : 'Atualizar'}
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Papel</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && !loading && (
              <tr><td colSpan={4} className="empty">Nenhum usuário.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.username}
                  {me && me.id === u.id && <span className="muted"> (você)</span>}
                </td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'completed' : 'scheduled'}`}>{u.role}</span>
                </td>
                <td>{formatDateTime(u.createdAt)}</td>
                <td>
                  <button className="btn secondary small" onClick={() => handleResetPassword(u)}>
                    Alterar senha
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

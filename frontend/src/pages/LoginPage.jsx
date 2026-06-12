import { useState } from 'react';
import { login } from '../services/auth.js';
import Alert from '../components/Alert.jsx';

// App-level login. Shown whenever there is no active session.
export default function LoginPage({ onLogged }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username.trim(), password);
      onLogged(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div className="card">
        <h2>Entrar</h2>
        <p className="muted">G4 - Consultas — acesso restrito.</p>
        <Alert type="error" message={error} onClose={() => setError('')} />
        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: 12 }}>
            <label htmlFor="login-user">Usuário</label>
            <input
              id="login-user"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="field" style={{ marginBottom: 16 }}>
            <label htmlFor="login-pass">Senha</label>
            <input
              id="login-pass"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn" type="submit" disabled={loading || !username || !password}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

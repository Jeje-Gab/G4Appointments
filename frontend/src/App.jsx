import { useEffect, useState, useCallback } from 'react';
import ConsultationsListPage from './pages/ConsultationsListPage.jsx';
import CreateConsultationPage from './pages/CreateConsultationPage.jsx';
import PatientHistoryPage from './pages/PatientHistoryPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import UsersAdminPage from './pages/UsersAdminPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { getUser, isAuthenticated, logout } from './services/auth.js';

// Tabs and which roles may see them. The admin areas are admin-only.
const TABS = [
  { key: 'list', label: 'Consultas', roles: ['admin', 'user'] },
  { key: 'create', label: 'Agendar', roles: ['admin', 'user'] },
  { key: 'history', label: 'Histórico do paciente', roles: ['admin', 'user'] },
  { key: 'users', label: 'Usuários', roles: ['admin'] },
  { key: 'admin', label: 'Admin (API Keys)', roles: ['admin'] },
];

export default function App() {
  const [user, setUser] = useState(() => (isAuthenticated() ? getUser() : null));
  const [tab, setTab] = useState('list');
  const [listKey, setListKey] = useState(0);

  // If any request hits a 401, the http layer clears the session and fires this
  // event — drop back to the login screen.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('g4:unauthorized', onUnauthorized);
    return () => window.removeEventListener('g4:unauthorized', onUnauthorized);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    setTab('list');
  }, []);

  if (!user) {
    return (
      <>
        <header className="app-header">
          <h1>G4 - Consultas</h1>
          <p>Módulo de agendamento de consultas — sistema de saúde</p>
        </header>
        <LoginPage onLogged={(u) => setUser(u)} />
      </>
    );
  }

  const visibleTabs = TABS.filter((t) => t.roles.includes(user.role));
  // Guard against a stale tab the current role cannot see.
  const activeTab = visibleTabs.some((t) => t.key === tab) ? tab : 'list';

  function handleCreated() {
    setListKey((k) => k + 1);
    setTab('list');
  }

  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>G4 - Consultas</h1>
            <p>Módulo de agendamento de consultas — sistema de saúde</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem' }}>
              {user.username} <span className={`badge ${user.role === 'admin' ? 'completed' : 'scheduled'}`}>{user.role}</span>
            </div>
            <button className="btn secondary small" style={{ marginTop: 6 }} onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <nav className="nav">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            className={activeTab === t.key ? 'active' : ''}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="container">
        {activeTab === 'list' && <ConsultationsListPage key={listKey} />}
        {activeTab === 'create' && <CreateConsultationPage onCreated={handleCreated} />}
        {activeTab === 'history' && <PatientHistoryPage />}
        {activeTab === 'users' && user.role === 'admin' && <UsersAdminPage />}
        {activeTab === 'admin' && user.role === 'admin' && <AdminPage />}
      </main>
    </>
  );
}

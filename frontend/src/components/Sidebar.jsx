import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, LayoutDashboard, Lock, Unlock,
  FolderLock, History, Sun, Moon, LogOut, ShieldAlert
} from 'lucide-react';

export default function Sidebar({ user, setUser, theme, toggleTheme }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <aside className="sidebar">
      <div>
        <div className="brand-box">
          <div className="brand-icon"><ShieldCheck size={20} /></div>
          <div>
            <div className="brand-title">SecureVault</div>
            <div className="brand-sub">{isAdmin ? 'ADMIN PORTAL' : 'AES-256-GCM'}</div>
          </div>
        </div>

        <nav className="side-nav">
          {isAdmin ? (
            <NavLink to="/admin" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
              <ShieldAlert size={18} /> Admin Dashboard
            </NavLink>
          ) : (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} /> Dashboard
              </NavLink>
              <NavLink to="/encrypt" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
                <Lock size={18} /> Encrypt File
              </NavLink>
              <NavLink to="/decrypt" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
                <Unlock size={18} /> Decrypt File
              </NavLink>
              <NavLink to="/my-files" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
                <FolderLock size={18} /> My Files
              </NavLink>
              <NavLink to="/history" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
                <History size={18} /> History
              </NavLink>
            </>
          )}
        </nav>
      </div>

      <div>
        <div className="side-info-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 600, marginBottom: 4 }}>
            <Lock size={14} /> {isAdmin ? 'Admin Control' : 'AES-256-GCM Vault'}
          </div>
          {isAdmin
            ? 'Manage registered users, encrypted vault stats, and audit logs.'
            : 'Files are encrypted with AES-256-GCM and stored safely in your vault.'}
        </div>

        <div className="side-footer">
          <button className="side-btn" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <button className="side-btn" onClick={logout}>
            <LogOut size={16} /> Sign out
          </button>
          <div className="user-email">{user?.email}</div>
        </div>
      </div>
    </aside>
  );
}
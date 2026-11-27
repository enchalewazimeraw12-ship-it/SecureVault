import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

export default function Login({ setUser, theme, toggleTheme }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-visual">
        <img src="/auth-bg.jpg" alt="SecureVault AES Security" />
        <div className="auth-visual-overlay">
          <div className="auth-visual-copy">
            <h2>AES-256-GCM Security</h2>
            <p>Strong, authenticated encryption keeps your files protected.</p>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <div className="brand-icon" style={{ width: 32, height: 32 }}><ShieldCheck size={18} /></div>
            SecureVault
          </div>
          <button type="button" className="btn btn-outline" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>

        <div className="auth-form-wrap">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to access your encrypted vault.</p>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
              Sign in
            </button>
          </form>

          <p style={{ marginTop: 18, fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Don&apos;t have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
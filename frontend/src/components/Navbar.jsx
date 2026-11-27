import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut } from 'lucide-react';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <ShieldCheck size={22} /> SecureVault AES
      </Link>
      {user ? (
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/encrypt">Encrypt</Link>
          <Link to="/decrypt">Decrypt</Link>
          <Link to="/my-files">My Files</Link>
          <Link to="/history">History</Link>
          {user.role === 'admin' && <Link to="/admin">Admin</Link>}
          <button className="btn btn-secondary" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      ) : (
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </nav>
  );
}
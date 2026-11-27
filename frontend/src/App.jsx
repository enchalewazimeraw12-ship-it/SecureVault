import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EncryptFile from './pages/EncryptFile';
import DecryptFile from './pages/DecryptFile';
import MyFiles from './pages/MyFiles';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const homePath = !user ? '/login' : user.role === 'admin' ? '/admin' : '/dashboard';

  const AppLayout = ({ children }) => (
    <div className="app-shell">
      <Sidebar user={user} setUser={setUser} theme={theme} toggleTheme={toggleTheme} />
      <main className="main-area">{children}</main>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={homePath} replace />} />
        <Route
          path="/login"
          element={user ? <Navigate to={homePath} replace /> : <Login setUser={setUser} theme={theme} toggleTheme={toggleTheme} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to={homePath} replace /> : <Register setUser={setUser} theme={theme} toggleTheme={toggleTheme} />}
        />

        <Route path="/dashboard" element={<ProtectedRoute user={user} userOnly><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/encrypt" element={<ProtectedRoute user={user} userOnly><AppLayout><EncryptFile /></AppLayout></ProtectedRoute>} />
        <Route path="/decrypt" element={<ProtectedRoute user={user} userOnly><AppLayout><DecryptFile /></AppLayout></ProtectedRoute>} />
        <Route path="/my-files" element={<ProtectedRoute user={user} userOnly><AppLayout><MyFiles /></AppLayout></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute user={user} userOnly><AppLayout><History /></AppLayout></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute user={user} adminOnly><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
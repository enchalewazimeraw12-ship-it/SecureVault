import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, adminOnly = false, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}
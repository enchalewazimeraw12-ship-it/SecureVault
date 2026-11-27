import { useEffect, useState } from 'react';
import { Users, FileLock2, History } from 'lucide-react';
import api from '../services/api';

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const fetchAdminOverview = async () => {
  const { data } = await api.get('/admin/overview');
  return data;
};

export default function AdminDashboard() {
  const [data, setData] = useState({ users: [], files: [], history: [] });
  const [feedback, setFeedback] = useState(null);
  const [pendingAction, setPendingAction] = useState('');
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const loadOverview = async () => setData(await fetchAdminOverview());

  useEffect(() => {
    let active = true;
    fetchAdminOverview()
      .then((overview) => {
        if (active) setData(overview);
      })
      .catch((error) => {
        if (active) {
          setFeedback({ type: 'error', text: getErrorMessage(error, 'Could not load the admin overview.') });
        }
      });
    return () => { active = false; };
  }, []);

  const runAdminAction = async (actionId, request, successMessage) => {
    setPendingAction(actionId);
    setFeedback(null);
    try {
      await request();
      try {
        await loadOverview();
      } catch (error) {
        setFeedback({
          type: 'error',
          text: `Action completed, but the overview could not be refreshed: ${getErrorMessage(error, 'Refresh failed.')}`,
        });
        return;
      }
      setFeedback({ type: 'success', text: successMessage });
    } catch (error) {
      setFeedback({ type: 'error', text: getErrorMessage(error, 'The admin action failed.') });
    } finally {
      setPendingAction('');
    }
  };

  const filteredHistory = data.history
    .filter((entry) => historyFilter === 'ALL' || entry.status === historyFilter)
    .slice(0, 15);

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Admin Control Center</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 22 }}>
        System-wide overview of all users, encrypted files, and audit logs.
      </p>

      {feedback && (
        <div className={`alert ${feedback.type === 'error' ? 'alert-error' : 'alert-success'}`} role="alert">
          {feedback.text}
        </div>
      )}

      <div className="grid-3">
        <div className="stat-card">
          <Users size={18} color="var(--primary)" />
          <div className="stat-num">{data.users.length}</div>
          <div className="stat-label">Registered Users</div>
        </div>
        <div className="stat-card">
          <FileLock2 size={18} color="var(--success)" />
          <div className="stat-num">{data.files.length}</div>
          <div className="stat-label">Total Encrypted Files</div>
        </div>
        <div className="stat-card">
          <History size={18} color="#a855f7" />
          <div className="stat-num">{data.history.length}</div>
          <div className="stat-label">Total Audit Events</div>
        </div>
      </div>

      <div className="card">
        <h3>Registered Users</h3>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {data.users.map((user) => {
              const isSelf = user.id === currentUser?.id;
              const isBlocked = user.status === 'blocked';
              const actionId = `user-${user.id}`;
              return (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td><span className="badge badge-ok">{user.role.toUpperCase()}</span></td>
                  <td>
                    <span className={`badge ${isBlocked ? 'badge-fail' : 'badge-ok'}`}>
                      {isBlocked ? 'BLOCKED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={isSelf || Boolean(pendingAction)}
                      onClick={() => runAdminAction(
                        actionId,
                        () => api.patch(`/admin/users/${user.id}/toggle-status`),
                        `User ${user.email} ${isBlocked ? 'unblocked' : 'blocked'}.`,
                      )}
                    >
                      {isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={isSelf || Boolean(pendingAction)}
                      onClick={() => {
                        if (!window.confirm(`Delete ${user.email} and all of their encrypted files?`)) return;
                        runAdminAction(
                          actionId,
                          () => api.delete(`/admin/users/${user.id}`),
                          `User ${user.email} and their encrypted files were deleted.`,
                        );
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {data.users.length === 0 && (
              <tr><td colSpan="6">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Vault Encrypted Files</h3>
        <table>
          <thead>
            <tr><th>File Name</th><th>Owner Email</th><th>Size</th><th>Algorithm</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {data.files.map((file) => {
              const actionId = `file-${file.id}`;
              return (
                <tr key={file.id}>
                  <td>{file.originalName}</td>
                  <td>{file.ownerEmail}</td>
                  <td>{(file.encryptedSize / 1024).toFixed(1)} KB</td>
                  <td>{file.algorithm}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={Boolean(pendingAction)}
                      onClick={() => {
                        if (!window.confirm(`Delete the encrypted file "${file.originalName}"?`)) return;
                        runAdminAction(
                          actionId,
                          () => api.delete(`/admin/files/${file.id}`),
                          `Encrypted file "${file.originalName}" was deleted.`,
                        );
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {data.files.length === 0 && (
              <tr><td colSpan="5">No encrypted files found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Recent System Audit Logs</h3>
        <div style={{ display: 'flex', gap: 8, margin: '14px 0' }}>
          {['ALL', 'SUCCESS', 'FAILED'].map((filter) => (
            <button
              key={filter}
              type="button"
              className={`btn ${historyFilter === filter ? 'btn-primary' : 'btn-outline'}`}
              aria-pressed={historyFilter === filter}
              onClick={() => setHistoryFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <table>
          <thead><tr><th>User</th><th>Action</th><th>File</th><th>Status</th><th>Time</th></tr></thead>
          <tbody>
            {filteredHistory.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.userEmail}</td>
                <td>{entry.action}</td>
                <td>{entry.fileName}</td>
                <td>
                  <span className={`badge ${entry.status === 'SUCCESS' ? 'badge-ok' : 'badge-fail'}`}>
                    {entry.status}
                  </span>
                </td>
                <td>{new Date(entry.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {filteredHistory.length === 0 && (
              <tr><td colSpan="5">No {historyFilter === 'ALL' ? '' : historyFilter.toLowerCase()} audit events found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../services/api';

export default function History() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/files/history').then((res) => setLogs(res.data.history)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="card">
        <h2>Activity History</h2>
        {logs.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No activity recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>File</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{new Date(l.timestamp).toLocaleString()}</td>
                  <td>{l.action}</td>
                  <td>{l.fileName}</td>
                  <td>
                    <span className={`badge ${l.status === 'SUCCESS' ? 'badge-ok' : 'badge-fail'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td>{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
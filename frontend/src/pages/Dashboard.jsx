import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ encrypted: 0, decrypted: 0, failed: 0 });

  useEffect(() => {
    Promise.all([api.get('/files/my-files'), api.get('/files/history')])
      .then(([fRes, hRes]) => {
        const logs = hRes.data.history;
        setStats({
          encrypted: fRes.data.files.length,
          decrypted: logs.filter((l) => l.action === 'DECRYPT' && l.status === 'SUCCESS').length,
          failed: logs.filter((l) => l.action === 'DECRYPT' && l.status === 'FAILED').length,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="hero-card">
        <div className="hero-tag">AES-256-GCM • FIREBASE VAULT</div>
        <h1 className="hero-title">Military-grade encryption, right in your vault.</h1>
        <p className="hero-desc">
          AES-256-GCM with scrypt key derivation. Select your files, encrypt them securely, save them, and decrypt anytime with the exact key.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/encrypt" className="btn btn-primary"><Lock size={16} /> Encrypt a file</Link>
          <Link to="/decrypt" className="btn btn-outline"><Unlock size={16} /> Decrypt a file</Link>
        </div>
      </div>

      <div className="grid-3">
        <div className="stat-card">
          <Lock size={18} color="var(--primary)" />
          <div className="stat-num">{stats.encrypted}</div>
          <div className="stat-label">Files encrypted</div>
        </div>
        <div className="stat-card">
          <Unlock size={18} color="var(--success)" />
          <div className="stat-num">{stats.decrypted}</div>
          <div className="stat-label">Files decrypted</div>
        </div>
        <div className="stat-card">
          <ShieldAlert size={18} color="var(--danger)" />
          <div className="stat-num">{stats.failed}</div>
          <div className="stat-label">Failed attempts</div>
        </div>
      </div>
    </div>
  );
}
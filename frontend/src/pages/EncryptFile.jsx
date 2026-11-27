import { useState } from 'react';
import { Lock, Download } from 'lucide-react';
import api, { downloadBlobResponse } from '../services/api';

export default function EncryptFile() {
  const [file, setFile] = useState(null);
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [savedFile, setSavedFile] = useState(null);

  const handleEncrypt = async (e) => {
    e.preventDefault();
    if (!file) return setMsg({ type: 'error', text: 'Please select a file first.' });
    setLoading(true);
    setMsg({ type: '', text: '' });
    setSavedFile(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('secretKey', secretKey);

      const { data } = await api.post('/files/encrypt', formData);
      setSavedFile(data.file);
      setMsg({ type: 'success', text: `Successfully encrypted "${file.name}" using AES-256-GCM!` });
      setSecretKey('');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Encryption failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadEnc = async () => {
    const res = await api.get(`/files/download/${savedFile.id}`, { responseType: 'blob' });
    downloadBlobResponse(res, `${savedFile.originalName}.enc`);
  };

  return (
    <div>
      <div className="card">
        <h2><Lock size={20} /> Encrypt a File (AES-256-GCM)</h2>
        {msg.text && <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>{msg.text}</div>}

        <form onSubmit={handleEncrypt}>
          <div className="form-group">
            <label>Select File (PDF, Image, Text, Doc, Zip, etc.)</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
          </div>
          <div className="form-group">
            <label>Secret Encryption Key (Remember this key to decrypt later!)</label>
            <input
              type="password"
              placeholder="Enter strong AES key (min 4 chars)"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Encrypting...' : 'Encrypt & Save File'}
          </button>
        </form>

        {savedFile && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #334155' }}>
            <p style={{ marginBottom: 10, color: '#cbd5e1' }}>Encrypted file saved on server vault.</p>
            <button className="btn btn-success" onClick={handleDownloadEnc}>
              <Download size={16} /> Download Encrypted File (.enc)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
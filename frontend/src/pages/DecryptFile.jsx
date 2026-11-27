import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Unlock } from 'lucide-react';
import api, { downloadBlobResponse } from '../services/api';

export default function DecryptFile() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('id') ? 'vault' : 'upload');
  const [files, setFiles] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || '');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [secretKey, setSecretKey] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/files/my-files').then((res) => setFiles(res.data.files)).catch(() => {});
  }, []);

  const handleDecrypt = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      let res;
      if (mode === 'vault') {
        if (!selectedId) throw new Error('Please choose a saved file.');
        res = await api.post(`/files/decrypt/${selectedId}`, { secretKey }, { responseType: 'blob' });
      } else {
        if (!uploadedFile) throw new Error('Please select a .enc file.');
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('secretKey', secretKey);
        res = await api.post('/files/decrypt-upload', formData, { responseType: 'blob' });
      }

      downloadBlobResponse(res, 'decrypted-file');
      setMsg({ type: 'success', text: 'Decryption successful! Your original file is downloading.' });
      setSecretKey('');
    } catch (err) {
      let errorText = err.message || 'Decryption failed.';
      if (err.response?.data instanceof Blob) {
        try {
          const parsed = JSON.parse(await err.response.data.text());
          errorText = parsed.message;
        } catch {}
      }
      setMsg({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2><Unlock size={20} /> Decrypt File</h2>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <button type="button" className={`btn ${mode === 'vault' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setMode('vault')}>
            From Saved Vault
          </button>
          <button type="button" className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setMode('upload')}>
            Upload .enc File
          </button>
        </div>

        {msg.text && <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>{msg.text}</div>}

        <form onSubmit={handleDecrypt}>
          {mode === 'vault' ? (
            <div className="form-group">
              <label>Select Saved Encrypted File</label>
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required>
                <option value="">-- Choose a file --</option>
                {files.map((f) => (
                  <option key={f.id} value={f.id}>{f.originalName} ({(f.encryptedSize / 1024).toFixed(1)} KB)</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label>Select Encrypted (.enc) File from Computer</label>
              <input type="file" accept=".enc" onChange={(e) => setUploadedFile(e.target.files[0])} required />
            </div>
          )}

          <div className="form-group">
            <label>Decryption Key</label>
            <input
              type="password"
              placeholder="Enter the exact key used during encryption"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-success" disabled={loading}>
            {loading ? 'Decrypting...' : 'Decrypt & Download Original File'}
          </button>
        </form>
      </div>
    </div>
  );
}
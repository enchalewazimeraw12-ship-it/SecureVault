import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Unlock, Trash2 } from 'lucide-react';
import api, { downloadBlobResponse } from '../services/api';

export default function MyFiles() {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  const loadFiles = () => api.get('/files/my-files').then((res) => setFiles(res.data.files)).catch(() => {});
  useEffect(() => { loadFiles(); }, []);

  const handleDownloadEnc = async (file) => {
    const res = await api.get(`/files/download/${file.id}`, { responseType: 'blob' });
    downloadBlobResponse(res, `${file.originalName}.enc`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this encrypted file?')) return;
    await api.delete(`/files/${id}`);
    loadFiles();
  };

  return (
    <div>
      <div className="card">
        <h2>My Encrypted Files</h2>
        {files.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No encrypted files yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Original Name</th>
                <th>Size</th>
                <th>Algorithm</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.id}>
                  <td>{f.originalName}</td>
                  <td>{(f.encryptedSize / 1024).toFixed(1)} KB</td>
                  <td>{f.algorithm}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success" onClick={() => navigate(`/decrypt?id=${f.id}`)}>
                      <Unlock size={14} /> Decrypt
                    </button>
                    <button className="btn btn-outline" onClick={() => handleDownloadEnc(f)}>
                      <Download size={14} /> .enc
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(f.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
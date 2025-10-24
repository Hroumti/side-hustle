import React from 'react';
import { useParams } from 'react-router-dom';
import { fileOperations } from '../utils/fileOperations';
import { fileServer } from '../utils/fileServer';

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

function getExtensionFromUrl(url) {
  const match = /\.([a-zA-Z0-9]+)(?:\?|#|$)/.exec(url || '');
  return match ? match[1].toLowerCase() : '';
}

const Td = () => {
  const { year } = useParams();
  const [allFiles, setAllFiles] = React.useState([]);
  const [query, setQuery] = React.useState('');
  const [ext, setExt] = React.useState('all'); // all | pdf | ppt
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let isMounted = true;
    async function loadIndex() {
      setLoading(true);
      setError('');
      try {
        // First try to get files from localStorage (admin-managed files)
        let raw = fileOperations.getPublicFiles('td');
        
        // If no files in localStorage, fallback to original JSON
        if (raw.length === 0) {
          const res = await fetch('/td/index.json', { cache: 'no-store' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          raw = await res.json();
          if (!Array.isArray(raw)) throw new Error('Index JSON must be an array');
        }
        
        const normalized = raw.map((f) => {
          const extension = (f.ext || getExtensionFromUrl(f.url)).toLowerCase();
          return {
            name: f.name || f.url?.split('/').pop() || 'Fichier',
            url: f.url,
            size: Number.isFinite(f.size) ? f.size : undefined,
            uploadedAt: f.uploadedAt || null,
            year: (f.year || '').toLowerCase(),
            ext: extension,
          };
        });
        if (isMounted) setAllFiles(normalized);
      } catch (e) {
        if (isMounted) setError('Impossible de charger la liste des TD.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadIndex();
    
    // Listen for storage changes and custom events to update files when admin makes changes
    const handleStorageChange = (e) => {
      if (e.key === 'encg_td_files') {
        loadIndex();
      }
    };
    
    const handleFilesUpdated = (e) => {
      if (e.detail.type === 'td') {
        loadIndex();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('filesUpdated', handleFilesUpdated);
    
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('filesUpdated', handleFilesUpdated);
    };
  }, []);

  const filtered = React.useMemo(() => {
    const targetYear = (year || '').toLowerCase();
    return allFiles.filter((f) => {
      if (targetYear && f.year !== targetYear) return false;
      if (ext !== 'all' && f.ext !== ext) return false;
      if (query && !f.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [allFiles, year, ext, query]);

  function handlePreview(file) {
    // Use the file server to handle both original and uploaded files
    fileServer.handleFileView(file);
  }

  return (
    <section className="cours-container">
      <header className="cours-header">
        <h1 className="cours-title">TD</h1>
        <div className="cours-controls">
          <input
            className="cours-search"
            type="search"
            placeholder="Rechercher un fichier..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="cours-filter"
            value={ext}
            onChange={(e) => setExt(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="pdf">PDF</option>
            <option value="ppt">PPT</option>
          </select>
        </div>
      </header>

      {loading && (
        <div className="cours-status">Chargement...</div>
      )}
      {!loading && error && (
        <div className="cours-status error">{error}</div>
      )}

      {!loading && !error && (
        <div className="cours-grid">
          {filtered.map((file, idx) => {
            const dateStr = file.uploadedAt
              ? new Date(file.uploadedAt).toLocaleDateString()
              : '—';
            const sizeStr = file.size ? formatBytes(file.size) : '—';
            return (
              <article key={`${file.url}-${idx}`} className="cours-card">
                <div className="cours-card-header">
                  <div className="cours-file-name">{file.name}</div>
                  <div className={`badge ext-${file.ext}`}>{file.ext?.toUpperCase()}</div>
                </div>
                <div className="cours-card-meta">
                  <span>Année: {file.year?.toUpperCase() || '—'}</span>
                  <span>Ajouté: {dateStr}</span>
                  <span>Taille: {sizeStr}</span>
                </div>
                <div className="cours-card-actions">
                  <button className="btn btn-preview" onClick={() => handlePreview(file)}>Aperçu</button>
                  <button
                    className="btn btn-download"
                    onClick={() => fileServer.handleFileDownload(file)}
                  >
                    Télécharger
                  </button>
                </div>
              </article>
            );
          })}
          {filtered.length === 0 && (
            <div className="cours-status">Aucun fichier trouvé.</div>
          )}
        </div>
      )}
    </section>
  );
};

export default Td;



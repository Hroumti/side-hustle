import React from 'react';
import { useParams } from 'react-router-dom';
import { useContext } from 'react';
import { fileOperations } from '../utils/fileOperations';
import { fileServer } from '../utils/fileServer';
import { Context } from './context';
import { useNotification } from './NotificationContext';
import LoginRequiredModal from './LoginRequiredModal';
import { FaFilePdf, FaFilePowerpoint, FaSpinner } from 'react-icons/fa';

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
  const { role } = useContext(Context);
  const { showSuccess, showError, showInfo } = useNotification();
  const [allFiles, setAllFiles] = React.useState([]);
  const [query, setQuery] = React.useState('');
  const [ext, setExt] = React.useState('all'); // all | pdf | ppt
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [modalAction, setModalAction] = React.useState('download');
  const [previewingFile, setPreviewingFile] = React.useState(null);
  const [downloadingFile, setDownloadingFile] = React.useState(null);

  // Reset loading states on component mount to prevent stuck spinners
  React.useEffect(() => {
    setPreviewingFile(null);
    setDownloadingFile(null);
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    async function loadIndex() {
      setLoading(true);
      setError('');
      try {
        let raw = await fileOperations.getPublicFiles('td');
        
        if (!Array.isArray(raw)) {
          raw = [];
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
    
    const handleFilesUpdated = (e) => {
      if (e.detail.type === 'td') {
        loadIndex();
      }
    };
    
    window.addEventListener('filesUpdated', handleFilesUpdated);
    
    return () => {
      isMounted = false;
      window.removeEventListener('filesUpdated', handleFilesUpdated);
    };
  }, []);

  const filtered = React.useMemo(() => {
    const targetYear = (year || '').toLowerCase();
    return allFiles.filter((f) => {
      if (targetYear && f.year !== targetYear) return false;
      if (ext !== 'all') {
        if (ext === 'ppt') {
          if (!(f.ext === 'ppt' || f.ext === 'pptx')) return false;
        } else if (f.ext !== ext) {
          return false;
        }
      }
      if (query && !f.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [allFiles, year, ext, query]);

  async function handlePreview(file) {
    if (!role) {
      setModalAction('preview');
      setShowLoginModal(true);
      return;
    }
    
    setPreviewingFile(file.name);
    try {
      await fileServer.handleFileView(file);
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setPreviewingFile(null);
    }
  }

  async function handleDownload(file) {
    if (!role) {
      setModalAction('download');
      setShowLoginModal(true);
      return;
    }
    
    setDownloadingFile(file.name);
    try {
      // Create notification function
      const showNotification = (message, type, duration) => {
        if (type === 'success') showSuccess(message, duration);
        else if (type === 'error') showError(message, duration);
        else if (type === 'info') showInfo(message, duration);
      };
      
      await fileServer.handleFileDownload(file, showNotification);
    } catch (error) {
      console.error('Download error:', error);
      showError('Erreur lors du téléchargement du fichier');
    } finally {
      setDownloadingFile(null);
    }
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
            const isPdf = file.ext === 'pdf';
            const isPpt = file.ext === 'ppt' || file.ext === 'pptx';
            return (
              <article key={`${file.url}-${idx}`} className="cours-card">
                <div className="cours-card-header">
                  <div className="cours-file-name">
                    {isPdf && <FaFilePdf style={{ color: '#d32f2f', marginRight: 8 }} />}
                    {isPpt && <FaFilePowerpoint style={{ color: '#ff8f00', marginRight: 8 }} />}
                    {file.name}
                  </div>
                  <div className={`badge ext-${file.ext}`}>{file.ext?.toUpperCase()}</div>
                </div>
                <div className="cours-card-meta">
                  <span>Année: {file.year?.toUpperCase() || '—'}</span>
                  <span>Ajouté: {dateStr}</span>
                  <span>Taille: {sizeStr}</span>
                </div>
                <div className="cours-card-actions single-action">
                  <button 
                    className="btn btn-download" 
                    onClick={() => isPdf ? handlePreview(file) : handleDownload(file)}
                    disabled={isPdf ? previewingFile === file.name : downloadingFile === file.name}
                  >
                    {(isPdf ? previewingFile === file.name : downloadingFile === file.name) ? (
                      <><FaSpinner className="spinner" /> {isPdf ? 'Ouverture...' : 'Téléchargement...'}</>
                    ) : (
                      'Télécharger'
                    )}
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
      
      <LoginRequiredModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        actionType={modalAction}
      />
    </section>
  );
};

export default Td;

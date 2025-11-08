import React, { useState, useEffect } from "react";
import { FaUpload, FaTrash, FaFile, FaDownload, FaEye, FaPlus, FaTimes, FaSpinner } from "react-icons/fa";
import { fileOperations } from "../utils/fileOperations";
import { fileServer } from "../utils/fileServer";
import { useNotification } from "./NotificationContext";
import "./styles/FileManager.css";

const FileManager = ({ type, title, onFileChange }) => {
  const [files, setFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("3eme");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [deletingFile, setDeletingFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { showSuccess, showError } = useNotification();

  const years = ["3eme", "4eme", "5eme"];

  useEffect(() => {
    loadFiles();
  }, [type]);

  const loadFiles = async () => {
    try {
      const data = await fileOperations.getFiles(type);
      setFiles(data);
    } catch (error) {
      // Silently handle file loading errors
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadFileName.trim()) return;

    // Import security validation
    const { validateFileUpload } = await import('../utils/securityConfig.js');

    // Validate file security
    const validation = validateFileUpload(uploadFile);
    if (!validation.valid) {
      showError(validation.error);
      return;
    }

    // Simplified filename validation
    const sanitizedFileName = uploadFileName.trim();
    if (sanitizedFileName.length < 1 || sanitizedFileName.length > 100) {
      showError("Le nom du fichier doit contenir entre 1 et 100 caractères");
      return;
    }

    setUploading(true);

    try {
      // Upload file using utility with sanitized filename
      const newFile = await fileOperations.uploadFile(uploadFile, sanitizedFileName, selectedYear, type);

      // Update local state
      setFiles(prev => [...prev, newFile]);

      // Update files index
      await fileOperations.updateFilesIndex([...files, newFile], type);

      // Notify parent component about file change
      if (onFileChange) {
        onFileChange();
      }

      // Reset form
      setUploadFile(null);
      setUploadFileName("");
      setShowUpload(false);

      showSuccess("Fichier téléchargé avec succès !");
    } catch (error) {
      if (error?.message === 'QuotaExceeded' || error?.message === 'StorageQuotaExceeded') {
        showError("Espace de stockage indisponible. Supprimez d'anciens fichiers avant de réessayer.");
      } else if (error?.message?.includes('Permission denied')) {
        showError("Permissions insuffisantes pour télécharger le fichier");
      } else if (error?.message?.includes('File too large')) {
        showError("Le fichier est trop volumineux (maximum 50MB)");
      } else {
        showError("Erreur lors du téléchargement du fichier");
      }
    } finally {
      setUploading(false);
    }
  };

  const confirmDeleteFile = (fileName, year) => {
    setFileToDelete({ fileName, year });
    setShowDeleteConfirm(true);
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    
    const { fileName, year } = fileToDelete;
    const fileKey = `${fileName}-${year}`;
    setDeletingFile(fileKey);
    setShowDeleteConfirm(false);

    try {
      // Delete file using utility
      await fileOperations.deleteFile(fileName, year, type);

      // Remove from local state
      setFiles(prev => prev.filter(file => !(file.name === fileName && file.year === year)));

      // Update files index
      const updatedFiles = files.filter(file => !(file.name === fileName && file.year === year));
      await fileOperations.updateFilesIndex(updatedFiles, type);

      // Notify parent component about file change
      if (onFileChange) {
        onFileChange();
      }

      showSuccess("Fichier supprimé avec succès !");
    } catch (error) {
      showError("Erreur lors de la suppression du fichier");
    } finally {
      setDeletingFile(null);
      setFileToDelete(null);
    }
  };

  const toggleFileSelection = (fileName, year) => {
    const fileKey = `${fileName}-${year}`;
    setSelectedFiles(prev => {
      if (prev.includes(fileKey)) {
        return prev.filter(key => key !== fileKey);
      } else {
        return [...prev, fileKey];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      const allFileKeys = filteredFiles.map(file => `${file.name}-${file.year}`);
      setSelectedFiles(allFileKeys);
    }
  };

  const confirmBulkDelete = () => {
    if (selectedFiles.length === 0) {
      showError("Veuillez sélectionner au moins un fichier");
      return;
    }
    setShowBulkDeleteConfirm(true);
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    setBulkDeleting(true);
    setShowBulkDeleteConfirm(false);

    try {
      const deletePromises = selectedFiles.map(fileKey => {
        const [fileName, year] = fileKey.split('-');
        return fileOperations.deleteFile(fileName, year, type);
      });

      await Promise.all(deletePromises);

      // Remove deleted files from local state
      setFiles(prev => prev.filter(file => {
        const fileKey = `${file.name}-${file.year}`;
        return !selectedFiles.includes(fileKey);
      }));

      // Update files index
      const updatedFiles = files.filter(file => {
        const fileKey = `${file.name}-${file.year}`;
        return !selectedFiles.includes(fileKey);
      });
      await fileOperations.updateFilesIndex(updatedFiles, type);

      // Notify parent component about file change
      if (onFileChange) {
        onFileChange();
      }

      showSuccess(`${selectedFiles.length} fichier(s) supprimé(s) avec succès !`);
      setSelectedFiles([]);
    } catch (error) {
      showError("Erreur lors de la suppression des fichiers");
    } finally {
      setBulkDeleting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (ext) => {
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'ppt':
      case 'pptx': return '📊';
      case 'xls':
      case 'xlsx': return '📈';
      case 'zip':
      case 'rar': return '📦';
      default: return '📁';
    }
  };

  const filteredFiles = files.filter(file => file.year === selectedYear);

  return (
    <div className="file-manager">
      <div className="file-manager-header">
        <h3 className="GTitle">Gestion des {title}</h3>
        <div className="file-manager-controls">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="year-selector"
          >
            {years.map(year => (
              <option key={year} value={year}>{year} année</option>
            ))}
          </select>
          {selectedFiles.length > 0 && (
            <button
              className="btn btn-danger"
              onClick={confirmBulkDelete}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? (
                <><FaSpinner className="spinner" /> Suppression...</>
              ) : (
                <><FaTrash /> Supprimer ({selectedFiles.length})</>
              )}
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => setShowUpload(true)}
          >
            <FaPlus /> Ajouter {type === 'cours' ? 'Cours' : 'TD'}
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="upload-modal">
          <div className="upload-modal-content">
            <div className="upload-modal-header">
              <h4>Télécharger Nouveau {type === 'cours' ? 'Cours' : 'TD'}</h4>
              <button
                className="close-btn"
                onClick={() => setShowUpload(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="upload-form">
              <div className="form-group">
                <label>Nom du Fichier :</label>
                <input
                  type="text"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="Entrez le nom du fichier"
                  required
                />
              </div>

              <div className="form-group">
                <label>Année :</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year} année</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sélectionner le Fichier :</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setUploadFile(file || null);
                    if (file) {
                      const lastDotIndex = file.name.lastIndexOf('.');
                      const baseName = lastDotIndex > 0 ? file.name.slice(0, lastDotIndex) : file.name;
                      setUploadFileName((prev) => prev?.trim() ? prev : baseName);
                    }
                  }}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUpload(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? <FaUpload className="spinning" /> : <FaUpload />}
                  {uploading ? 'Téléchargement...' : 'Télécharger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="files-list">
        {filteredFiles.length === 0 ? (
          <div className="no-files">
            <FaFile size={48} />
            <p>Aucun {type === 'cours' ? 'cours' : 'TD'} trouvé pour l'année {selectedYear}</p>
          </div>
        ) : (
          <>
            {filteredFiles.length > 0 && (
              <div className="bulk-actions">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <span>Tout sélectionner ({filteredFiles.length})</span>
                </label>
              </div>
            )}
            <div className="files-grid">
              {filteredFiles.map((file, index) => {
                const isPdf = file.ext === 'pdf';
                const isPpt = file.ext === 'ppt' || file.ext === 'pptx';
                const fileKey = `${file.name}-${file.year}`;
                const isSelected = selectedFiles.includes(fileKey);

                return (
                  <div key={index} className={`file-card ${isSelected ? 'selected' : ''}`}>
                    <div className="file-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFileSelection(file.name, file.year)}
                      />
                    </div>
                    <div className="file-icon">
                      {getFileIcon(file.ext)}
                    </div>
                    <div className="file-info">
                      <h4>{file.name}</h4>
                      <p className="file-meta">
                        {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                    <div className="file-actions single-view-action">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => isPdf ? fileServer.handleFileView(file) : fileServer.handleFileDownload(file)}
                        title="Télécharger"
                      >
                        <FaDownload /> Télécharger
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => confirmDeleteFile(file.name, file.year)}
                        title="Supprimer"
                        disabled={deletingFile === fileKey}
                      >
                        {deletingFile === fileKey ? (
                          <><FaSpinner className="spinner" /> Suppression...</>
                        ) : (
                          <><FaTrash /> Supprimer</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="upload-modal">
          <div className="upload-modal-content confirm-modal">
            <div className="upload-modal-header">
              <h4>Confirmer la suppression</h4>
              <button
                className="close-btn"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFileToDelete(null);
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer le fichier <strong>{fileToDelete?.fileName}</strong> ?</p>
              <p className="warning-text">Cette action est irréversible.</p>
            </div>
            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFileToDelete(null);
                }}
              >
                Annuler
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteFile}
              >
                <FaTrash /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="upload-modal">
          <div className="upload-modal-content confirm-modal">
            <div className="upload-modal-header">
              <h4>Confirmer la suppression multiple</h4>
              <button
                className="close-btn"
                onClick={() => setShowBulkDeleteConfirm(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer <strong>{selectedFiles.length} fichier(s)</strong> ?</p>
              <p className="warning-text">Cette action est irréversible.</p>
            </div>
            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowBulkDeleteConfirm(false)}
              >
                Annuler
              </button>
              <button
                className="btn btn-danger"
                onClick={handleBulkDelete}
              >
                <FaTrash /> Supprimer tout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;

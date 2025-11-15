import React, { useState, useEffect } from "react";
import { FaUpload, FaTrash, FaFile, FaDownload, FaEye, FaPlus, FaTimes, FaSpinner, FaLink } from "react-icons/fa";
import { fileOperations, getModulesForYear } from "../utils/fileOperations";
import { fileServer } from "../utils/fileServer";
import { useNotification } from "./NotificationContext";
import "./styles/FileManager.css";

const FileManager = ({ type, title, onFileChange }) => {
  const [files, setFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("year3");
  const [selectedModule, setSelectedModule] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [deletingFile, setDeletingFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { showSuccess, showError } = useNotification();

  const years = [
    { value: "year3", label: "3ème année" },
    { value: "year4", label: "4ème année" },
    { value: "year5", label: "5ème année" }
  ];

  // Get available modules for selected year
  const availableModules = getModulesForYear(selectedYear);

  // Set default module when year changes
  useEffect(() => {
    if (availableModules.length > 0 && !selectedModule) {
      setSelectedModule(availableModules[0]);
    }
  }, [selectedYear, availableModules]);

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
    if (!uploadFile || !uploadFileName.trim() || !selectedModule) {
      showError("Veuillez remplir tous les champs");
      return;
    }

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
      // Upload file with module name (NEW STRUCTURE)
      const newFile = await fileOperations.uploadFile(
        uploadFile, 
        sanitizedFileName, 
        selectedYear, 
        type, 
        selectedModule
      );

      // Reload files to get updated list
      await loadFiles();

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
        showError(error.message || "Erreur lors du téléchargement du fichier");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!linkUrl.trim() || !linkDescription.trim() || !selectedModule) {
      showError("Veuillez remplir tous les champs");
      return;
    }

    // Validate URL
    try {
      new URL(linkUrl);
    } catch {
      showError("URL invalide");
      return;
    }

    setUploading(true);

    try {
      await fileOperations.addLink(
        { url: linkUrl, description: linkDescription },
        selectedYear,
        type,
        selectedModule
      );

      // Reload files
      await loadFiles();

      // Notify parent component
      if (onFileChange) {
        onFileChange();
      }

      // Reset form
      setLinkUrl("");
      setLinkDescription("");
      setShowAddLink(false);

      showSuccess("Lien ajouté avec succès !");
    } catch (error) {
      showError(error.message || "Erreur lors de l'ajout du lien");
    } finally {
      setUploading(false);
    }
  };

  const confirmDeleteFile = (file) => {
    setFileToDelete(file);
    setShowDeleteConfirm(true);
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    
    const fileKey = `${fileToDelete.id}-${fileToDelete.year}`;
    setDeletingFile(fileKey);
    setShowDeleteConfirm(false);

    try {
      // Delete resource using new structure
      await fileOperations.deleteResource(
        fileToDelete.id,
        fileToDelete.year,
        type,
        fileToDelete.module
      );

      // Reload files
      await loadFiles();

      // Notify parent component
      if (onFileChange) {
        onFileChange();
      }

      showSuccess("Ressource supprimée avec succès !");
    } catch (error) {
      showError(error.message || "Erreur lors de la suppression");
    } finally {
      setDeletingFile(null);
      setFileToDelete(null);
    }
  };

  const toggleFileSelection = (file) => {
    const fileKey = `${file.id}-${file.year}`;
    setSelectedFiles(prev => {
      if (prev.some(f => f.key === fileKey)) {
        return prev.filter(f => f.key !== fileKey);
      } else {
        return [...prev, { key: fileKey, file }];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      const allFiles = filteredFiles.map(file => ({
        key: `${file.id}-${file.year}`,
        file
      }));
      setSelectedFiles(allFiles);
    }
  };

  const confirmBulkDelete = () => {
    if (selectedFiles.length === 0) {
      showError("Veuillez sélectionner au moins une ressource");
      return;
    }
    setShowBulkDeleteConfirm(true);
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    setBulkDeleting(true);
    setShowBulkDeleteConfirm(false);

    try {
      const deletePromises = selectedFiles.map(({ file }) => 
        fileOperations.deleteResource(file.id, file.year, type, file.module)
      );

      await Promise.all(deletePromises);

      // Reload files
      await loadFiles();

      // Notify parent component
      if (onFileChange) {
        onFileChange();
      }

      showSuccess(`${selectedFiles.length} ressource(s) supprimée(s) avec succès !`);
      setSelectedFiles([]);
    } catch (error) {
      showError("Erreur lors de la suppression des ressources");
    } finally {
      setBulkDeleting(false);
    }
  };

  const formatFileSize = (sizeInput) => {
    // Handle both string formats like "5.2 MB" and numeric bytes
    if (typeof sizeInput === 'string') {
      return sizeInput; // Already formatted
    }
    
    const bytes = Number(sizeInput);
    if (!bytes || bytes === 0) return '0 Bytes';
    
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

  // Filter files by selected year and optionally by module
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
              <option key={year.value} value={year.value}>{year.label}</option>
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
            className="btn btn-success"
            onClick={() => setShowAddLink(true)}
            style={{ marginRight: '8px' }}
          >
            <FaLink /> Ajouter Lien
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowUpload(true)}
          >
            <FaPlus /> Ajouter Fichier
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
                    <option key={year.value} value={year.value}>{year.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Module :</label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  required
                >
                  <option value="">Sélectionner un module</option>
                  {availableModules.map(module => (
                    <option key={module} value={module}>{module}</option>
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
                const isLink = file.type === 'link';
                const isPdf = file.ext === 'pdf';
                const isPpt = file.ext === 'ppt' || file.ext === 'pptx';
                const fileKey = `${file.id}-${file.year}`;
                const isSelected = selectedFiles.some(f => f.key === fileKey);

                return (
                  <div key={index} className={`file-card ${isSelected ? 'selected' : ''}`}>
                    <div className="file-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFileSelection(file)}
                      />
                    </div>
                    <div className="file-icon">
                      {isLink ? '🔗' : getFileIcon(file.ext)}
                    </div>
                    <div className="file-info">
                      <h4>{file.name}</h4>
                      <p className="file-meta">
                        {file.module && <span>📚 {file.module}</span>}
                        {!isLink && file.size && <span> • {formatFileSize(file.size)}</span>}
                        {file.uploadedAt && <span> • {formatDate(file.uploadedAt)}</span>}
                      </p>
                    </div>
                    <div className="file-actions single-view-action">
                      {isLink ? (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => window.open(file.url, '_blank')}
                          title="Ouvrir le lien"
                        >
                          <FaEye /> Ouvrir
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => isPdf ? fileServer.handleFileView(file) : fileServer.handleFileDownload(file)}
                          title="Télécharger"
                        >
                          <FaDownload /> Télécharger
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => confirmDeleteFile(file)}
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

      {/* Add Link Modal */}
      {showAddLink && (
        <div className="upload-modal">
          <div className="upload-modal-content">
            <div className="upload-modal-header">
              <h4>Ajouter un Lien</h4>
              <button
                className="close-btn"
                onClick={() => setShowAddLink(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddLink} className="upload-form">
              <div className="form-group">
                <label>URL :</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/resource"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description :</label>
                <input
                  type="text"
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  placeholder="Description du lien"
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
                    <option key={year.value} value={year.value}>{year.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Module :</label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  required
                >
                  <option value="">Sélectionner un module</option>
                  {availableModules.map(module => (
                    <option key={module} value={module}>{module}</option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddLink(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? <FaSpinner className="spinning" /> : <FaLink />}
                  {uploading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <p>Êtes-vous sûr de vouloir supprimer <strong>{fileToDelete?.name}</strong> ?</p>
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
              <p>Êtes-vous sûr de vouloir supprimer <strong>{selectedFiles.length} ressource(s)</strong> ?</p>
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

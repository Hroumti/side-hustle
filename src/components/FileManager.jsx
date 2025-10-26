import React, { useState, useEffect } from "react";
import { FaUpload, FaTrash, FaFile, FaDownload, FaEye, FaPlus, FaTimes } from "react-icons/fa";
import { fileOperations } from "../utils/fileOperations";
import { fileServer } from "../utils/fileServer";
import { useNotification } from "./NotificationContext";
import "./styles/FileManager.css";

const FileManager = ({ type, title }) => {
  const [files, setFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("1ere");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const { showSuccess, showError } = useNotification();

  const years = ["1ere", "2eme", "3eme", "4eme", "5eme"];

  useEffect(() => {
    loadFiles();
  }, [type]);

  const loadFiles = async () => {
    try {
      const data = await fileOperations.getFiles(type);
      setFiles(data);
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadFileName.trim()) return;

    setUploading(true);
    
    try {
      // Upload file using utility
      const newFile = await fileOperations.uploadFile(uploadFile, uploadFileName, selectedYear, type);
      
      // Update local state
      setFiles(prev => [...prev, newFile]);
      
      // Update files index
      await fileOperations.updateFilesIndex([...files, newFile], type);
      
      // Reset form
      setUploadFile(null);
      setUploadFileName("");
      setShowUpload(false);
      
      showSuccess("Fichier téléchargé avec succès !");
    } catch (error) {
      console.error("Upload error:", error);
      showError("Erreur lors du téléchargement du fichier");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileName, year) => {
    try {
      // Delete file using utility
      await fileOperations.deleteFile(fileName, year, type);
      
      // Remove from local state
      setFiles(prev => prev.filter(file => !(file.name === fileName && file.year === year)));
      
      // Update files index
      const updatedFiles = files.filter(file => !(file.name === fileName && file.year === year));
      await fileOperations.updateFilesIndex(updatedFiles, type);
      
      showSuccess("Fichier supprimé avec succès !");
    } catch (error) {
      console.error("Delete error:", error);
      showError("Erreur lors de la suppression du fichier");
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
        <h3>Gestion des {title}s</h3>
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
                  onChange={(e) => setUploadFile(e.target.files[0])}
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
          <div className="files-grid">
            {filteredFiles.map((file, index) => (
              <div key={index} className="file-card">
                <div className="file-icon">
                  {getFileIcon(file.ext)}
                </div>
                <div className="file-info">
                  <h4>{file.name}</h4>
                  <p className="file-meta">
                    {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                  </p>
                </div>
                <div className="file-actions">
                  <button 
                    className="btn btn-sm btn-info"
                    onClick={() => fileServer.handleFileView(file)}
                    title="Voir"
                  >
                    <FaEye /> Voir
                  </button>
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => fileServer.handleFileDownload(file)}
                    title="Télécharger"
                  >
                    <FaDownload /> Télécharger
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteFile(file.name, file.year)}
                    title="Supprimer"
                  >
                    <FaTrash /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;

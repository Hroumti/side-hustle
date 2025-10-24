import React, { useState, useEffect } from "react";
import { FaUpload, FaTrash, FaFile, FaDownload, FaEye, FaPlus, FaTimes } from "react-icons/fa";
import { fileOperations } from "../utils/fileOperations";
import "./styles/FileManager.css";

const FileManager = ({ type, title }) => {
  const [files, setFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("3eme");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileName, setUploadFileName] = useState("");

  const years = ["3eme", "4eme", "5eme"];

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
      
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileName, year) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    try {
      // Delete file using utility
      await fileOperations.deleteFile(fileName, year, type);
      
      // Remove from local state
      setFiles(prev => prev.filter(file => !(file.name === fileName && file.year === year)));
      
      // Update files index
      const updatedFiles = files.filter(file => !(file.name === fileName && file.year === year));
      await fileOperations.updateFilesIndex(updatedFiles, type);
      
      alert("File deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting file");
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
        <h3>{title} Management</h3>
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
            <FaPlus /> Add {type === 'cours' ? 'Course' : 'TD'}
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="upload-modal">
          <div className="upload-modal-content">
            <div className="upload-modal-header">
              <h4>Upload New {type === 'cours' ? 'Course' : 'TD'}</h4>
              <button 
                className="close-btn"
                onClick={() => setShowUpload(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleFileUpload} className="upload-form">
              <div className="form-group">
                <label>File Name:</label>
                <input
                  type="text"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="Enter file name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Year:</label>
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
                <label>Select File:</label>
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
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? <FaUpload className="spinning" /> : <FaUpload />} 
                  {uploading ? 'Uploading...' : 'Upload'}
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
            <p>No {type === 'cours' ? 'courses' : 'TDs'} found for {selectedYear} year</p>
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
                    onClick={() => window.open(file.url, '_blank')}
                    title="View"
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = file.url;
                      link.download = file.name;
                      link.click();
                    }}
                    title="Download"
                  >
                    <FaDownload />
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteFile(file.name, file.year)}
                    title="Delete"
                  >
                    <FaTrash />
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

import React, { useState, useEffect } from "react";
import { ref, get, set, push, remove } from "firebase/database";
import { database } from "../firebase";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";
import { FaUpload, FaTrash, FaFile, FaDownload, FaPlus, FaTimes, FaSpinner, FaLink, FaFolder, FaEdit, FaArrowLeft, FaClock } from "react-icons/fa";
import { useNotification } from "./NotificationContext";
import "./styles/FileManager.css";

const FileManagerV2 = ({ type, title, onFileChange }) => {
  const [modules, setModules] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedYear, setSelectedYear] = useState("year3");
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Module management
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editModuleName, setEditModuleName] = useState("");
  
  // Resource management
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState("file");
  const [uploadFile, setUploadFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [deleting, setDeleting] = useState(null);
  
  const { showSuccess, showError } = useNotification();

  const years = [
    { id: "year3", label: "3ème année" },
    { id: "year4", label: "4ème année" },
    { id: "year5", label: "5ème année" }
  ];

  const [modulesData, setModulesData] = useState([]);

  useEffect(() => {
    loadModules();
  }, [selectedYear, type]);

  useEffect(() => {
    if (selectedModule) {
      loadResources();
    }
  }, [selectedModule]);

  const loadModules = async () => {
    setLoading(true);
    setSelectedModule(null);
    try {
      const modulesRef = ref(database, `resources/${type}/${selectedYear}`);
      const snapshot = await get(modulesRef);
      
      if (snapshot.exists()) {
        const moduleNames = Object.keys(snapshot.val());
        setModules(moduleNames);
        
        // Load detailed data for each module
        const modulesWithData = await Promise.all(
          moduleNames.map(async (moduleName) => {
            const moduleData = snapshot.val()[moduleName];
            
            // Count files and get last uploaded
            const files = moduleData && typeof moduleData === 'object' 
              ? Object.values(moduleData).filter(item => item && item.id)
              : [];
            
            const fileCount = files.length;
            
            // Get last uploaded file
            let lastFile = null;
            if (files.length > 0) {
              lastFile = files.reduce((latest, file) => {
                if (!latest || (file.created_at && file.created_at > latest.created_at)) {
                  return file;
                }
                return latest;
              }, null);
            }
            
            return {
              name: moduleName,
              fileCount,
              lastFile
            };
          })
        );
        
        setModulesData(modulesWithData);
      } else {
        setModules([]);
        setModulesData([]);
      }
    } catch (error) {
      showError("Erreur lors du chargement des modules");
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    if (!selectedModule) return;
    
    try {
      const resourcesRef = ref(database, `resources/${type}/${selectedYear}/${selectedModule}`);
      const snapshot = await get(resourcesRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const resourcesList = Object.entries(data).map(([key, value]) => ({ ...value, key }));
        setResources(resourcesList);
      } else {
        setResources([]);
      }
    } catch (error) {
      showError("Erreur lors du chargement des ressources");
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;

    const sanitizedName = newModuleName.trim().replace(/[.#$[\]]/g, "_");
    
    if (modules.includes(sanitizedName)) {
      showError("Ce module existe déjà");
      return;
    }

    setAddingModule(true);
    try {
      const moduleRef = ref(database, `resources/${type}/${selectedYear}/${sanitizedName}`);
      await set(moduleRef, {});

      setModules(prev => [...prev, sanitizedName]);
      setNewModuleName("");
      setShowAddModule(false);
      showSuccess("Module ajouté avec succès");
    } catch (error) {
      showError("Erreur lors de l'ajout du module");
    } finally {
      setAddingModule(false);
    }
  };

  const handleRenameModule = async (oldName) => {
    if (!editModuleName.trim() || editModuleName === oldName) {
      setEditingModule(null);
      return;
    }

    const sanitizedName = editModuleName.trim().replace(/[.#$[\]]/g, "_");
    
    if (modules.includes(sanitizedName)) {
      showError("Ce nom de module existe déjà");
      return;
    }

    try {
      // Get old module data
      const oldRef = ref(database, `resources/${type}/${selectedYear}/${oldName}`);
      const snapshot = await get(oldRef);
      
      if (snapshot.exists()) {
        // Create new module with same data
        const newRef = ref(database, `resources/${type}/${selectedYear}/${sanitizedName}`);
        await set(newRef, snapshot.val());
        
        // Delete old module
        await remove(oldRef);
        
        setModules(prev => prev.map(m => m === oldName ? sanitizedName : m));
        if (selectedModule === oldName) {
          setSelectedModule(sanitizedName);
        }
        showSuccess("Module renommé avec succès");
      }
    } catch (error) {
      showError("Erreur lors du renommage du module");
    } finally {
      setEditingModule(null);
      setEditModuleName("");
    }
  };

  const handleDeleteModule = async (moduleName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le module "${moduleName}" ? Tous les fichiers associés seront supprimés.`)) {
      return;
    }

    try {
      const moduleRef = ref(database, `resources/${type}/${selectedYear}/${moduleName}`);
      await remove(moduleRef);

      setModules(prev => prev.filter(m => m !== moduleName));
      if (selectedModule === moduleName) {
        setSelectedModule(null);
      }
      showSuccess("Module supprimé avec succès");
    } catch (error) {
      showError("Erreur lors de la suppression du module");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    if (uploadType === "file" && !uploadFile) {
      showError("Veuillez sélectionner un fichier");
      return;
    }
    
    if (uploadType === "link" && (!linkUrl.trim() || !linkDescription.trim())) {
      showError("Veuillez entrer l'URL et la description");
      return;
    }

    if (!selectedModule) {
      showError("Veuillez sélectionner un module");
      return;
    }

    setUploading(true);

    try {
      const resourceRef = ref(database, `resources/${type}/${selectedYear}/${selectedModule}`);
      const newResourceRef = push(resourceRef);
      const resourceId = newResourceRef.key;

      if (uploadType === "file") {
        const fileExtension = uploadFile.name.split('.').pop();
        const storagePath = `${type}/${selectedYear}/${selectedModule}/${resourceId}.${fileExtension}`;
        const fileRef = storageRef(storage, storagePath);
        
        await uploadBytes(fileRef, uploadFile);
        const downloadURL = await getDownloadURL(fileRef);

        await set(newResourceRef, {
          id: resourceId,
          type: "file",
          file_type: fileExtension,
          location: storagePath,
          url: downloadURL,
          size: `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB`,
          created_at: new Date().toISOString()
        });

        showSuccess("Fichier téléchargé avec succès");
      } else {
        await set(newResourceRef, {
          id: resourceId,
          type: "link",
          url: linkUrl.trim(),
          description: linkDescription.trim(),
          created_at: new Date().toISOString()
        });

        showSuccess("Lien ajouté avec succès");
      }

      setUploadFile(null);
      setLinkUrl("");
      setLinkDescription("");
      setShowUpload(false);
      
      await loadResources();
      
      if (onFileChange) {
        onFileChange();
      }
    } catch (error) {
      console.error("Upload error:", error);
      showError("Erreur lors du téléchargement");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResource = async (resource) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer cette ressource ?`)) {
      return;
    }

    setDeleting(resource.key);
    try {
      if (resource.type === "file" && resource.location) {
        try {
          const fileRef = storageRef(storage, resource.location);
          await deleteObject(fileRef);
        } catch (storageError) {
          console.error("Storage delete error:", storageError);
        }
      }

      const resourceRef = ref(database, `resources/${type}/${selectedYear}/${selectedModule}/${resource.key}`);
      await remove(resourceRef);

      showSuccess("Ressource supprimée avec succès");
      await loadResources();
      
      if (onFileChange) {
        onFileChange();
      }
    } catch (error) {
      showError("Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (resource) => {
    if (resource.url) {
      window.open(resource.url, "_blank");
    }
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

  const getFileIcon = (resource) => {
    if (resource.type === "link") return <FaLink />;
    
    switch (resource.file_type) {
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

  if (loading) {
    return (
      <div className="file-manager loading">
        <FaSpinner className="spinner" /> Chargement...
      </div>
    );
  }

  return (
    <div className="file-manager">
      <div className="file-manager-header">
        <h3 className="GTitle">
          {selectedModule ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="btn btn-sm btn-secondary" 
                onClick={() => setSelectedModule(null)}
                style={{ padding: '5px 10px' }}
              >
                <FaArrowLeft /> Retour
              </button>
              {selectedModule}
            </span>
          ) : (
            `Gestion des ${title}`
          )}
        </h3>
        <div className="file-manager-controls">
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedModule(null);
            }}
            className="year-selector"
          >
            {years.map(year => (
              <option key={year.id} value={year.id}>{year.label}</option>
            ))}
          </select>
          
          {!selectedModule && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModule(true)}
            >
              <FaPlus /> Ajouter Module
            </button>
          )}
          
          {selectedModule && (
            <button
              className="btn btn-primary"
              onClick={() => setShowUpload(true)}
            >
              <FaPlus /> Ajouter Ressource
            </button>
          )}
        </div>
      </div>

      {!selectedModule ? (
        // Module List View
        <div className="modules-view">
          {modules.length === 0 ? (
            <div className="no-files">
              <FaFolder size={48} />
              <p>Aucun module trouvé pour {years.find(y => y.id === selectedYear)?.label}</p>
            </div>
          ) : (
            <div className="modules-grid-cards">
              {modulesData.map((module) => (
                <div key={module.name} className="module-display-card">
                  {editingModule === module.name ? (
                    <div className="module-edit-inline">
                      <input
                        type="text"
                        value={editModuleName}
                        onChange={(e) => setEditModuleName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleRenameModule(module.name)}
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleRenameModule(module.name)}
                        >
                          ✓
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setEditingModule(null)}
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div 
<<<<<<< HEAD
                        className="module-display-header"
                        onClick={() => setSelectedModule(module.name)}
                      >
                        <div className="module-display-icon">
                          <FaFolder />
                        </div>
                        <div className="module-display-title">
                          <h5>{module.name}</h5>
                        </div>
=======
                        className="module-info-click"
                        onClick={() => setSelectedModule(moduleName)}
                        style={{ 
                          cursor: 'pointer', 
                          flex: 1,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <FaFolder style={{ color: '#007bff', fontSize: '24px', flexShrink: 0 }} />
                        <span style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {moduleName}
                        </span>
>>>>>>> 6475d5fe4ba9e252b24719c1bd0cbc2b8a560854
                      </div>
                      
                      <div className="module-display-body">
                        <div className="module-display-stat">
                          <FaFile className="stat-icon-display" />
                          <div className="stat-info-display">
                            <span className="stat-label-display">Fichiers</span>
                            <span className="stat-value-display">{module.fileCount}</span>
                          </div>
                        </div>
                        
                        {module.lastFile ? (
                          <div className="module-display-stat">
                            <FaClock className="stat-icon-display" />
                            <div className="stat-info-display">
                              <span className="stat-label-display">Dernier ajout</span>
                              <span className="stat-value-display">{formatDate(module.lastFile.created_at)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="module-display-stat">
                            <FaClock className="stat-icon-display" />
                            <div className="stat-info-display">
                              <span className="stat-label-display">Dernier ajout</span>
                              <span className="stat-value-display">Aucun fichier</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="module-display-footer">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingModule(module.name);
                            setEditModuleName(module.name);
                          }}
                          title="Renommer"
                        >
                          <FaEdit /> Renommer
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModule(module.name);
                          }}
                          title="Supprimer"
                        >
                          <FaTrash /> Supprimer
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Resources List View
        <div className="files-list">
          {resources.length === 0 ? (
            <div className="no-files">
              <FaFile size={48} />
              <p>Aucune ressource trouvée dans ce module</p>
            </div>
          ) : (
            <div className="files-grid">
              {resources.map((resource) => (
                <div key={resource.key} className="file-card">
                  <div className="file-icon">
                    {getFileIcon(resource)}
                  </div>
                  <div className="file-info">
                    <h4 style={{
                      overflow: 'hidden',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.4
                    }}>
                      {resource.description || resource.id}
                    </h4>
                    <p className="file-meta" style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.4
                    }}>
                      {resource.size && <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resource.size}</span>}
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatDate(resource.created_at)}</span>
                    </p>
                    {resource.type === "link" && (
                      <p className="file-url" style={{
                        fontSize: '12px',
                        color: '#666',
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                        marginTop: '4px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {resource.url}
                      </p>
                    )}
                  </div>
                  <div className="file-actions single-view-action">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleDownload(resource)}
                      title={resource.type === "link" ? "Ouvrir le lien" : "Télécharger"}
                    >
                      <FaDownload /> {resource.type === "link" ? "Ouvrir" : "Télécharger"}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteResource(resource)}
                      disabled={deleting === resource.key}
                    >
                      {deleting === resource.key ? (
                        <><FaSpinner className="spinner" /> Suppression...</>
                      ) : (
                        <><FaTrash /> Supprimer</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="upload-modal">
          <div className="upload-modal-content">
            <div className="upload-modal-header">
              <h4>Ajouter un Nouveau Module</h4>
              <button className="close-btn" onClick={() => setShowAddModule(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddModule} className="upload-form">
              <div className="form-group">
                <label>Nom du Module :</label>
                <input
                  type="text"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  placeholder="Ex: Module_gestion_de_produit_et_qualité"
                  required
                />
                <small>Utilisez des underscores (_) au lieu d'espaces</small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModule(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addingModule}
                >
                  {addingModule ? <><FaSpinner className="spinner" /> Ajout...</> : <><FaPlus /> Ajouter</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Resource Modal */}
      {showUpload && (
        <div className="upload-modal">
          <div className="upload-modal-content">
            <div className="upload-modal-header">
              <h4>Ajouter une Ressource</h4>
              <button className="close-btn" onClick={() => setShowUpload(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="upload-form">
              <div className="form-group">
                <label>Type de Ressource :</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                >
                  <option value="file">Fichier</option>
                  <option value="link">Lien</option>
                </select>
              </div>

              {uploadType === "file" ? (
                <div className="form-group">
                  <label>Sélectionner le Fichier :</label>
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files[0] || null)}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>URL du Lien :</label>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
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
                </>
              )}

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
                  {uploading ? (
                    <><FaSpinner className="spinner" /> Téléchargement...</>
                  ) : (
                    <><FaUpload /> Ajouter</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManagerV2;

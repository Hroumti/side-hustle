import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { database } from "../firebase";
import { Context } from "./context";
import { useNotification } from "./NotificationContext";
import LoginRequiredModal from "./LoginRequiredModal";
import { FaFolder, FaFile, FaLink, FaDownload, FaSpinner, FaArrowLeft, FaChevronRight } from "react-icons/fa";
import "./styles/cours.css";

const CoursNew = () => {
  const { year } = useParams(); // Get year from URL
  const navigate = useNavigate();
  const { role } = useContext(Context);
  const { showSuccess, showError } = useNotification();
  
  const [selectedModule, setSelectedModule] = useState(null);
  const [modules, setModules] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(null);

  const years = {
    "3eme": { id: "year3", label: "3ème année", color: "#4CAF50" },
    "4eme": { id: "year4", label: "4ème année", color: "#2196F3" },
    "5eme": { id: "year5", label: "5ème année", color: "#FF9800" }
  };

  const currentYear = year ? years[year] : null;

  useEffect(() => {
    if (year && currentYear) {
      loadModules();
    }
  }, [year]);

  useEffect(() => {
    if (currentYear && selectedModule) {
      loadResources();
    }
  }, [selectedModule]);

  const loadModules = async () => {
    if (!currentYear) return;
    
    setLoading(true);
    try {
      const coursRef = ref(database, `resources/cours/${currentYear.id}`);
      const snapshot = await get(coursRef);
      
      if (snapshot.exists()) {
        setModules(Object.keys(snapshot.val()));
      } else {
        setModules([]);
      }
    } catch (error) {
      showError("Erreur lors du chargement des modules");
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    if (!selectedModule || !currentYear) return;
    
    try {
      const resourcesRef = ref(database, `resources/cours/${currentYear.id}/${selectedModule}`);
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

  const handleDownload = async (resource) => {
    if (!role) {
      setShowLoginModal(true);
      return;
    }

    if (resource.type === "link") {
      window.open(resource.url, "_blank");
      return;
    }

    setDownloadingFile(resource.key);
    try {
      if (resource.url) {
        window.open(resource.url, "_blank");
        showSuccess("Téléchargement démarré");
      }
    } catch (error) {
      showError("Erreur lors du téléchargement");
    } finally {
      setDownloadingFile(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (resource) => {
    if (resource.type === "link") return <FaLink style={{ color: "#2196F3" }} />;
    
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
      default: return <FaFile />;
    }
  };

  // If no year selected, show message
  if (!year || !currentYear) {
    return (
      <section className="cours-container">
        <header className="cours-header">
          <div className="cours-title-section">
            <h1 className="cours-title">Cours</h1>
            <p className="cours-subtitle">Sélectionnez une année dans le menu</p>
          </div>
        </header>
        <div className="cours-status">Veuillez sélectionner une année dans le menu Cours ci-dessus</div>
      </section>
    );
  }

  // Module selection view
  if (!selectedModule) {
    return (
      <section className="cours-container">
        <header className="cours-header">
          <div className="cours-title-section">
            <h1 className="cours-title">{currentYear.label} - Cours</h1>
            <p className="cours-subtitle">Sélectionnez un module</p>
          </div>
        </header>

        {loading ? (
          <div className="cours-status">
            <FaSpinner className="spinner" /> Chargement...
          </div>
        ) : modules.length === 0 ? (
          <div className="cours-status">Aucun module disponible pour cette année</div>
        ) : (
          <div className="modules-grid-view">
            {modules.map(moduleName => (
              <div
                key={moduleName}
                className="module-card-view"
                onClick={() => setSelectedModule(moduleName)}
              >
                <div className="module-icon">
                  <FaFolder size={32} style={{ color: currentYear.color }} />
                </div>
                <h3>{moduleName}</h3>
                <FaChevronRight className="module-arrow" />
              </div>
            ))}
          </div>
        )}

        <LoginRequiredModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          actionType="download"
        />
      </section>
    );
  }

  // Resources view

  return (
    <section className="cours-container">
      <header className="cours-header">
        <div className="cours-title-section">
          <button 
            className="btn-back"
            onClick={() => setSelectedModule(null)}
          >
            <FaArrowLeft /> Retour
          </button>
          <div>
            <h1 className="cours-title">{selectedModule}</h1>
            <p className="cours-subtitle">{currentYear?.label}</p>
          </div>
        </div>
      </header>

      {resources.length === 0 ? (
        <div className="cours-status">Aucune ressource disponible dans ce module</div>
      ) : (
        <div className="cours-grid">
          {resources.map((resource) => (
            <article key={resource.key} className="cours-card">
              <div className="cours-card-header">
                <div className="cours-file-name">
                  {getFileIcon(resource)}
                  <span style={{ marginLeft: 8 }}>
                    {resource.description || resource.id}
                  </span>
                </div>
                <div className={`badge ext-${resource.file_type || 'link'}`}>
                  {resource.type === "link" ? "LINK" : resource.file_type?.toUpperCase()}
                </div>
              </div>
              <div className="cours-card-meta">
                <span>Ajouté: {formatDate(resource.created_at)}</span>
                {resource.size && <span>Taille: {resource.size}</span>}
                {resource.type === "link" && (
                  <span className="link-url">{resource.url}</span>
                )}
              </div>
              <div className="cours-card-actions single-action">
                <button
                  className="btn btn-download"
                  onClick={() => handleDownload(resource)}
                  disabled={downloadingFile === resource.key}
                >
                  {downloadingFile === resource.key ? (
                    <><FaSpinner className="spinner" /> Téléchargement...</>
                  ) : (
                    <><FaDownload /> {resource.type === "link" ? "Ouvrir" : "Télécharger"}</>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        actionType="download"
      />
    </section>
  );
};

export default CoursNew;

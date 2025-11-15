import React, { useState, useEffect, useContext } from "react";
import { ref, get } from "firebase/database";
import { database } from "../firebase";
import { Context } from "./context";
import { useNotification } from "./NotificationContext";
import LoginRequiredModal from "./LoginRequiredModal";
import { FaFolder, FaFile, FaLink, FaDownload, FaSpinner, FaArrowLeft, FaChevronRight } from "react-icons/fa";
import "./styles/cours.css";

const TdNew = () => {
  const { role } = useContext(Context);
  const { showSuccess, showError } = useNotification();
  
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [modules, setModules] = useState({ year3: [], year4: [], year5: [] });
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(null);

  const years = [
    { id: "year3", label: "3ème année", color: "#9C27B0" },
    { id: "year4", label: "4ème année", color: "#E91E63" },
    { id: "year5", label: "5ème année", color: "#F44336" }
  ];

  useEffect(() => {
    loadAllModules();
  }, []);

  useEffect(() => {
    if (selectedYear && selectedModule) {
      loadResources();
    }
  }, [selectedYear, selectedModule]);

  const loadAllModules = async () => {
    setLoading(true);
    try {
      const modulesData = { year3: [], year4: [], year5: [] };
      
      for (const year of ["year3", "year4", "year5"]) {
        const tdRef = ref(database, `resources/td/${year}`);
        const snapshot = await get(tdRef);
        
        if (snapshot.exists()) {
          // Filter out "autre ressources pédagogiques" for TDs
          const allModules = Object.keys(snapshot.val());
          modulesData[year] = allModules.filter(
            module => !module.toLowerCase().includes('autre')
          );
        }
      }
      
      setModules(modulesData);
    } catch (error) {
      showError("Erreur lors du chargement des modules");
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    if (!selectedModule) return;
    
    try {
      const resourcesRef = ref(database, `resources/td/${selectedYear}/${selectedModule}`);
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
    if (resource.type === "link") return <FaLink style={{ color: "#E91E63" }} />;
    
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

  // Year selection view
  if (!selectedYear) {
    return (
      <section className="cours-container">
        <header className="cours-header">
          <div className="cours-title-section">
            <h1 className="cours-title">Travaux Dirigés (TDs)</h1>
            <p className="cours-subtitle">Sélectionnez votre année</p>
          </div>
        </header>

        {loading ? (
          <div className="cours-status">
            <FaSpinner className="spinner" /> Chargement...
          </div>
        ) : (
          <div className="years-grid">
            {years.map(year => (
              <div
                key={year.id}
                className="year-card"
                onClick={() => setSelectedYear(year.id)}
                style={{ borderColor: year.color }}
              >
                <div className="year-icon" style={{ background: year.color }}>
                  <FaFolder size={40} />
                </div>
                <h3>{year.label}</h3>
                <p>{modules[year.id].length} modules</p>
                <FaChevronRight className="year-arrow" />
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

  // Module selection view
  if (!selectedModule) {
    const currentYear = years.find(y => y.id === selectedYear);
    const yearModules = modules[selectedYear] || [];

    return (
      <section className="cours-container">
        <header className="cours-header">
          <div className="cours-title-section">
            <button 
              className="btn-back"
              onClick={() => setSelectedYear(null)}
            >
              <FaArrowLeft /> Retour
            </button>
            <div>
              <h1 className="cours-title">{currentYear?.label} - TDs</h1>
              <p className="cours-subtitle">Sélectionnez un module</p>
            </div>
          </div>
        </header>

        {yearModules.length === 0 ? (
          <div className="cours-status">Aucun module disponible pour cette année</div>
        ) : (
          <div className="modules-grid-view">
            {yearModules.map(moduleName => (
              <div
                key={moduleName}
                className="module-card-view"
                onClick={() => setSelectedModule(moduleName)}
              >
                <div className="module-icon">
                  <FaFolder size={32} style={{ color: currentYear?.color }} />
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
  const currentYear = years.find(y => y.id === selectedYear);

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
            <p className="cours-subtitle">{currentYear?.label} - TDs</p>
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

export default TdNew;

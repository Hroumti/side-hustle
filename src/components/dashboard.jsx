import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaBook, FaFileAlt, FaChartBar, FaCog, FaSignOutAlt, FaHome, FaUpload, FaUserPlus } from "react-icons/fa";
import { Context } from "./context";
import FileManager from "./FileManager";
import UserManager from "./UserManager";
import "./styles/dashboard.css";

const Dashboard = () => {
  const { logout } = useContext(Context);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    { id: 'courses', label: 'Cours', icon: <FaBook /> },
    { id: 'tds', label: 'TDs', icon: <FaFileAlt /> },
    { id: 'users', label: 'Utilisateurs', icon: <FaUsers /> }
  ];


  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return <FileManager type="cours" title="Cours" />;
      case 'tds':
        return <FileManager type="td" title="TD" />;
      case 'users':
        return <UserManager />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Tableau de Bord Admin</h1>
          <p>Bienvenue, Administrateur</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            <FaHome /> Accueil
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            <FaSignOutAlt /> Déconnexion
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Dashboard;

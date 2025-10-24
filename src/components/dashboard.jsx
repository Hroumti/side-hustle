import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaBook, FaFileAlt, FaChartBar, FaCog, FaSignOutAlt, FaHome, FaUpload, FaUserPlus } from "react-icons/fa";
import Context from "./context";
import FileManager from "./FileManager";
import UserManager from "./UserManager";
import "./styles/dashboard.css";

const Dashboard = () => {
  const { role, logout } = useContext(Context);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not admin
  React.useEffect(() => {
    if (role !== 'admin') {
      navigate('/login');
    }
  }, [role, navigate]);

  // Don't render if not admin
  if (role !== 'admin') {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaChartBar /> },
    { id: 'courses', label: 'Courses', icon: <FaBook /> },
    { id: 'tds', label: 'TDs', icon: <FaFileAlt /> },
    { id: 'users', label: 'Users', icon: <FaUsers /> }
  ];

  const dashboardStats = [
    {
      title: "Total Students",
      value: "1,250",
      icon: <FaUsers />,
      color: "blue"
    },
    {
      title: "Active Courses",
      value: "15",
      icon: <FaBook />,
      color: "green"
    },
    {
      title: "TD Assignments",
      value: "45",
      icon: <FaFileAlt />,
      color: "orange"
    },
    {
      title: "System Health",
      value: "98%",
      icon: <FaChartBar />,
      color: "purple"
    }
  ];

  const recentActivities = [
    { id: 1, action: "New course uploaded", time: "2 hours ago", type: "course" },
    { id: 2, action: "Student registered", time: "4 hours ago", type: "user" },
    { id: 3, action: "TD assignment updated", time: "6 hours ago", type: "assignment" },
    { id: 4, action: "System backup completed", time: "1 day ago", type: "system" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <div className="dashboard-stats">
              {dashboardStats.map((stat, index) => (
                <div key={index} className={`stat-card ${stat.color}`}>
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-content">
                    <h3>{stat.value}</h3>
                    <p>{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="dashboard-content">
              <div className="dashboard-section">
                <h2>Quick Actions</h2>
                <div className="quick-actions">
                  <button className="action-card" onClick={() => setActiveTab('courses')}>
                    <FaBook />
                    <span>Manage Courses</span>
                  </button>
                  <button className="action-card" onClick={() => setActiveTab('tds')}>
                    <FaFileAlt />
                    <span>Manage TDs</span>
                  </button>
                  <button className="action-card" onClick={() => setActiveTab('users')}>
                    <FaUsers />
                    <span>Manage Users</span>
                  </button>
                  <button className="action-card">
                    <FaCog />
                    <span>System Settings</span>
                  </button>
                </div>
              </div>

              <div className="dashboard-section">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-icon ${activity.type}`}>
                        {activity.type === 'course' && <FaBook />}
                        {activity.type === 'user' && <FaUsers />}
                        {activity.type === 'assignment' && <FaFileAlt />}
                        {activity.type === 'system' && <FaCog />}
                      </div>
                      <div className="activity-content">
                        <p>{activity.action}</p>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
      case 'courses':
        return <FileManager type="cours" title="Course" />;
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
          <h1>Admin Dashboard</h1>
          <p>Welcome back, Administrator</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            <FaHome /> View Site
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
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

import React, { useState, useEffect } from "react";
import { FaUserPlus, FaTrash, FaEdit, FaEye, FaEyeSlash, FaSave, FaTimes } from "react-icons/fa";
import { userOperations } from "../utils/fileOperations";
import { useNotification } from "./NotificationContext";
import "./styles/UserManager.css";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { showSuccess, showError } = useNotification();
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "student",
    year: "1ere"
  });

  const years = ["1ere", "2eme", "3eme", "4eme", "5eme"];
  const roles = [
    { value: "student", label: "Student" },
    { value: "admin", label: "Admin" }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const loadedUsers = userOperations.getUsers();
    setUsers(loadedUsers);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    
    try {
      const user = userOperations.addUser(newUser);
      setUsers(prev => [...prev, user]);
      
      // Reset form
      setNewUser({
        username: "",
        password: "",
        role: "student",
        year: "1ere"
      });
      setShowAddUser(false);
      
      showSuccess("Utilisateur créé avec succès !");
    } catch (error) {
      showError(error.message);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;

    try {
      const updatedUser = userOperations.updateUser(editingUser.id, editingUser);
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? updatedUser : user
      ));
      setEditingUser(null);
      
      showSuccess("Utilisateur mis à jour avec succès !");
    } catch (error) {
      showError(error.message);
    }
  };

  const handleDeleteUser = (userId) => {
    try {
      userOperations.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      showSuccess("Utilisateur supprimé avec succès !");
    } catch (error) {
      showError(error.message);
    }
  };

  const toggleUserStatus = (userId) => {
    try {
      const updatedUser = userOperations.toggleUserStatus(userId);
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
    } catch (error) {
      showError(error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="user-manager">
      <div className="user-manager-header">
        <h3>Gestion des Utilisateurs</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddUser(true)}
        >
          <FaUserPlus /> Ajouter Utilisateur
        </button>
      </div>

      {showAddUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Ajouter Nouvel Utilisateur</h4>
              <button 
                className="close-btn"
                onClick={() => setShowAddUser(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom d'utilisateur :</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mot de passe :</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Rôle :</label>
                  <select 
                    value={newUser.role} 
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label === 'Student' ? 'Étudiant' : 'Admin'}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Année :</label>
                  <select 
                    value={newUser.year} 
                    onChange={(e) => setNewUser({...newUser, year: e.target.value})}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year} année</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddUser(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaUserPlus /> Ajouter Utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Modifier Utilisateur</h4>
              <button 
                className="close-btn"
                onClick={() => setEditingUser(null)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom d'utilisateur :</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mot de passe :</label>
                  <input
                    type="password"
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Rôle :</label>
                  <select 
                    value={editingUser.role} 
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label === 'Student' ? 'Étudiant' : 'Admin'}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Année :</label>
                  <select 
                    value={editingUser.year} 
                    onChange={(e) => setEditingUser({...editingUser, year: e.target.value})}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year} année</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                >
                  <FaSave /> Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Nom d'utilisateur</th>
              <th>Rôle</th>
              <th>Année</th>
              <th>Statut</th>
              <th>Créé</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? 'Admin' : 'Étudiant'}
                  </span>
                </td>
                <td>{user.year}</td>
                <td>
                  <button
                    className={`status-btn ${user.isActive ? 'active' : 'inactive'}`}
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.isActive ? <FaEye /> : <FaEyeSlash />}
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => handleEditUser(user)}
                      title="Modifier"
                    >
                      <FaEdit /> Modifier
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Supprimer"
                    >
                      <FaTrash /> Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;

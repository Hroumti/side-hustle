import React, { useState, useEffect } from "react";
import { FaUserPlus, FaTrash, FaEdit, FaEye, FaEyeSlash, FaSave, FaTimes, FaUser, FaLock } from "react-icons/fa";
import { dbUtils } from "../utils/db-utils"; // Assumes dbUtils exists for RTDB operations
import { useNotification } from "./NotificationContext"; // Assumes NotificationContext exists
import "./styles/UserManager.css";

// --- Helper Functions ---

// Simple date formatting (optional, but good for display)
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// --- Confirmation Modal Component (Inline for single-file mandate) ---
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onCancel}>×</button>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onCancel}>Annuler</button>
                    <button className="btn btn-danger" onClick={onConfirm}>Confirmer</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---

const UserManager = () => {
  // Array of user objects fetched from RTDB
  const [users, setUsers] = useState([]); 
  // State for the Add/Edit Modal
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  // User data currently being edited or added (null means 'Add')
  const [editingUser, setEditingUser] = useState(null); 
  // Separate state for password input (only for Add/Change)
  const [passwordInput, setPasswordInput] = useState(''); 
  // State for delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [userToDeleteUid, setUserToDeleteUid] = useState(null);

  // Notification context hook
  const { showSuccess, showError } = useNotification();
  
  // Static lists
  const years = ["3eme", "4eme", "5eme"];
  const roles = [
    { value: "student", label: "Étudiant" },
    { value: "admin", label: "Admin" }
  ];

  // --- Real-time Data Fetching (RTDB) ---
  useEffect(() => {
    let unsubscribe = null;
    
    // Wait a bit to ensure Firebase Auth is ready before subscribing
    const timer = setTimeout(() => {
      // dbUtils.onUsersChange subscribes to RTDB and calls the callback whenever data changes
      unsubscribe = dbUtils.onUsersChange((fetchedUsers) => {
        // The callback receives an array of user objects with RTDB UID as 'uid'
        setUsers(fetchedUsers);
      }, (error) => {
        showError("Erreur de chargement des utilisateurs.");
        console.error("RTDB Users Fetch Error:", error);
        // If permission denied, show helpful message
        if (error.message?.includes('permission') || error.message?.includes('PERMISSION_DENIED')) {
          console.error('Permission denied. Make sure you are authenticated and anonymous auth is enabled.');
        }
      });
    }, 500); // Small delay to ensure auth is ready

    return () => {
      clearTimeout(timer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // --- Handlers for Add/Edit Modal ---

  const handleAddNewUser = () => {
    setEditingUser({
      username: "",
      role: "student",
      year: "3eme",
      created_at: new Date()
    });
    setPasswordInput(''); // Clear password field
    setShowAddEditModal(true);
  };

  const handleEditUser = (user) => {
    // FIX 2: Explicitly set the fields including UID to prevent state loss
    setEditingUser({
        uid: user.uid, 
        username: user.username,
        role: user.role,
        year: user.year,
        // Copy other potential properties if they exist, but keep it minimal
        isActive: user.isActive,
    }); 
    setPasswordInput(''); 
    setShowAddEditModal(true);
  };

  const handleModalClose = () => {
    setShowAddEditModal(false);
    setEditingUser(null);
    setPasswordInput('');
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Check if the input is the password field (managed separately)
    if (name === 'password') {
        setPasswordInput(value);
    } else {
        setEditingUser(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    
    if (!editingUser.username) {
        showError("Veuillez remplir le champ Nom d'utilisateur.");
        return;
    }

    const isNewUser = !editingUser.uid;
    
    // Check if password is required for new user
    if (isNewUser && !passwordInput) {
        showError("Le mot de passe est obligatoire pour un nouvel utilisateur.");
        return;
    }
    
    // Check if password is required for existing user who tries to change it
    if (!isNewUser && passwordInput.length > 0 && passwordInput.length < 3) {
        showError("Le mot de passe doit contenir au moins 3 caractères.");
        return;
    }

    // FIX 1: Use destructuring to safely separate the uid from the payload.
    // This is the CRITICAL fix that prevents the '...uid: undefined' update error
    // and ensures the update path is taken when uid exists.
    const { uid, ...restOfUser } = editingUser;

    // Prepare user object for database operation
    const userData = {
        ...restOfUser,
        username: dbUtils.sanitizeInput(restOfUser.username),
        rawPassword: passwordInput, 
        // Ensure year is set to empty string if role is admin
        year: restOfUser.role === 'student' ? restOfUser.year : '',
    };

    try {
        if (isNewUser) {
            // Check for existing username only when ADDING
            const existing = users.find(u => u.username.toLowerCase() === userData.username.toLowerCase());
            if (existing) {
                showError("Ce nom d'utilisateur existe déjà.");
                return;
            }
            // Add user
            await dbUtils.addUser(userData);
            showSuccess("Utilisateur ajouté avec succès !");
        } else {
            // Update user: use the extracted 'uid' and the 'userData' payload without the 'uid' field.
            if (!uid) {
                showError("Erreur interne: UID d'utilisateur manquant pour la mise à jour.");
                return;
            }
            await dbUtils.updateUser(uid, userData);
            showSuccess("Utilisateur mis à jour avec succès !");
        }

        handleModalClose();
    } catch (error) {
        showError(`Erreur lors de la sauvegarde : ${error.message || 'Veuillez réessayer.'}`);
        console.error("Error saving user:", error);
    }
  };


  // --- Handlers for User Actions (Toggle Status, Delete) ---

  const toggleUserStatus = async (uid, currentStatus) => {
    try {
        await dbUtils.toggleUserStatus(uid, !currentStatus);
        showSuccess(`Statut de l'utilisateur basculé sur ${!currentStatus ? 'Actif' : 'Inactif'}.`);
    } catch (error) {
        showError("Erreur lors du changement de statut.");
        console.error("Error toggling status:", error);
    }
  };
  
  const handleDeleteUser = (uid) => {
      // FIX 3: Simplified check for a truthy UID.
      if (uid) {
          setUserToDeleteUid(uid);
          setConfirmDelete(true);
      } else {
          showError("UID invalide. Impossible de supprimer.");
      }
  };
  
  const confirmDeleteAction = async () => {
      // FIX 3: Check if UID is present before attempting deletion
      if (!userToDeleteUid) {
          showError("Erreur: UID de l'utilisateur à supprimer est manquant.");
          cancelDeleteAction();
          return;
      }
      
      try {
          await dbUtils.deleteUser(userToDeleteUid);
          showSuccess("Utilisateur supprimé avec succès.");
      } catch (error) {
          showError(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
          console.error("Error deleting user:", error);
      } finally {
          setConfirmDelete(false);
          setUserToDeleteUid(null);
      }
  };
  
  const cancelDeleteAction = () => {
      setConfirmDelete(false);
      setUserToDeleteUid(null);
  };


  return (
    <div className="user-manager-container">
      <header className="user-manager-header">
        <h1>Gestion des Utilisateurs</h1>
        <button 
            className="btn btn-primary"
            onClick={handleAddNewUser}
        >
          <FaUserPlus /> Ajouter un Utilisateur
        </button>
      </header>

      {/* Main User Table */}
      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Nom d'utilisateur</th>
              <th>Rôle</th>
              <th>Année</th>
              <th>Statut</th>
              <th>Date de création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.uid}>
                <td>{user.username}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? 'Admin' : 'Étudiant'}
                  </span>
                </td>
                <td>{user.year || 'N/A'}</td>
                <td>
                  <button
                    className={`status-btn ${user.isActive ? 'active' : 'inactive'}`}
                    onClick={() => toggleUserStatus(user.uid, user.isActive)}
                    title={user.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {user.isActive ? <FaEye /> : <FaEyeSlash />}
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td>{formatDate(user.created_at)}</td>
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
                      onClick={() => handleDeleteUser(user.uid)}
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
        {users.length === 0 && (
            <div className="no-users-message">
                Aucun utilisateur trouvé.
            </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showAddEditModal && editingUser && (
        <div className="modal-overlay" onClick={handleModalClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editingUser.uid ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}</h2>
                    <button className="modal-close" onClick={handleModalClose}><FaTimes /></button>
                </div>
                <form onSubmit={handleSaveUser}>
                    <div className="modal-body">
                        
                        {/* Username */}
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                name="username"
                                placeholder="Nom d'utilisateur"
                                required
                                value={editingUser.username}
                                onChange={handleInputChange}
                                // Prevent changing username for existing users (RTDB key)
                                disabled={!!editingUser.uid} 
                                maxLength="20"
                            />
                        </div>

                        {/* Password (Required for Add, Optional for Edit) */}
                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                name="password"
                                placeholder={editingUser.uid ? 'Nouveau Mot de Passe (laisser vide pour ne pas changer)' : 'Mot de Passe (obligatoire)'}
                                value={passwordInput}
                                onChange={handleInputChange}
                                minLength="3"
                                required={!editingUser.uid}
                                autoComplete="new-password"
                            />
                        </div>
                        
                        {/* Role Selector */}
                        <div className="input-group select-group">
                            <label>Rôle</label>
                            <select
                                name="role"
                                value={editingUser.role}
                                onChange={handleInputChange}
                                required
                            >
                                {roles.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Year Selector (Only for students) */}
                        {editingUser.role === 'student' && (
                            <div className="input-group select-group">
                                <label>Année</label>
                                <select
                                    name="year"
                                    value={editingUser.year}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleModalClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <FaSave /> {editingUser.uid ? 'Enregistrer' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
          isOpen={confirmDelete}
          title="Confirmer la suppression"
          message={`Êtes-vous sûr de vouloir supprimer l'utilisateur avec l'UID : ${userToDeleteUid || '???'}. Cette action est irréversible.`}
          onConfirm={confirmDeleteAction}
          onCancel={cancelDeleteAction}
      />
    </div>
  );
};

export default UserManager;
import React, { useState, useEffect } from "react";
import { FaUserPlus, FaTrash, FaEdit, FaEye, FaEyeSlash, FaSave, FaTimes } from "react-icons/fa";
import { userOperations } from "../utils/fileOperations";
import "./styles/UserManager.css";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "student",
    fullName: "",
    email: "",
    year: "3eme"
  });

  const years = ["3eme", "4eme", "5eme"];
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
        fullName: "",
        email: "",
        year: "3eme"
      });
      setShowAddUser(false);
      
      alert("User created successfully!");
    } catch (error) {
      alert(error.message);
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
      
      alert("User updated successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      userOperations.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      alert("User deleted successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleUserStatus = (userId) => {
    try {
      const updatedUser = userOperations.toggleUserStatus(userId);
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
    } catch (error) {
      alert(error.message);
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
        <h3>User Management</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddUser(true)}
        >
          <FaUserPlus /> Add User
        </button>
      </div>

      {showAddUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Add New User</h4>
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
                  <label>Username:</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password:</label>
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
                  <label>Full Name:</label>
                  <input
                    type="text"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Role:</label>
                  <select 
                    value={newUser.role} 
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year:</label>
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
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaUserPlus /> Add User
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
              <h4>Edit User</h4>
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
                  <label>Username:</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password:</label>
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
                  <label>Full Name:</label>
                  <input
                    type="text"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Role:</label>
                  <select 
                    value={editingUser.role} 
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year:</label>
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
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                >
                  <FaSave /> Save Changes
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
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Year</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.year}</td>
                <td>
                  <button
                    className={`status-btn ${user.isActive ? 'active' : 'inactive'}`}
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.isActive ? <FaEye /> : <FaEyeSlash />}
                    {user.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => handleEditUser(user)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete"
                    >
                      <FaTrash />
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

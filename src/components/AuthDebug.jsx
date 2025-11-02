import React, { useContext } from 'react';
import { Context } from './context';

// Debug component to show authentication state
const AuthDebug = () => {
  const { role, currentUser, isLoading, isAuthenticated, isAdmin } = useContext(Context);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '200px'
    }}>
      <div><strong>Auth Debug:</strong></div>
      <div>Role: {role || 'null'}</div>
      <div>Loading: {isLoading ? 'true' : 'false'}</div>
      <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <div>Is Admin: {isAdmin ? 'true' : 'false'}</div>
      <div>User: {currentUser ? currentUser.username : 'null'}</div>
      <div>LocalStorage Role: {localStorage.getItem('encg_user_role') || 'null'}</div>
    </div>
  );
};

export default AuthDebug;
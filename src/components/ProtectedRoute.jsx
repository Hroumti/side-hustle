import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Context } from './context';

const ProtectedRoute = ({ children, requireAdmin = false, requireLogin = true }) => {
  const { role } = useContext(Context);
  
  if (requireLogin && !role) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  if (!requireLogin && role) {
    if (role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;

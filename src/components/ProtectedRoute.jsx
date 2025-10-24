import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Context } from './context';

const ProtectedRoute = ({ children, requireAdmin = false, requireLogin = true }) => {
  const { role } = useContext(Context);
  
  // If login is required but user is not logged in
  if (requireLogin && !role) {
    return <Navigate to="/login" replace />;
  }
  
  // If admin access is required but user is not admin
  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  // If user is logged in but trying to access login page, redirect to appropriate page
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

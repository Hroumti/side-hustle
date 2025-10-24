import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Context } from './context';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { role } = useContext(Context);
  
  // Check if user is logged in
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if admin access is required
  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;

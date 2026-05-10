import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // If there is no logged in user, kick them to the auth page
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // Otherwise, allow them to view the protected route
  return children;
};

export default ProtectedRoute;

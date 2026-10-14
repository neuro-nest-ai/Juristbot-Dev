import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth() || {}; 
  const isAuthenticated = !!localStorage.getItem('authToken'); 

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/chat" />;
  }

  return children;
};

export default PrivateRoute;

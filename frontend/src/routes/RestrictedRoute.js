import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RestrictedRoute = ({ children }) => {
  const { authState } = useAuth();

  // If the user is authenticated, redirect to the profile or homepage
  return authState.isAuthenticated ? <Navigate to="/feed" /> : children;
};

export default RestrictedRoute;

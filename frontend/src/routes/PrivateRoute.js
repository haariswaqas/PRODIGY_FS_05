import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({children}) => {
  const { authState } = useAuth();



  return authState.isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;

import React, { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AdminRoute = ({ children }: PropsWithChildren<{}>): JSX.Element => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

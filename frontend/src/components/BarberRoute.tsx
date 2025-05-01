import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface BarberRouteProps {
  children: React.ReactNode;
}

export const BarberRoute: React.FC<BarberRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role !== 'barber') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

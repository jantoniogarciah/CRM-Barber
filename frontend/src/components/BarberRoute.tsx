import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';

interface BarberRouteProps {
  children: React.ReactNode;
}

export const BarberRoute: React.FC<BarberRouteProps> = ({ children }) => {
  const user = useAppSelector(selectUser);

  if (!user || user.role !== 'BARBER') {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';

interface BarberRouteProps {
  children: React.ReactNode;
}

export const BarberRoute: React.FC<BarberRouteProps> = ({ children }) => {
  const user = useAppSelector(selectUser);
  const userRole = user?.role?.toUpperCase();

  if (!user || (userRole !== 'BARBER' && userRole !== 'ADMIN' && userRole !== 'ADMINBARBER')) {
    toast.error('No tienes permisos para acceder a esta página');
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

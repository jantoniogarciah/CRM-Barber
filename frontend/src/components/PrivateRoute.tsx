import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';

type PrivateRouteProps = {
  children: React.ReactNode;
};

export const PrivateRoute = ({ children }: PrivateRouteProps): JSX.Element => {
  const user = useAppSelector(selectUser);
  const location = useLocation();

  if (!user) {
    // Only show toast if not on login page
    if (location.pathname !== '/login') {
      toast.error('Por favor inicia sesión para acceder a esta página');
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

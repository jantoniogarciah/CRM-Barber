import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import { Box, CircularProgress, Typography } from '@mui/material';

type AdminBarberRouteProps = {
  children: React.ReactNode;
};

export const AdminBarberRoute = ({ children }: AdminBarberRouteProps): JSX.Element => {
  const user = useAppSelector(selectUser);
  const location = useLocation();
  const storedUser = localStorage.getItem('user');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    console.log('AdminBarberRoute - Component mounted');
    console.log('AdminBarberRoute - Redux user:', user);
    console.log('AdminBarberRoute - Stored user:', storedUser);
    console.log('AdminBarberRoute - Current location:', location);
    console.log('AdminBarberRoute - Local Storage:', {
      token: !!localStorage.getItem('token'),
      user: !!localStorage.getItem('user'),
    });

    // Dar tiempo para que se inicialice el estado
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, location, storedUser]);

  // Durante la inicialización, mostrar pantalla de carga
  if (isInitializing) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Verificando permisos...</Typography>
      </Box>
    );
  }

  // Si no hay usuario en Redux ni en localStorage, redirigir al login
  if (!user && !storedUser) {
    console.log('AdminBarberRoute - No user found in Redux or localStorage');
    if (location.pathname !== '/login') {
      toast.error('Por favor inicia sesión para acceder a esta página');
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay usuario en localStorage pero no en Redux, mostrar pantalla de carga
  if (!user && storedUser) {
    console.log(
      'AdminBarberRoute - User found in localStorage but not in Redux, waiting for initialization...'
    );
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Cargando datos de usuario...</Typography>
      </Box>
    );
  }

  // Verificar el rol del usuario
  const userRole = user?.role?.toUpperCase();
  console.log('AdminBarberRoute - User role:', userRole);
  console.log('AdminBarberRoute - Full user object:', user);

  if (userRole !== 'ADMIN' && userRole !== 'BARBER') {
    console.log('AdminBarberRoute - User is not admin or barber');
    toast.error('No tienes permisos para acceder a esta página');
    return <Navigate to="/" replace />;
  }

  console.log('AdminBarberRoute - Access granted, rendering children');
  return <>{children}</>;
}; 
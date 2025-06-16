import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials, clearCredentials, selectUser } from '../store/slices/authSlice';
import { useGetCurrentUserQuery } from '../services/api';
import { CircularProgress, Box } from '@mui/material';
import { toast } from 'react-hot-toast';

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector(selectUser);
  const [isInitializing, setIsInitializing] = useState(true);
  const storedToken = localStorage.getItem('token');
  
  const { data: currentUser, error } = useGetCurrentUserQuery(undefined, {
    skip: !storedToken || !!reduxUser,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (!reduxUser && storedUser && storedToken) {
          const user = JSON.parse(storedUser);
          if (user && user.role) {
            user.role = user.role.toUpperCase();
            dispatch(
              setCredentials({
                user,
                token: storedToken,
              })
            );
          } else {
            throw new Error('Invalid user data in localStorage');
          }
        }
      } catch (error) {
        console.error('Error restoring user from localStorage:', error);
        handleAuthError('Error al restaurar la sesión');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch, reduxUser]);

  useEffect(() => {
    if (error) {
      console.error('Error fetching current user:', error);
      handleAuthError('Error al verificar la sesión actual');
    } else if (currentUser) {
      const token = localStorage.getItem('token');
      if (token) {
        dispatch(
          setCredentials({
            user: {
              ...currentUser,
              role: currentUser.role?.toUpperCase(),
            },
            token,
          })
        );
      } else {
        handleAuthError('Token no encontrado');
      }
    }
  }, [currentUser, error, dispatch]);

  const handleAuthError = (message: string) => {
    // Limpiar datos de autenticación
    localStorage.clear();
    sessionStorage.clear();
    dispatch(clearCredentials());

    // Solo mostrar mensaje y redirigir si no estamos en la página de login
    if (window.location.pathname !== '/login') {
      toast.error(message);
      window.location.href = '/login';
    }
  };

  if (isInitializing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;

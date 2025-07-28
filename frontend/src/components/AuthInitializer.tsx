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

        console.log('AuthInitializer - Starting initialization');
        console.log('AuthInitializer - Stored token:', storedToken ? 'exists' : 'not found');
        console.log('AuthInitializer - Stored user:', storedUser);

        if (!reduxUser && storedUser && storedToken) {
          const user = JSON.parse(storedUser);
          console.log('AuthInitializer - Parsed stored user:', user);
          console.log('AuthInitializer - Original role:', user.role);

          if (user && user.role) {
            // Asegurarse de que el rol esté en mayúsculas
            user.role = user.role.toUpperCase();
            console.log('AuthInitializer - Normalized role:', user.role);

            dispatch(
              setCredentials({
                user,
                token: storedToken,
              })
            );
            console.log('AuthInitializer - User restored to Redux:', user);
          } else {
            throw new Error('Invalid user data in localStorage');
          }
        } else {
          console.log('AuthInitializer - No stored user or already in Redux');
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
      console.log('AuthInitializer - Current user from API:', currentUser);
      console.log('AuthInitializer - Original role from API:', currentUser.role);

      const token = localStorage.getItem('token');
      if (token) {
        // Asegurarse de que el rol esté en mayúsculas
        const normalizedUser = {
          ...currentUser,
          role: currentUser.role?.toUpperCase(),
        };
        console.log('AuthInitializer - Normalized user:', normalizedUser);

        dispatch(
          setCredentials({
            user: normalizedUser,
            token,
          })
        );
        console.log('AuthInitializer - User set in Redux:', normalizedUser);
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
    const isLoginPage = window.location.pathname === '/login';
    if (!isLoginPage) {
      toast.error(message);
      window.location.replace('/login');
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

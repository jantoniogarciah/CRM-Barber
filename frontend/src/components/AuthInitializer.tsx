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
  const { data: currentUser, error } = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem('token') || !!reduxUser,
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
          }
        }
      } catch (error) {
        console.error('Error restoring user from localStorage:', error);
        handleAuthError();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch, reduxUser]);

  useEffect(() => {
    if (error) {
      console.error('Error fetching current user:', error);
      handleAuthError();
    } else if (currentUser) {
      const token = localStorage.getItem('token');
      if (token) {
        dispatch(
          setCredentials({
            user: currentUser,
            token,
          })
        );
      }
    }
  }, [currentUser, error, dispatch]);

  const handleAuthError = () => {
    localStorage.clear();
    sessionStorage.clear();
    dispatch(clearCredentials());
    toast.error('Error al restaurar la sesión. Por favor, inicia sesión nuevamente.');
    window.location.href = '/login';
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

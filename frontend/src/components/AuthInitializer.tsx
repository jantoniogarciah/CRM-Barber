import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials, selectUser } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector(selectUser);

  useEffect(() => {
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
      localStorage.clear();
      sessionStorage.clear();
      toast.error('Error al restaurar la sesión. Por favor, inicia sesión nuevamente.');
      window.location.href = '/login';
    }
  }, [dispatch, reduxUser]);

  return <>{children}</>;
};

export default AuthInitializer;

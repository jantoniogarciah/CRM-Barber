import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setCredentials,
  clearCredentials,
  selectUser,
  selectLoading,
} from '../store/slices/authSlice';
import { useLoginMutation, useLogoutMutation, useGetCurrentUserQuery } from '../services/api';
import { User } from '../types';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectLoading);
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const { data: currentUser, error: currentUserError } = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem('token'),
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (currentUser && token) {
      dispatch(setCredentials({ user: currentUser, token }));
    } else if (currentUserError) {
      console.error('Error fetching current user:', currentUserError);
      localStorage.removeItem('token');
      dispatch(clearCredentials());
    }
  }, [currentUser, currentUserError, dispatch]);

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation({ email, password }).unwrap();
      if (result.token) {
        localStorage.setItem('token', result.token);
        dispatch(setCredentials({ user: result.user, token: result.token }));
        navigate('/');
        toast.success('Inicio de sesión exitoso');
      } else {
        throw new Error('No se recibió el token de autenticación');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      dispatch(clearCredentials());
      toast.error(error.data?.message || 'Error al iniciar sesión');
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.warn('Logout endpoint error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch(clearCredentials());
      navigate('/login');
      toast.success('Sesión cerrada exitosamente');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user && !!localStorage.getItem('token'),
        isLoading,
        user,
        login,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials, clearCredentials, selectUser, selectLoading } from '../store/slices/authSlice';
import { useLoginMutation, useLogoutMutation, useGetCurrentUserQuery } from '../services/api';
import { User } from '../types';

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
  const { data: currentUser } = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem('token'),
  });

  useEffect(() => {
    if (currentUser) {
      dispatch(setCredentials({ user: currentUser, token: localStorage.getItem('token') || '' }));
    }
  }, [currentUser, dispatch]);

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation({ email, password }).unwrap();
      localStorage.setItem('token', result.token);
      dispatch(setCredentials({ user: result.user, token: result.token }));
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      localStorage.removeItem('token');
      dispatch(clearCredentials());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

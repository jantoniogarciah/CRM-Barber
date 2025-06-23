import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { RootState } from '../../store';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const { user, token } = action.payload;
      
      // Normalize role to uppercase
      const normalizedUser = {
        ...user,
        role: user.role?.toUpperCase(),
      };
      
      // Update state
      state.user = normalizedUser;
      state.token = token;
      state.error = null;
      
      // Save to localStorage
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        console.log('Credentials saved to localStorage:', { user: normalizedUser, token });
      } catch (error) {
        console.error('Error saving credentials to localStorage:', error);
      }
    },
    clearCredentials: (state) => {
      // Clear state
      state.user = null;
      state.token = null;
      state.error = null;
      
      // Clear storage
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
        console.log('Credentials cleared from storage');
      } catch (error) {
        console.error('Error clearing credentials from storage:', error);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      
      if (action.payload) {
        console.error('Auth error:', action.payload);
      }
    },
  },
});

export const { setCredentials, clearCredentials, setLoading, setError } = authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectLoading = (state: RootState) => state.auth.loading;
export const selectError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) => Boolean(state.auth.token && state.auth.user);

export default authSlice.reducer;

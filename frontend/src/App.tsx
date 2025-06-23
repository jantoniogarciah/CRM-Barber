import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { SnackbarProvider } from 'notistack';
import { Toaster } from 'react-hot-toast';
import { Box, useMediaQuery } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import AppRoutes from './router';
import AuthInitializer from './components/AuthInitializer';
import { useOrientation } from './hooks/useOrientation';
import { useAppDispatch } from './store/hooks';
import { setCredentials } from './store/slices/authSlice';

const AppContent: React.FC = () => {
  const orientation = useOrientation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  const dispatch = useAppDispatch();

  const getRotationStyles = () => {
    if (!isMobile || !isPWA) return {};

    if (orientation === 'landscape') {
      return {
        transform: 'rotate(-90deg)',
        transformOrigin: 'left top',
        width: '100vh',
        height: '100vw',
        position: 'absolute',
        top: '100%',
        left: 0,
      };
    }
    return {};
  };

  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log('Initializing authentication...');
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        console.log('Stored token:', token);
        console.log('Stored user:', userStr);

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            console.log('Parsed user:', user);
            dispatch(setCredentials({ user, token }));
            console.log('Authentication restored successfully');
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.clear();
            sessionStorage.clear();
          }
        } else {
          console.log('No stored authentication data found');
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
        localStorage.clear();
        sessionStorage.clear();
      }
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease-in-out',
        ...getRotationStyles(),
      }}
    >
      <AuthInitializer>
        <Layout>
          <AppRoutes />
        </Layout>
      </AuthInitializer>
      <Toaster position="top-right" />
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <ThemeProvider theme={theme}>
          <LocalizationProvider 
            dateAdapter={AdapterDateFns} 
            adapterLocale={es}
            localeText={{
              cancelButtonLabel: 'Cancelar',
              clearButtonLabel: 'Limpiar',
              okButtonLabel: 'Aceptar',
              todayButtonLabel: 'Hoy',
            }}
          >
            <SnackbarProvider maxSnack={3}>
              <AppContent />
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </Router>
    </Provider>
  );
};

export default App;

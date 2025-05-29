import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { SnackbarProvider } from 'notistack';
import { Toaster } from 'react-hot-toast';
import { useAppSelector } from './store/hooks';
import { selectUser } from './store/slices/authSlice';
import theme from './theme';
import Layout from './components/Layout';
import AppRoutes from './routes';
import { SocketProvider } from './contexts/SocketContext';
import { AuthInitializer } from './components/AuthInitializer';

const App: React.FC = () => {
  const user = useAppSelector(selectUser);

  return (
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
          <Router>
            <AuthInitializer />
            <SocketProvider user={user}>
              <Layout>
                <AppRoutes />
              </Layout>
              <Toaster position="top-right" />
            </SocketProvider>
          </Router>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { SnackbarProvider } from 'notistack';
import { Toaster } from 'react-hot-toast';
import theme from './theme';
import Layout from './components/Layout';
import Routes from './routes';
import AuthInitializer from './components/AuthInitializer';

const App: React.FC = () => {
  return (
    <Provider store={store}>
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
              <AuthInitializer>
                <Layout>
                  <Routes />
                </Layout>
              </AuthInitializer>
              <Toaster position="top-right" />
            </Router>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import createAppTheme from './theme/theme';
import Layout from './components/Layout';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import { SnackbarProvider } from 'notistack';

const ThemedApp: React.FC = () => {
  const { mode } = useTheme();
  const currentTheme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Router>
        <AppRoutes />
      </Router>
    </MuiThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <SnackbarProvider maxSnack={3}>
            <ThemedApp />
          </SnackbarProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

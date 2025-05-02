import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';
import MainLayout from './components/layout/MainLayout';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './components/dashboard/Dashboard';
import Clients from './components/clients/Clients';
import Appointments from './components/appointments/Appointments';
import Services from './components/services/Services';
import Notifications from './components/notifications/Notifications';
import Settings from './components/settings/Settings';
import Profile from './components/profile/Profile';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route
                        index
                        element={<Navigate to="/dashboard" replace />}
                      />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="clients" element={<Clients />} />
                      <Route path="appointments" element={<Appointments />} />
                      <Route path="services" element={<Services />} />
                      <Route path="notifications" element={<Notifications />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="profile" element={<Profile />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

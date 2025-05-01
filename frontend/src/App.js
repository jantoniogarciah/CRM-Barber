import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Appointments from './pages/Appointments';
import Profile from './pages/Profile';
import { useAuth } from './contexts/AuthContext';
import NotificationToast from './components/notifications/NotificationToast';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ display: 'flex' }}>
      {isAuthenticated ? (
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients/*" element={<Clients />} />
            <Route path="/services/*" element={<Services />} />
            <Route path="/appointments/*" element={<Appointments />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
      <NotificationToast />
    </Box>
  );
}

export default App;

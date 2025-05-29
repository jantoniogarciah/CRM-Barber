import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { SocketProvider } from './contexts/SocketContext';
import { SocketStatus } from './components/SocketStatus';
import { SocketTest } from './components/SocketTest';
import { useAppSelector } from './store/hooks';
import { selectUser } from './store/slices/authSlice';
import { SnackbarProvider } from 'notistack';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Appointments from './pages/Appointments';
import Barbers from './pages/Barbers';
import { AdminRoute } from './components/AdminRoute';
import { PrivateRoute } from './components/PrivateRoute';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  const user = useAppSelector(selectUser);

  return (
    <SnackbarProvider maxSnack={3}>
      <Toaster position="top-right" />
      <SocketProvider>
        <Box sx={{ minHeight: '100vh', position: 'relative' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <PrivateRoute>
                  <Layout>
                    <Clients />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/services"
              element={
                <PrivateRoute>
                  <Layout>
                    <Services />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <PrivateRoute>
                  <Layout>
                    <Appointments />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/barbers"
              element={
                <PrivateRoute>
                  <Layout>
                    <Barbers />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/socket-test"
              element={
                <PrivateRoute>
                  <Layout>
                    <SocketTest />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
          {user && <SocketStatus />}
        </Box>
      </SocketProvider>
    </SnackbarProvider>
  );
};

export default App;

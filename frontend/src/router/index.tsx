import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Clients from '../pages/Clients';
import Services from '../pages/Services';
import Appointments from '../pages/Appointments';
import Sales from '../pages/Sales';
import Users from '../pages/Users';
import NotFound from '../pages/NotFound';
import { PrivateRoute } from '../components/PrivateRoute';
import { AdminRoute } from '../components/AdminRoute';
import { AdminBarberRoute } from '../components/AdminBarberRoute';

// Lazy load the Barbers component
const BarbersPage = lazy(() => {
  console.log('Router - Loading BarbersPage component');
  return import('../pages/Barbers').then((module) => {
    console.log('Router - BarbersPage component loaded:', module);
    return module;
  });
});

// Loading component for suspense fallback
const LoadingComponent = () => {
  console.log('Router - Rendering LoadingComponent');
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Box>Cargando página de barberos...</Box>
    </Box>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <AdminBarberRoute>
            <Dashboard />
          </AdminBarberRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <AdminRoute>
            <Clients />
          </AdminRoute>
        }
      />
      <Route
        path="/services"
        element={
          <AdminRoute>
            <Services />
          </AdminRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <PrivateRoute>
            <Appointments />
          </PrivateRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <PrivateRoute>
            <Sales />
          </PrivateRoute>
        }
      />
      <Route
        path="/barbers"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingComponent />}>
              <BarbersPage />
            </Suspense>
          </AdminRoute>
        }
      />
      <Route
        path="/users"
        element={
          <AdminRoute>
            <Users />
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

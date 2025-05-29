import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Clients from '../pages/Clients';
import Services from '../pages/Services';
import Appointments from '../pages/Appointments';
import Barbers from '../pages/Barbers';
import { PrivateRoute } from '../components/PrivateRoute';
import { AdminRoute } from '../components/AdminRoute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
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
          <PrivateRoute>
            <Clients />
          </PrivateRoute>
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
        path="/barbers"
        element={
          <AdminRoute>
            <Barbers />
          </AdminRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;

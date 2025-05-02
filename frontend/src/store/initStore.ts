import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import clientReducer from './slices/clientSlice';
import serviceReducer from './slices/serviceSlice';
import appointmentReducer from './slices/appointmentSlice';
import notificationReducer from './slices/notificationSlice';
import { api } from '../services/api';

export const initStore = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      clients: clientReducer,
      services: serviceReducer,
      appointments: appointmentReducer,
      notifications: notificationReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
          ignoredActionPaths: ['payload.token', 'payload.user'],
          ignoredPaths: ['auth.user', 'auth.token'],
        },
      }).concat(api.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });

  setupListeners(store.dispatch);

  return store;
};

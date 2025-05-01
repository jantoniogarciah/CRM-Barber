import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import clientReducer from './slices/clientSlice';
import serviceReducer from './slices/serviceSlice';
import appointmentReducer from './slices/appointmentSlice';
import notificationReducer from './slices/notificationSlice';
import { api } from '../services/api';

export const store = configureStore({
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
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.token', 'payload.user'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'auth.token'],
      },
    }).concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable the refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

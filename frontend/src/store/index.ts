import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '../services/api';
import authReducer from './slices/authSlice';
import clientReducer from './slices/clientSlice';
import serviceReducer from './slices/serviceSlice';
import appointmentReducer from './slices/appointmentSlice';
import notificationReducer from './slices/notificationSlice';
import { barberApi } from './services/barberApi';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [barberApi.reducerPath]: barberApi.reducer,
    auth: authReducer,
    client: clientReducer,
    service: serviceReducer,
    appointment: appointmentReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([api.middleware, barberApi.middleware]),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

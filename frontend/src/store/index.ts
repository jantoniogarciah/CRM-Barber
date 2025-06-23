import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authReducer } from './slices/authSlice';
import { appointmentApi } from './services/appointmentApi';
import { clientApi } from './services/clientApi';
import { serviceApi } from './services/serviceApi';
import { barberApi } from './services/barberApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [appointmentApi.reducerPath]: appointmentApi.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
    [barberApi.reducerPath]: barberApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(
      appointmentApi.middleware,
      clientApi.middleware,
      serviceApi.middleware,
      barberApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

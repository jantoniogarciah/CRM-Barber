import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Barber } from '../../types';
import { toast } from 'react-hot-toast';
import { clearCredentials } from '../slices/authSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
  credentials: 'include',
});

const baseQueryWithRetry = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const error = result.error as any;
    console.error('API Error:', error);

    // Handle authentication errors
    if (error.status === 401) {
      // Clear all auth data
      localStorage.clear();
      sessionStorage.clear();
      api.dispatch(clearCredentials());

      // Show error message
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');

      window.location.href = '/login';
      return result;
    }

    // Handle server errors
    if (error.status === 500) {
      toast.error('Error en el servidor. Por favor, intenta más tarde.');
    }

    // Handle network errors
    if (error.status === 'FETCH_ERROR') {
      toast.error('Error de conexión. Por favor, verifica tu conexión a internet.');
    }
  }

  return result;
};

export const barberApi = createApi({
  reducerPath: 'barberApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Barber'],
  endpoints: (builder) => ({
    getBarbers: builder.query<Barber[], { showInactive?: boolean }>({
      query: ({ showInactive }) => ({
        url: `/barbers${showInactive ? '?showInactive=true' : ''}`,
        method: 'GET',
      }),
      providesTags: ['Barber'],
    }),
    getBarber: builder.query<Barber, string>({
      query: (id) => ({
        url: `/barbers/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Barber', id }],
    }),
    createBarber: builder.mutation<Barber, Partial<Barber>>({
      query: (barber) => ({
        url: '/barbers',
        method: 'POST',
        body: barber,
      }),
      invalidatesTags: ['Barber'],
    }),
    updateBarber: builder.mutation<Barber, { id: string; barber: Partial<Barber> }>({
      query: ({ id, barber }) => ({
        url: `/barbers/${id}`,
        method: 'PUT',
        body: barber,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Barber', id }],
    }),
    deleteBarber: builder.mutation<void, string>({
      query: (id) => ({
        url: `/barbers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Barber'],
    }),
    toggleBarberStatus: builder.mutation<Barber, string>({
      query: (id) => ({
        url: `/barbers/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Barber'],
    }),
  }),
});

export const {
  useGetBarbersQuery,
  useGetBarberQuery,
  useCreateBarberMutation,
  useUpdateBarberMutation,
  useDeleteBarberMutation,
  useToggleBarberStatusMutation,
} = barberApi;

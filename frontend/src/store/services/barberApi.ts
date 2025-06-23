import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRetry } from '../../services/api';
import { Barber } from '../../types';
import { toast } from 'react-toastify';
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

const handleError = (error: any) => {
  if (error.status === 401) {
    toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
  } else if (error.status === 500) {
    toast.error('Error del servidor. Por favor intenta más tarde.');
  } else {
    toast.error(error.data?.message || 'Error desconocido');
  }
};

export const barberApi = createApi({
  reducerPath: 'barberApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Barber'],
  endpoints: (builder) => ({
    getBarbers: builder.query<Barber[], void>({
      query: () => '/barbers',
      providesTags: ['Barber'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    getBarber: builder.query<Barber, string>({
      query: (id: string) => `/barbers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Barber', id }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    createBarber: builder.mutation<Barber, Partial<Barber>>({
      query: (barber) => ({
        url: '/barbers',
        method: 'POST',
        body: barber,
      }),
      invalidatesTags: ['Barber'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Barbero creado exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    updateBarber: builder.mutation<Barber, { id: string; barber: Partial<Barber> }>({
      query: ({ id, barber }) => ({
        url: `/barbers/${id}`,
        method: 'PUT',
        body: barber,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Barber', id },
        'Barber',
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Barbero actualizado exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    deleteBarber: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/barbers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Barber'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Barbero eliminado exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
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

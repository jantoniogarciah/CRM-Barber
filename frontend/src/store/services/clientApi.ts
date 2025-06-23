import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRetry } from '../../services/api';
import { Client } from '../../types';
import { toast } from 'react-toastify';

const handleError = (error: any) => {
  if (error.status === 401) {
    toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
  } else if (error.status === 500) {
    toast.error('Error del servidor. Por favor intenta más tarde.');
  } else {
    toast.error(error.data?.message || 'Error desconocido');
  }
};

export const clientApi = createApi({
  reducerPath: 'clientApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Client'],
  endpoints: (builder) => ({
    getClients: builder.query<Client[], void>({
      query: () => '/clients',
      providesTags: ['Client'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    getClient: builder.query<Client, string>({
      query: (id: string) => `/clients/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Client', id }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    createClient: builder.mutation<Client, Partial<Client>>({
      query: (client) => ({
        url: '/clients',
        method: 'POST',
        body: client,
      }),
      invalidatesTags: ['Client'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Cliente creado exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    updateClient: builder.mutation<Client, { id: string; client: Partial<Client> }>({
      query: ({ id, client }) => ({
        url: `/clients/${id}`,
        method: 'PUT',
        body: client,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Client', id },
        'Client',
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Cliente actualizado exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    deleteClient: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/clients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Client'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Cliente eliminado exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientApi; 
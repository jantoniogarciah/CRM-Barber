import { api } from './api';
import { Client as ClientType } from './types';
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export type Client = ClientType;

export interface CreateClientData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  notes?: string;
}

export interface UpdateClientData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

type BuilderType = EndpointBuilder<any, any, any>;

export const clientApi = api.injectEndpoints({
  endpoints: (builder: BuilderType) => ({
    getClients: builder.query<Client[], void>({
      query: () => '/clients',
      providesTags: ['Client'],
    }),

    getClient: builder.query<Client, number>({
      query: (id: number) => `/clients/${id}`,
      providesTags: (
        _result: Client | undefined,
        _error: unknown,
        id: number
      ) => [{ type: 'Client', id }],
    }),

    createClient: builder.mutation<Client, CreateClientData>({
      query: (client: CreateClientData) => ({
        url: '/clients',
        method: 'POST',
        body: client,
      }),
      invalidatesTags: ['Client'],
    }),

    updateClient: builder.mutation<
      Client,
      { id: number; client: UpdateClientData }
    >({
      query: ({ id, client }: { id: number; client: UpdateClientData }) => ({
        url: `/clients/${id}`,
        method: 'PUT',
        body: client,
      }),
      invalidatesTags: (
        _result: Client | undefined,
        _error: unknown,
        { id }: { id: number }
      ) => [{ type: 'Client', id }],
    }),

    deleteClient: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `/clients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Client'],
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

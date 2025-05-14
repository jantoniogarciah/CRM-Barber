import { Client as ClientType, ApiResponse } from '../types';
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { api } from './api';

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
    getClients: builder.query<ClientType[], void>({
      query: () => '/clients',
      providesTags: ['Client'],
    }),

    getClient: builder.query<ClientType, number>({
      query: (id) => `/clients/${id}`,
      providesTags: (result, error, id) => [{ type: 'Client', id }],
    }),

    createClient: builder.mutation<ClientType, Partial<ClientType>>({
      query: (client) => ({
        url: '/clients',
        method: 'POST',
        body: client,
      }),
      invalidatesTags: ['Client'],
    }),

    updateClient: builder.mutation<ClientType, { id: number; data: Partial<ClientType> }>({
      query: ({ id, data }) => ({
        url: `/clients/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Client', id }],
    }),

    deleteClient: builder.mutation<void, number>({
      query: (id) => ({
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

// These functions are kept for backward compatibility but should be replaced with RTK Query hooks
export const getClients = async (): Promise<ClientType[]> => {
  const response = await fetch(`${API_URL}/clients`);
  const data: ApiResponse<ClientType[]> = await response.json();
  return data.data;
};

export const createClient = async (client: Partial<ClientType>): Promise<ClientType> => {
  const response = await fetch(`${API_URL}/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(client),
  });
  const data: ApiResponse<ClientType> = await response.json();
  return data.data;
};

export const updateClient = async (
  id: number,
  client: Partial<ClientType>
): Promise<ClientType> => {
  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(client),
  });
  const data: ApiResponse<ClientType> = await response.json();
  return data.data;
};

export const deleteClient = async (id: number): Promise<void> => {
  await fetch(`${API_URL}/clients/${id}`, {
    method: 'DELETE',
  });
};

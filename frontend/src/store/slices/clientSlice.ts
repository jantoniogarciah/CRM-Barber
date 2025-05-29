import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Client } from '../../types';
import { api } from '../../services/api';

interface ClientState {
  clients: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientState = {
  clients: [],
  loading: false,
  error: null,
};

// Extend the API with client endpoints
export const clientApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<Client[], void>({
      query: () => '/clients',
      providesTags: ['Client'],
    }),
    createClient: builder.mutation<Client, Omit<Client, 'id'>>({
      query: (client) => ({
        url: '/clients',
        method: 'POST',
        body: client,
      }),
      invalidatesTags: ['Client'],
    }),
    updateClient: builder.mutation<Client, { id: string; client: Partial<Client> }>({
      query: ({ id, client }) => ({
        url: `/clients/${id}`,
        method: 'PUT',
        body: client,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (response: { data: Client }) => response.data,
      transformErrorResponse: (response: { status: number; data: any }) => {
        console.error('Update client error:', response);
        return response.data;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Client', id },
        { type: 'Client', id: 'LIST' },
      ],
    }),
    deleteClient: builder.mutation<void, string>({
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
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientApi;

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setClients: (state, action: PayloadAction<Client[]>) => {
      state.clients = action.payload;
    },
    addClient: (state, action: PayloadAction<Client>) => {
      state.clients.push(action.payload);
    },
    updateClient: (state, action: PayloadAction<Client>) => {
      const index = state.clients.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.clients[index] = action.payload;
      }
    },
    deleteClient: (state, action: PayloadAction<string>) => {
      state.clients = state.clients.filter((c) => c.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setClients,
  addClient,
  updateClient: updateClientAction,
  deleteClient: deleteClientAction,
  setLoading,
  setError,
} = clientSlice.actions;

export const selectClients = (state: RootState) => state.client.clients;
export const selectClientById = (id: string) => (state: RootState) =>
  state.client.clients.find((c) => c.id === id);
export const selectLoading = (state: RootState) => state.client.loading;
export const selectError = (state: RootState) => state.client.error;

export default clientSlice.reducer;

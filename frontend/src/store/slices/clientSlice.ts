import { createSlice } from '@reduxjs/toolkit';
import { Client } from '../../services/clientService';

interface ClientState {
  clients: Client[];
  selectedClient: Client | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClientState = {
  clients: [],
  selectedClient: null,
  loading: false,
  error: null,
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setSelectedClient: (state, action) => {
      state.selectedClient = action.payload;
    },
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    },
  },
});

export const { setSelectedClient, clearSelectedClient } = clientSlice.actions;

export default clientSlice.reducer;

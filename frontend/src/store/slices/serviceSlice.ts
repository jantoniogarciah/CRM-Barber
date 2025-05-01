import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  Service,
  CreateServiceData,
  UpdateServiceData,
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
} from '../../services/serviceService';

interface ServiceState {
  services: Service[];
  selectedService: Service | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServiceState = {
  services: [],
  selectedService: null,
  loading: false,
  error: null,
};

export const fetchServices = createAsyncThunk('services/fetchAll', async () => {
  const response = await getServices();
  return response.data;
});

export const fetchService = createAsyncThunk(
  'services/fetchOne',
  async (id: number) => {
    const response = await getService(id);
    return response;
  }
);

export const addService = createAsyncThunk(
  'services/add',
  async (data: CreateServiceData) => {
    const response = await createService(data);
    return response;
  }
);

export const editService = createAsyncThunk(
  'services/edit',
  async ({ id, data }: { id: number; data: UpdateServiceData }) => {
    const response = await updateService(id, data);
    return response;
  }
);

export const removeService = createAsyncThunk(
  'services/remove',
  async (id: number) => {
    await deleteService(id);
    return id;
  }
);

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    clearSelectedService: (state) => {
      state.selectedService = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch services';
      })
      .addCase(fetchService.fulfilled, (state, action) => {
        state.selectedService = action.payload;
      })
      .addCase(addService.fulfilled, (state, action) => {
        state.services.push(action.payload);
      })
      .addCase(editService.fulfilled, (state, action) => {
        const index = state.services.findIndex(
          (service) => service.id === action.payload.id
        );
        if (index !== -1) {
          state.services[index] = action.payload;
        }
        if (state.selectedService?.id === action.payload.id) {
          state.selectedService = action.payload;
        }
      })
      .addCase(removeService.fulfilled, (state, action) => {
        state.services = state.services.filter(
          (service) => service.id !== action.payload
        );
        if (state.selectedService?.id === action.payload) {
          state.selectedService = null;
        }
      });
  },
});

export const { setSelectedService, clearSelectedService } =
  serviceSlice.actions;
export default serviceSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

export interface Appointment {
  id: number;
  clientId: number;
  serviceId: number;
  barberId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentState {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedAppointment: (
      state,
      action: PayloadAction<Appointment | null>
    ) => {
      state.selectedAppointment = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.push(action.payload);
    },
    updateAppointment: (state, action: PayloadAction<Appointment>) => {
      const index = state.appointments.findIndex(
        (app) => app.id === action.payload.id
      );
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    deleteAppointment: (state, action: PayloadAction<number>) => {
      state.appointments = state.appointments.filter(
        (app) => app.id !== action.payload
      );
    },
  },
});

// Actions
export const {
  setAppointments,
  setSelectedAppointment,
  setLoading,
  setError,
  addAppointment,
  updateAppointment,
  deleteAppointment,
} = appointmentSlice.actions;

// Selectors
export const selectAppointments = (state: RootState) =>
  state.appointments.appointments;
export const selectSelectedAppointment = (state: RootState) =>
  state.appointments.selectedAppointment;
export const selectAppointmentsLoading = (state: RootState) =>
  state.appointments.loading;
export const selectAppointmentsError = (state: RootState) =>
  state.appointments.error;

export default appointmentSlice.reducer;

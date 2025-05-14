import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Appointment } from '../../types';
import { api } from '../../services/api';

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  loading: false,
  error: null,
};

// Extend the API with appointment endpoints
export const appointmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query<Appointment[], void>({
      query: () => '/appointments',
      providesTags: ['Appointment'],
    }),
    createAppointment: builder.mutation<Appointment, Omit<Appointment, 'id'>>({
      query: (appointment) => ({
        url: '/appointments',
        method: 'POST',
        body: appointment,
      }),
      invalidatesTags: ['Appointment'],
    }),
    updateAppointment: builder.mutation<
      Appointment,
      { id: number; appointment: Partial<Appointment> }
    >({
      query: ({ id, appointment }) => ({
        url: `/appointments/${id}`,
        method: 'PUT',
        body: appointment,
      }),
      invalidatesTags: ['Appointment'],
    }),
    deleteAppointment: builder.mutation<void, number>({
      query: (id) => ({
        url: `/appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment'],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
} = appointmentApi;

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = action.payload;
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.push(action.payload);
    },
    updateAppointment: (state, action: PayloadAction<Appointment>) => {
      const index = state.appointments.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    deleteAppointment: (state, action: PayloadAction<number>) => {
      state.appointments = state.appointments.filter((a) => a.id !== action.payload);
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
  setAppointments,
  addAppointment,
  updateAppointment: updateAppointmentAction,
  deleteAppointment: deleteAppointmentAction,
  setLoading,
  setError,
} = appointmentSlice.actions;

export const selectAppointments = (state: RootState) => state.appointment.appointments;
export const selectAppointmentById = (id: number) => (state: RootState) =>
  state.appointment.appointments.find((a) => a.id === id);
export const selectLoading = (state: RootState) => state.appointment.loading;
export const selectError = (state: RootState) => state.appointment.error;

export default appointmentSlice.reducer;

import { api } from './api';
import { Appointment } from '../types';

export interface GetAppointmentsParams {
  startDate?: string;
  endDate?: string;
  name?: string;
  phone?: string;
  status?: string;
}

export interface GetAppointmentsResponse {
  appointments: Appointment[];
  total: number;
}

export const appointmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query<GetAppointmentsResponse, GetAppointmentsParams | void>({
      query: (params) => ({
        url: '/appointments',
        params: params || {},
      }),
      providesTags: ['Appointment'],
    }),

    getAppointment: builder.query<Appointment, string>({
      query: (id) => `/appointments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Appointment', id }],
    }),

    getBarberAppointments: builder.query<Appointment[], string>({
      query: (barberId) => `/appointments/barber/${barberId}`,
      providesTags: ['Appointment'],
    }),

    getClientAppointments: builder.query<Appointment[], string>({
      query: (clientId) => `/appointments/client/${clientId}`,
      providesTags: ['Appointment'],
    }),

    createAppointment: builder.mutation<Appointment, Partial<Appointment>>({
      query: (appointment) => ({
        url: '/appointments',
        method: 'POST',
        body: appointment,
      }),
      invalidatesTags: ['Appointment'],
    }),

    updateAppointment: builder.mutation<Appointment, { id: string; appointment: Partial<Appointment> }>({
      query: ({ id, appointment }) => ({
        url: `/appointments/${id}`,
        method: 'PUT',
        body: appointment,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Appointment', id }],
    }),

    deleteAppointment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment'],
    }),

    cancelAppointment: builder.mutation<Appointment, string>({
      query: (id) => ({
        url: `/appointments/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Appointment', id }],
    }),

    completeAppointment: builder.mutation<Appointment, string>({
      query: (id) => ({
        url: `/appointments/${id}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Appointment', id }],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useGetBarberAppointmentsQuery,
  useGetClientAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  useCancelAppointmentMutation,
  useCompleteAppointmentMutation,
} = appointmentApi;

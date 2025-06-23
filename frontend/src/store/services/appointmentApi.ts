import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRetry } from '../../services/api';
import { Appointment } from '../../types';
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

export const appointmentApi = createApi({
  reducerPath: 'appointmentApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Appointment'],
  endpoints: (builder) => ({
    getAppointments: builder.query<Appointment[], void>({
      query: () => '/appointments',
      providesTags: ['Appointment'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    getAppointment: builder.query<Appointment, string>({
      query: (id: string) => `/appointments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Appointment', id }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    createAppointment: builder.mutation<Appointment, Partial<Appointment>>({
      query: (appointment) => ({
        url: '/appointments',
        method: 'POST',
        body: appointment,
      }),
      invalidatesTags: ['Appointment'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Cita creada exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    updateAppointment: builder.mutation<Appointment, { id: string; appointment: Partial<Appointment> }>({
      query: ({ id, appointment }) => ({
        url: `/appointments/${id}`,
        method: 'PUT',
        body: appointment,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Appointment', id },
        'Appointment',
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Cita actualizada exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    deleteAppointment: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Cita eliminada exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
} = appointmentApi; 
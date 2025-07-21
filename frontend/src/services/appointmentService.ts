import { api } from './api';

export interface Appointment {
  id: number;
  clientId: number;
  barberId: number;
  serviceId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDto {
  clientId: number;
  barberId: number;
  serviceId: number;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  barberId?: number;
  serviceId?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

export const appointmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query<Appointment[], void>({
      query: () => '/appointments',
      providesTags: ['Appointment'],
    }),

    getAppointment: builder.query<Appointment, number>({
      query: (id) => `/appointments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Appointment', id }],
    }),

    getBarberAppointments: builder.query<Appointment[], number>({
      query: (barberId) => `/appointments/barber/${barberId}`,
      providesTags: ['Appointment'],
    }),

    getClientAppointments: builder.query<Appointment[], number>({
      query: (clientId) => `/appointments/client/${clientId}`,
      providesTags: ['Appointment'],
    }),

    createAppointment: builder.mutation<Appointment, CreateAppointmentDto>({
      query: (appointment) => ({
        url: '/appointments',
        method: 'POST',
        body: appointment,
      }),
      invalidatesTags: ['Appointment'],
    }),

    updateAppointment: builder.mutation<
      Appointment,
      { id: number; appointment: UpdateAppointmentDto }
    >({
      query: ({ id, appointment }) => ({
        url: `/appointments/${id}`,
        method: 'PUT',
        body: appointment,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Appointment', id }],
    }),

    deleteAppointment: builder.mutation<void, number>({
      query: (id) => ({
        url: `/appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment'],
    }),

    cancelAppointment: builder.mutation<Appointment, number>({
      query: (id) => ({
        url: `/appointments/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Appointment', id }],
    }),

    completeAppointment: builder.mutation<Appointment, number>({
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

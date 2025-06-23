import { api } from '../../services/api';
import { Barber } from '../../types';
import { toast } from 'react-hot-toast';
import { clearCredentials } from '../slices/authSlice';

const handleError = (error: any) => {
  if (error.status === 401) {
    toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
  } else if (error.status === 500) {
    toast.error('Error del servidor. Por favor intenta más tarde.');
  } else {
    toast.error(error.data?.message || 'Error desconocido');
  }
};

// Extend the base api with the barber endpoints
export const barberApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBarbers: builder.query<Barber[], { showInactive: boolean }>({
      query: (params) => ({
        url: '/barbers',
        params: { showInactive: params.showInactive },
      }),
      providesTags: ['Barber'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    getBarber: builder.query<Barber, string>({
      query: (id: string) => `/barbers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Barber', id }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    createBarber: builder.mutation<Barber, Partial<Barber>>({
      query: (barber) => ({
        url: '/barbers',
        method: 'POST',
        body: barber,
      }),
      invalidatesTags: ['Barber'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Barbero creado exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    updateBarber: builder.mutation<Barber, { id: string; barber: Partial<Barber> }>({
      query: ({ id, barber }) => ({
        url: `/barbers/${id}`,
        method: 'PUT',
        body: barber,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Barber', id },
        'Barber',
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Barbero actualizado exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    deleteBarber: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/barbers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Barber'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Barbero eliminado exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    toggleBarberStatus: builder.mutation<Barber, string>({
      query: (id) => ({
        url: `/barbers/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Barber'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBarbersQuery,
  useGetBarberQuery,
  useCreateBarberMutation,
  useUpdateBarberMutation,
  useDeleteBarberMutation,
  useToggleBarberStatusMutation,
} = barberApi;

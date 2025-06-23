import { api } from '../../services/api';
import { Service } from '../../types';
import { toast } from 'react-hot-toast';

const handleError = (error: any) => {
  if (error.status === 401) {
    toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
  } else if (error.status === 500) {
    toast.error('Error del servidor. Por favor intenta más tarde.');
  } else {
    toast.error(error.data?.message || 'Error desconocido');
  }
};

// Extend the base api with the service endpoints
export const serviceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<Service[], void>({
      query: () => '/services',
      providesTags: ['Service'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    getService: builder.query<Service, string>({
      query: (id: string) => `/services/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Service', id }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    createService: builder.mutation<Service, Partial<Service>>({
      query: (service) => ({
        url: '/services',
        method: 'POST',
        body: service,
      }),
      invalidatesTags: ['Service'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Servicio creado exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    updateService: builder.mutation<Service, { id: string; service: Partial<Service> }>({
      query: ({ id, service }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: service,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Service', id },
        'Service',
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Servicio actualizado exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
    deleteService: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Servicio eliminado exitosamente');
        } catch (error: any) {
          handleError(error.error);
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApi; 
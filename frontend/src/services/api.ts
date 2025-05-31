import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, Client, Service, Appointment, Notification, Category, Barber } from '../types';
import { RootState } from '../store';
import { toast } from 'react-hot-toast';
import { clearCredentials } from '../store/slices/authSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
      console.log('Setting auth header:', `Bearer ${token}`); // Debug log
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
  credentials: 'include',
});

const baseQueryWithRetry = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const error = result.error as any;
    console.log('API Error:', error);

    // Handle authentication errors
    if (error.status === 401) {
      // Clear all auth data
      localStorage.clear();
      sessionStorage.clear();
      api.dispatch(clearCredentials());

      // Show error message
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');

      // Use navigate instead of window.location for a smoother transition
      window.location.href = '/login';
      return result;
    }

    // Handle server errors
    if (error.status === 500) {
      toast.error('Error en el servidor. Por favor, intenta más tarde.');
    }

    // Handle network errors
    if (error.status === 'FETCH_ERROR') {
      toast.error('Error de conexión. Por favor, verifica tu conexión a internet.');
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['User', 'Client', 'Service', 'Appointment', 'Notification', 'Category', 'Barber'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<{ user: User; token: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<
      { user: User; token: string },
      { email: string; password: string; name: string; phone: string }
    >({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    updateUser: builder.mutation<{ user: User; token: string }, Partial<User>>({
      query: (userData) => ({
        url: '/auth/update',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Client endpoints
    getClients: builder.query<Client[], { showInactive?: boolean }>({
      query: ({ showInactive }) => `/clients${showInactive ? '?showInactive=true' : ''}`,
      providesTags: ['Client'],
    }),
    getClient: builder.query<Client, string>({
      query: (id) => `/clients/${id}`,
      providesTags: (result, error, id) => [{ type: 'Client', id }],
    }),
    createClient: builder.mutation<Client, Partial<Client>>({
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
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Client', id }],
    }),
    deleteClient: builder.mutation<{ message: string; remainingClients: Client[] }, string>({
      query: (id) => ({
        url: `/clients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Client'],
    }),
    toggleClientStatus: builder.mutation<Client, string>({
      query: (id) => ({
        url: `/clients/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Client'],
    }),

    // Service endpoints
    getServices: builder.query<Service[], { showInactive?: boolean }>({
      query: ({ showInactive }) => `/services${showInactive ? '?showInactive=true' : ''}`,
      providesTags: ['Service'],
    }),
    getService: builder.query<Service, string>({
      query: (id) => `/services/${id}`,
      providesTags: (result, error, id) => [{ type: 'Service', id }],
    }),
    createService: builder.mutation<Service, Partial<Service>>({
      query: (service) => ({
        url: '/services',
        method: 'POST',
        body: service,
      }),
      invalidatesTags: ['Service'],
    }),
    updateService: builder.mutation<Service, { id: string; service: Partial<Service> }>({
      query: ({ id, service }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: service,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Service', id }, 'Service'],
    }),
    deleteService: builder.mutation<void, string>({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),
    toggleServiceStatus: builder.mutation<Service, string>({
      query: (id) => ({
        url: `/services/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Service'],
    }),

    // Appointment endpoints
    getAppointments: builder.query<Appointment[], void>({
      query: () => '/appointments',
      providesTags: ['Appointment'],
    }),
    getAppointment: builder.query<Appointment, string>({
      query: (id) => `/appointments/${id}`,
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
    updateAppointment: builder.mutation<
      Appointment,
      { id: string; appointment: Partial<Appointment> }
    >({
      query: ({ id, appointment }) => ({
        url: `/appointments/${id}`,
        method: 'PUT',
        body: appointment,
      }),
      invalidatesTags: ['Appointment'],
    }),
    deleteAppointment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment'],
    }),

    // Notification endpoints
    getNotifications: builder.query<Notification[], void>({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    markNotificationAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Category endpoints
    getCategories: builder.query<Category[], { showInactive?: boolean }>({
      query: ({ showInactive }) => ({
        url: '/categories',
        params: { showInactive },
      }),
      providesTags: ['Category'],
    }),
    getCategory: builder.query<Category, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Category', id }],
    }),
    createCategory: builder.mutation<Category, Pick<Category, 'name' | 'description' | 'isActive'>>(
      {
        query: (data) => ({
          url: '/categories',
          method: 'POST',
          body: data,
        }),
        invalidatesTags: ['Category'],
      }
    ),
    updateCategory: builder.mutation<Category, { id: string; category: Partial<Category> }>({
      query: ({ id, category }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: category,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Category', id }],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Barber endpoints
    getBarbers: builder.query<Barber[], { showInactive?: boolean }>({
      query: ({ showInactive }) => ({
        url: `/barbers${showInactive ? '?showInactive=true' : ''}`,
        method: 'GET',
      }),
      providesTags: ['Barber'],
    }),
    getBarber: builder.query<Barber, string>({
      query: (id) => ({
        url: `/barbers/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Barber', id }],
    }),
    createBarber: builder.mutation<Barber, Partial<Barber>>({
      query: (barber) => ({
        url: '/barbers',
        method: 'POST',
        body: barber,
      }),
      invalidatesTags: ['Barber'],
    }),
    updateBarber: builder.mutation<Barber, { id: string; barber: Partial<Barber> }>({
      query: ({ id, barber }) => ({
        url: `/barbers/${id}`,
        method: 'PUT',
        body: barber,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Barber', id }, 'Barber'],
    }),
    deleteBarber: builder.mutation<void, string>({
      query: (id) => ({
        url: `/barbers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Barber'],
    }),
    toggleBarberStatus: builder.mutation<Barber, string>({
      query: (id) => ({
        url: `/barbers/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Barber'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useGetClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useToggleClientStatusMutation,
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleServiceStatusMutation,
  useUpdateUserMutation,
  useGetBarbersQuery,
  useGetBarberQuery,
  useCreateBarberMutation,
  useUpdateBarberMutation,
  useDeleteBarberMutation,
  useToggleBarberStatusMutation,
} = api;

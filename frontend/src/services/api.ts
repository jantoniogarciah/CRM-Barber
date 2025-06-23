import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, Client, Service, Appointment, Notification, Category, Barber, Sale } from '../types';
import { RootState } from '../store';
import { toast } from 'react-hot-toast';
import { clearCredentials } from '../store/slices/authSlice';

// Asegurarse de que la URL base termine en /api
const API_URL = process.env.REACT_APP_API_URL || 'https://crm-barber-backend.onrender.com/api';

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    // Intentar obtener el token primero de Redux
    const token = (getState() as RootState).auth.token || localStorage.getItem('token');
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
  credentials: 'same-origin'
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Client', 'Service', 'Appointment', 'Notification', 'Category', 'Barber', 'Services', 'Categories', 'Clients', 'Barbers', 'ServicesLog', 'Sales'],
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
    getClientByPhone: builder.query<Client, string>({
      query: (phone) => ({
        url: '/clients/search/phone',
        params: { phone },
      }),
      providesTags: ['Client'],
    }),

    getClients: builder.query<{ clients: Client[]; pagination: any }, { showInactive?: boolean; page?: number; limit?: number; phone?: string }>({
      query: (params) => ({
        url: '/clients',
        params: {
          showInactive: params.showInactive,
          page: params.page,
          limit: params.limit,
          phone: params.phone
        },
      }),
      providesTags: ['Clients'],
    }),
    getLastCompletedAppointments: builder.query<{ [clientId: string]: Appointment }, void>({
      query: () => '/appointments/last-completed',
      providesTags: ['Appointment'],
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
      invalidatesTags: ['Client', 'Clients'],
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

    searchClientByPhone: builder.query<Client[], string>({
      query: (phone) => ({
        url: '/clients/search/phone',
        params: { phone },
      }),
      providesTags: ['Clients'],
    }),

    // Service endpoints
    getServices: builder.query<Service[], { showInactive?: boolean }>({
      query: (params) => ({
        url: '/services',
        params: { showInactive: params?.showInactive },
      }),
      providesTags: ['Services'],
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
    getAppointments: builder.query<{ appointments: Appointment[]; total: number }, void>({
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
      invalidatesTags: ['Appointment', 'Sales'],
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
      query: (params) => ({
        url: '/barbers',
        params: { showInactive: params?.showInactive },
      }),
      providesTags: ['Barbers'],
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

    // Servicios realizados
    getServicesLog: builder.query({
      query: (barberId) => `/services-log/${barberId}`,
      providesTags: ['ServicesLog'],
    }),

    createServiceLog: builder.mutation({
      query: (serviceLog) => ({
        url: '/services-log',
        method: 'POST',
        body: serviceLog,
      }),
      invalidatesTags: ['ServicesLog'],
    }),

    // Sales endpoints
    getSales: builder.query<{
      sales: Sale[];
      total: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    }, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/sales',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10
        }
      }),
      providesTags: ['Sales'],
    }),
    getSale: builder.query<Sale, string>({
      query: (id) => `/sales/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Sales', id }],
    }),
    createSale: builder.mutation<Sale, Partial<Sale>>({
      query: (sale) => ({
        url: '/sales',
        method: 'POST',
        body: sale,
      }),
      invalidatesTags: ['Sales'],
    }),
    updateSale: builder.mutation<Sale, { id: string; sale: Partial<Sale> }>({
      query: ({ id, sale }) => ({
        url: `/sales/${id}`,
        method: 'PUT',
        body: sale,
      }),
      invalidatesTags: ['Sales'],
    }),
    deleteSale: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/sales/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sales'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useUpdateUserMutation,
  useGetClientsQuery,
  useGetClientByPhoneQuery,
  useGetLastCompletedAppointmentsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useToggleClientStatusMutation,
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
  useToggleServiceStatusMutation,
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetBarbersQuery,
  useGetBarberQuery,
  useCreateBarberMutation,
  useUpdateBarberMutation,
  useDeleteBarberMutation,
  useToggleBarberStatusMutation,
  useGetServicesLogQuery,
  useCreateServiceLogMutation,
  useGetSalesQuery,
  useGetSaleQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
  useSearchClientByPhoneQuery,
} = api;

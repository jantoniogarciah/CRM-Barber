import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, Client, Service, Appointment, Notification, Category, Barber, Sale } from '../types';
import { RootState } from '../store';
import { toast } from 'react-hot-toast';
import { clearCredentials } from '../store/slices/authSlice';
import { API_CONFIG } from '../config';

interface GetSalesParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  name?: string;
  phone?: string;
  status?: string;
}

const baseQuery = fetchBaseQuery(API_CONFIG);

const baseQueryWithRetry = async (args: any, api: any, extraOptions: any) => {
  try {
    console.log('API Request:', {
      url: typeof args === 'string' ? args : args.url,
      method: args.method,
      body: args.body,
      params: args.params
    });

    const result = await baseQuery(args, api, extraOptions);
    
    console.log('API Response:', {
      status: result.meta?.response?.status,
      data: result.data,
      error: result.error
    });

    if (result.error) {
      const error = result.error as any;
      
      // Si es un error de autenticación y no estamos en login o logout
      if (error.status === 401 && !args.url.includes('/auth/login') && !args.url.includes('/auth/logout')) {
        console.error('Authentication error:', error);
        localStorage.clear();
        sessionStorage.clear();
        api.dispatch(clearCredentials());
        
        // Solo redirigir si no estamos ya en la página de login y no es una llamada a getCurrentUser
        if (window.location.pathname !== '/login' && !args.url.includes('/auth/me')) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          // Asegurarse de que la URL base sea correcta
          const baseUrl = window.location.origin;
          // Navegar a la página de login usando la URL completa
          window.location.href = `${baseUrl}/login`;
        }
      } else if (!args.url.includes('/auth/logout')) { // No mostrar errores durante el logout
        console.error('API Error:', error);
        if (error.data?.message) {
          toast.error(error.data.message);
        } else {
          toast.error('Error en la conexión. Por favor, verifica tu conexión a internet.');
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('API Request Failed:', error);
    // No mostrar error de conexión durante el logout
    if (!args.url?.includes('/auth/logout')) {
      toast.error('Error en la conexión. Por favor, verifica tu conexión a internet.');
    }
    return {
      error: {
        status: 'FETCH_ERROR',
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    };
  }
};

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
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
    updateProfile: builder.mutation<User, Partial<UpdateProfileDto>>({
      query: (data) => ({
        url: '/auth/update-profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updatePassword: builder.mutation<{ message: string }, { currentPassword: string; newPassword: string }>({
      query: (data) => ({
        url: '/auth/update-password',
        method: 'POST',
        body: data,
      }),
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

    // Search clients by name or phone
    searchClients: builder.query<Client[], string>({
      query: (search) => ({
        url: '/clients/search',
        params: { search },
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
    }, GetSalesParams>({
      query: (params) => ({
        url: '/sales',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          startDate: params?.startDate,
          endDate: params?.endDate,
          name: params?.name,
          phone: params?.phone,
          status: params?.status
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

    // User management endpoints
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<User, Partial<User>>({
      query: (user) => ({
        url: '/users',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<User, { id: string; user: Partial<User> }>({
      query: ({ id, user }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useGetClientsQuery,
  useGetClientByPhoneQuery,
  useGetLastCompletedAppointmentsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useToggleClientStatusMutation,
  useSearchClientByPhoneQuery,
  useSearchClientsQuery,
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
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = api;

// Dashboard endpoints
export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query<any, string>({
      query: (endpoint) => `/dashboard${endpoint}`,
      providesTags: ['Sales', 'Clients'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardDataQuery,
} = dashboardApi;

import { api } from './api';
import { Service as ServiceType, ApiResponse, PaginatedResponse } from './types';
import axios from 'axios';
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export type Service = ServiceType;

export interface CreateServiceData {
  name: string;
  description: string;
  price: number;
  duration: number;
  categoryId: number;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  categoryId?: number;
}

export interface CreateServiceDto {
  name: string;
  description: string;
  price: number;
  duration: number;
  active?: boolean;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  active?: boolean;
}

type BuilderType = EndpointBuilder<any, any, any>;

export const serviceApi = api.injectEndpoints({
  endpoints: (builder: BuilderType) => ({
    getServices: builder.query<PaginatedResponse<Service>, void>({
      query: () => `${API_URL}/services`,
      providesTags: ['Service'],
    }),

    getService: builder.query<Service, number>({
      query: (id: number) => `${API_URL}/services/${id}`,
      providesTags: (_result: Service | undefined, _error: unknown, id: number) => [
        { type: 'Service', id },
      ],
    }),

    createService: builder.mutation<Service, CreateServiceData>({
      query: (data: CreateServiceData) => ({
        url: `${API_URL}/services`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Service'],
    }),

    updateService: builder.mutation<Service, { id: number; service: UpdateServiceData }>({
      query: ({ id, service }) => ({
        url: `${API_URL}/services/${id}`,
        method: 'PUT',
        data: service,
      }),
      invalidatesTags: (_result: Service | undefined, _error: unknown, { id }: { id: number }) => [
        { type: 'Service', id },
      ],
    }),

    deleteService: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `${API_URL}/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),

    getServicesByCategory: builder.query<Service[], number>({
      query: (categoryId: number) => `${API_URL}/services/category/${categoryId}`,
      providesTags: ['Service'],
    }),

    getActiveServices: builder.query<Service[], void>({
      query: () => `${API_URL}/services/active`,
      providesTags: ['Service'],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetServicesByCategoryQuery,
  useGetActiveServicesQuery,
} = serviceApi;

export const getServices = async (): Promise<Service[]> => {
  const response = await axios.get<ApiResponse<Service[]>>(`${API_URL}/services`);
  return response.data.data;
};

export const getService = async (id: number): Promise<Service> => {
  const response = await axios.get<ApiResponse<Service>>(`${API_URL}/services/${id}`);
  return response.data.data;
};

export const createService = async (service: Omit<Service, 'id'>): Promise<Service> => {
  const response = await axios.post<ApiResponse<Service>>(`${API_URL}/services`, service);
  return response.data.data;
};

export const updateService = async (id: number, service: Partial<Service>): Promise<Service> => {
  const response = await axios.put<ApiResponse<Service>>(`${API_URL}/services/${id}`, service);
  return response.data.data;
};

export const deleteService = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/services/${id}`);
};

export const getServicesByCategory = async (categoryId: number): Promise<Service[]> => {
  const response = await axios.get<ApiResponse<Service[]>>(
    `${API_URL}/services/category/${categoryId}`
  );
  return response.data.data;
};

export const getActiveServices = async (): Promise<Service[]> => {
  const response = await axios.get<ApiResponse<Service[]>>(`${API_URL}/services/active`);
  return response.data.data;
};

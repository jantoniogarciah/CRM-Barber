import { api } from './api';
import {
  Service as ServiceType,
  ApiResponse,
  PaginatedResponse,
} from './types';
import axios from 'axios';
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export type Service = ServiceType;

export interface CreateServiceData {
  name: string;
  description: string;
  duration: number;
  price: number;
  categoryId: number;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  active?: boolean;
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
    getServices: builder.query<Service[], void>({
      query: () => '/services',
      providesTags: ['Service'],
    }),

    getService: builder.query<Service, number>({
      query: (id: number) => `/services/${id}`,
      providesTags: (
        _result: Service | undefined,
        _error: unknown,
        id: number
      ) => [{ type: 'Service', id }],
    }),

    createService: builder.mutation<Service, CreateServiceDto>({
      query: (service: CreateServiceDto) => ({
        url: '/services',
        method: 'POST',
        body: service,
      }),
      invalidatesTags: ['Service'],
    }),

    updateService: builder.mutation<
      Service,
      { id: number; service: UpdateServiceDto }
    >({
      query: ({ id, service }: { id: number; service: UpdateServiceDto }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: service,
      }),
      invalidatesTags: (
        _result: Service | undefined,
        _error: unknown,
        { id }: { id: number }
      ) => [{ type: 'Service', id }],
    }),

    deleteService: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Service'],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApi;

export const getServices = async (): Promise<PaginatedResponse<Service>> => {
  const response = await axios.get<PaginatedResponse<Service>>(
    `${API_URL}/services`
  );
  return response.data;
};

export const getService = async (id: number): Promise<Service> => {
  const response = await axios.get<ApiResponse<Service>>(
    `${API_URL}/services/${id}`
  );
  return response.data.data;
};

export const createService = async (
  data: CreateServiceData
): Promise<Service> => {
  const response = await axios.post<ApiResponse<Service>>(
    `${API_URL}/services`,
    data
  );
  return response.data.data;
};

export const updateService = async (
  id: number,
  data: UpdateServiceData
): Promise<Service> => {
  const response = await axios.patch<ApiResponse<Service>>(
    `${API_URL}/services/${id}`,
    data
  );
  return response.data.data;
};

export const deleteService = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/services/${id}`);
};

export const getServicesByCategory = async (
  categoryId: number
): Promise<Service[]> => {
  const response = await axios.get<ApiResponse<Service[]>>(
    `${API_URL}/services/category/${categoryId}`
  );
  return response.data.data;
};

export const getActiveServices = async (): Promise<Service[]> => {
  const response = await axios.get<ApiResponse<Service[]>>(
    `${API_URL}/services/active`
  );
  return response.data.data;
};

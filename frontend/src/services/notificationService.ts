import { Notification, ApiResponse } from '../types';
import { api } from './api';
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

type BuilderType = EndpointBuilder<any, any, any>;

export interface CreateNotificationDto {
  userId: number;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface UpdateNotificationDto {
  isRead?: boolean;
}

export const notificationApi = api.injectEndpoints({
  endpoints: (builder: BuilderType) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),

    getUnreadCount: builder.query<number, void>({
      query: () => '/notifications/unread/count',
      providesTags: ['Notification'],
    }),

    markAsRead: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read/all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    deleteNotification: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    createNotification: builder.mutation<Notification, CreateNotificationDto>({
      query: (notification) => ({
        url: '/notifications',
        method: 'POST',
        body: notification,
      }),
      invalidatesTags: ['Notification'],
    }),

    createBulkNotifications: builder.mutation<Notification[], CreateNotificationDto[]>({
      query: (notifications) => ({
        url: '/notifications/bulk',
        method: 'POST',
        body: notifications,
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useCreateNotificationMutation,
  useCreateBulkNotificationsMutation,
} = notificationApi;

export default notificationApi;

// These functions are kept for backward compatibility but should be replaced with RTK Query hooks
export const getNotifications = async (): Promise<Notification[]> => {
  const response = await fetch(`${API_URL}/notifications`);
  const data: ApiResponse<Notification[]> = await response.json();
  return data.data;
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PATCH',
  });
};

import { api } from './api';
import { Notification } from './types';
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

type BuilderType = EndpointBuilder<any, any, any>;

export interface CreateNotificationDto {
  userId: number;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface UpdateNotificationDto {
  isRead?: boolean;
}

const notificationApi = api.injectEndpoints({
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

    createBulkNotifications: builder.mutation<
      Notification[],
      CreateNotificationDto[]
    >({
      query: (notifications) => ({
        url: '/notifications/bulk',
        method: 'POST',
        body: notifications,
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export default notificationApi;

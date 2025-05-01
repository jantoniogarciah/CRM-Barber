import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

export interface Notification {
  id: number;
  userId: number;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(
        (notification) => !notification.isRead
      ).length;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
    deleteNotification: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.isRead) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
  },
});

// Actions
export const {
  setNotifications,
  setLoading,
  setError,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = notificationSlice.actions;

// Selectors
export const selectNotifications = (state: RootState) =>
  state.notifications.notifications;
export const selectUnreadCount = (state: RootState) =>
  state.notifications.unreadCount;
export const selectNotificationsLoading = (state: RootState) =>
  state.notifications.loading;
export const selectNotificationsError = (state: RootState) =>
  state.notifications.error;

export default notificationSlice.reducer;

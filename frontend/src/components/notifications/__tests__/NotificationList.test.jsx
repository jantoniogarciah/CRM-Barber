import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationProvider } from '../../../contexts/NotificationContext';
import NotificationList from '../NotificationList';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock useNotifications hook
jest.mock('../../../contexts/NotificationContext', () => ({
  ...jest.requireActual('../../../contexts/NotificationContext'),
  useNotifications: () => ({
    notifications: [
      {
        id: 1,
        title: 'Test Notification 1',
        message: 'Test message 1',
        type: 'info',
        isRead: false,
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        title: 'Test Notification 2',
        message: 'Test message 2',
        type: 'warning',
        isRead: true,
        created_at: '2024-01-02T00:00:00Z',
      },
    ],
    loading: false,
    error: null,
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
  }),
}));

describe('NotificationList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notifications correctly', () => {
    render(
      <NotificationProvider>
        <NotificationList />
      </NotificationProvider>
    );

    expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
    expect(screen.getByText('Test message 1')).toBeInTheDocument();
    expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
    expect(screen.getByText('Test message 2')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    jest
      .spyOn(require('../../../contexts/NotificationContext'), 'useNotifications')
      .mockImplementation(() => ({
        notifications: [],
        loading: true,
        error: null,
        markAllAsRead: jest.fn(),
        deleteNotification: jest.fn(),
      }));

    render(
      <NotificationProvider>
        <NotificationList />
      </NotificationProvider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state', () => {
    const errorMessage = 'Failed to load notifications';
    jest
      .spyOn(require('../../../contexts/NotificationContext'), 'useNotifications')
      .mockImplementation(() => ({
        notifications: [],
        loading: false,
        error: errorMessage,
        markAllAsRead: jest.fn(),
        deleteNotification: jest.fn(),
      }));

    render(
      <NotificationProvider>
        <NotificationList />
      </NotificationProvider>
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    jest
      .spyOn(require('../../../contexts/NotificationContext'), 'useNotifications')
      .mockImplementation(() => ({
        notifications: [],
        loading: false,
        error: null,
        markAllAsRead: jest.fn(),
        deleteNotification: jest.fn(),
      }));

    render(
      <NotificationProvider>
        <NotificationList />
      </NotificationProvider>
    );

    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
  });

  it('handles notification selection', () => {
    render(
      <NotificationProvider>
        <NotificationList />
      </NotificationProvider>
    );

    const notification = screen.getByText('Test Notification 1').closest('li');
    fireEvent.click(notification);

    expect(notification).toHaveClass('Mui-selected');
  });

  it('handles mark all as read', () => {
    const markAllAsRead = jest.fn();
    jest
      .spyOn(require('../../../contexts/NotificationContext'), 'useNotifications')
      .mockImplementation(() => ({
        notifications: [
          {
            id: 1,
            title: 'Test Notification',
            message: 'Test message',
            type: 'info',
            isRead: false,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        loading: false,
        error: null,
        markAllAsRead,
        deleteNotification: jest.fn(),
      }));

    render(
      <NotificationProvider>
        <NotificationList />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByText('Mark All as Read'));
    expect(markAllAsRead).toHaveBeenCalled();
  });
});

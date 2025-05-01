import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { NotificationProvider } from '../../../contexts/NotificationContext';
import NotificationToast from '../NotificationToast';

// Mock useNotifications hook
jest.mock('../../../contexts/NotificationContext', () => ({
  ...jest.requireActual('../../../contexts/NotificationContext'),
  useNotifications: () => ({
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
  }),
}));

describe('NotificationToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders notification toast with correct content', () => {
    render(
      <NotificationProvider>
        <NotificationToast />
      </NotificationProvider>
    );

    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('closes toast after autoHideDuration', async () => {
    render(
      <NotificationProvider>
        <NotificationToast />
      </NotificationProvider>
    );

    expect(screen.getByText('Test Notification')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(6000); // Default autoHideDuration
    });

    await waitFor(() => {
      expect(screen.queryByText('Test Notification')).not.toBeInTheDocument();
    });
  });

  it('handles different notification types correctly', () => {
    jest
      .spyOn(
        require('../../../contexts/NotificationContext'),
        'useNotifications'
      )
      .mockImplementation(() => ({
        notifications: [
          {
            id: 1,
            title: 'Warning Notification',
            message: 'Warning message',
            type: 'warning',
            isRead: false,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        loading: false,
        error: null,
      }));

    render(
      <NotificationProvider>
        <NotificationToast />
      </NotificationProvider>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-standardWarning');
  });

  it('does not show toast when there are no unread notifications', () => {
    jest
      .spyOn(
        require('../../../contexts/NotificationContext'),
        'useNotifications'
      )
      .mockImplementation(() => ({
        notifications: [
          {
            id: 1,
            title: 'Read Notification',
            message: 'Read message',
            type: 'info',
            isRead: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        loading: false,
        error: null,
      }));

    render(
      <NotificationProvider>
        <NotificationToast />
      </NotificationProvider>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

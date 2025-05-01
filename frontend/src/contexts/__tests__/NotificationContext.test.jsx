import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '../NotificationContext';
import axios from 'axios';
import { io } from 'socket.io-client';

// Mock axios
jest.mock('axios');

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  return {
    io: jest.fn(() => ({
      on: jest.fn(),
      close: jest.fn(),
    })),
  };
});

// Test component that uses the notification context
const TestComponent = () => {
  const { notifications, loading, error } = useNotifications();
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error}</div>
      <div data-testid="notifications">
        {notifications.map((n) => (
          <div key={n.id}>{n.title}</div>
        ))}
      </div>
    </div>
  );
};

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch notifications on mount', async () => {
    const mockNotifications = [
      { id: 1, title: 'Test 1' },
      { id: 2, title: 'Test 2' },
    ];

    axios.get.mockResolvedValueOnce({ data: mockNotifications });

    const { getByTestId } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    expect(getByTestId('loading')).toHaveTextContent('true');
    expect(axios.get).toHaveBeenCalledWith('/api/notifications');

    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('false');
      expect(getByTestId('notifications')).toHaveTextContent('Test 1');
      expect(getByTestId('notifications')).toHaveTextContent('Test 2');
    });
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch notifications';
    axios.get.mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    const { getByTestId } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(getByTestId('error')).toHaveTextContent(errorMessage);
    });
  });

  it('should initialize socket connection', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        transports: ['websocket'],
        autoConnect: true,
      })
    );
  });
});

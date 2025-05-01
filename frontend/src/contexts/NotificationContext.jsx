import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(
      process.env.REACT_APP_API_URL || 'http://localhost:3001',
      {
        transports: ['websocket'],
        autoConnect: true,
      }
    );

    newSocket.on('connect', () => {
      console.log('Connected to notification socket');
    });

    newSocket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notification socket');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/notifications');
        setNotifications(response.data);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to fetch notifications'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to mark notification as read'
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to mark all notifications as read'
      );
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete notification');
    }
  };

  const value = {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

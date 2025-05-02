import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const NotificationContext = createContext(null);

if (!NotificationContext) {
  throw new Error('useNotifications must be used within a NotificationProvider');
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true,
      auth: {
        token: token,
      },
    });

    newSocket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotifications(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.put(`/api/notifications/${id}/read`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.put('/api/notifications/read-all', null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`/api/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
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

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationContext;

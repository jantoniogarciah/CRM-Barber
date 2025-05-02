import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const socket = io(API_URL);

export const getNotifications = async () => {
  const response = await axios.get(`${API_URL}/notifications`);
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  await axios.put(`${API_URL}/notifications/${id}/read`);
};

export const subscribeToNotifications = (callback) => {
  socket.on('notification', (notification) => {
    callback(notification);
  });
};

export const unsubscribeFromNotifications = () => {
  socket.off('notification');
};

class NotificationService {
  constructor() {
    this.socket = null;
    this.listeners = new Set();
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  connect() {
    if (this.socket) {
      return;
    }

    this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.notifyListeners({ type: 'connection', status: 'connected' });
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.connected = false;
      this.notifyListeners({ type: 'connection', status: 'disconnected' });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 5000);
      this.notifyListeners({
        type: 'connection',
        status: 'reconnecting',
        attempt: attemptNumber,
      });
    });

    this.socket.on('reconnect_failed', () => {
      console.log('Failed to reconnect to WebSocket');
      this.notifyListeners({
        type: 'connection',
        status: 'failed',
        message: 'Failed to connect to notification service',
      });
    });

    this.socket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      this.notifyListeners({ type: 'notification', data: notification });
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.notifyListeners({
        type: 'error',
        message: 'Error in notification service',
        error,
      });
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(event) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Helper method to check if the service is connected
  isConnected() {
    return this.connected;
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService;

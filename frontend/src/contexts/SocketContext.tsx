import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification, User } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: React.ReactNode;
  user: User | null;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, user }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = () => {
    if (socket?.connected || !user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        token,
      },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message);
    });

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setError(null);
    }
  };

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, error, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const useSocketNotification = (callback: (notification: Notification) => void) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('notification', callback);

    return () => {
      socket.off('notification', callback);
    };
  }, [socket, isConnected, callback]);
};

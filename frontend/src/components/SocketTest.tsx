import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useSocket } from '../contexts/SocketContext';
import { useSocketNotification } from '../contexts/SocketContext';
import { Notification } from '../types';

export const SocketTest: React.FC = () => {
  const { socket, isConnected, error } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastNotification, setLastNotification] = useState<Notification | null>(null);

  // Subscribe to notifications
  useSocketNotification((notification) => {
    setLastNotification(notification);
    setNotifications((prev) => [notification, ...prev]);
  });

  const handleEmitTest = () => {
    if (socket && isConnected) {
      socket.emit('test', { message: 'Test message from client' });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Socket Connection Status
        </Typography>
        <Typography>
          Status: {isConnected ? 'Connected' : error ? `Error: ${error}` : 'Disconnected'}
        </Typography>
        <Button
          variant="contained"
          onClick={handleEmitTest}
          disabled={!isConnected}
          sx={{ mt: 2 }}
        >
          Send Test Message
        </Button>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Last Notification
        </Typography>
        {lastNotification ? (
          <Box>
            <Typography>Type: {lastNotification.type}</Typography>
            <Typography>Message: {lastNotification.message}</Typography>
            <Typography>Time: {new Date(lastNotification.createdAt).toLocaleString()}</Typography>
          </Box>
        ) : (
          <Typography>No notifications received yet</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Notification History
        </Typography>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <Box key={index} sx={{ mb: 1, p: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2">
                {new Date(notification.createdAt).toLocaleString()}
              </Typography>
              <Typography>{notification.message}</Typography>
            </Box>
          ))
        ) : (
          <Typography>No notifications in history</Typography>
        )}
      </Paper>
    </Box>
  );
}; 
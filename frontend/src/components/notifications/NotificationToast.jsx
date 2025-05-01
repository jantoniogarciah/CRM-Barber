import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Stack } from '@mui/material';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationToast = () => {
  const { notifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    // Show the most recent unread notification
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length > 0) {
      setCurrentNotification(unreadNotifications[0]);
      setOpen(true);
    }
  }, [notifications]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const getSeverity = (type) => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={getSeverity(currentNotification.type)}
          sx={{ width: '100%' }}
          variant="filled"
          elevation={6}
        >
          <div>
            <strong>{currentNotification.title}</strong>
            <p>{currentNotification.message}</p>
          </div>
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default NotificationToast;

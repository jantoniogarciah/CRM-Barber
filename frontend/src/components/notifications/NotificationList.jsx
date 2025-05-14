import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import { format } from 'date-fns';

const NotificationList = () => {
  const { notifications, loading, error, markAllAsRead, deleteNotification } = useNotifications();

  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <EventIcon />;
      case 'client':
        return <PersonIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map((n) => n.id));
    }
  };

  const handleSelectNotification = (id) => {
    setSelectedNotifications((prev) => {
      if (prev.includes(id)) {
        return prev.filter((n) => n !== id);
      }
      return [...prev, id];
    });
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedNotifications) {
      await deleteNotification(id);
    }
    setSelectedNotifications([]);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          Notifications
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={handleSelectAll}
            disabled={notifications.length === 0}
          >
            {selectedNotifications.length === notifications.length ? 'Deselect All' : 'Select All'}
          </Button>
          <Button variant="outlined" onClick={markAllAsRead} disabled={notifications.length === 0}>
            Mark All as Read
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSelected}
            disabled={selectedNotifications.length === 0}
          >
            Delete Selected
          </Button>
        </Stack>
      </Box>

      {notifications.length === 0 ? (
        <Box textAlign="center" py={4}>
          <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography color="text.secondary">No notifications yet</Typography>
        </Box>
      ) : (
        <List>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                selected={selectedNotifications.includes(notification.id)}
                onClick={() => handleSelectNotification(notification.id)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">{notification.title}</Typography>
                      {!notification.isRead && <Chip label="New" size="small" color="primary" />}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(notification.created_at), 'PPpp')}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default NotificationList;

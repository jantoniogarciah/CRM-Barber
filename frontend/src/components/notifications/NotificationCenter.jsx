import React, { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Delete as DeleteIcon,
  WifiOff as DisconnectedIcon,
  Wifi as ConnectedIcon,
} from '@mui/icons-material';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const {
    notifications,
    connectionStatus,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isConnected,
  } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <EventIcon color="primary" />;
      case 'client':
        return <PersonIcon color="info" />;
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment':
        return 'primary';
      case 'client':
        return 'info';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatNotificationDate = (date) => {
    const parsedDate = parseISO(date);
    if (isToday(parsedDate)) {
      return 'Today';
    }
    if (isYesterday(parsedDate)) {
      return 'Yesterday';
    }
    return format(parsedDate, 'MMM d, yyyy');
  };

  const getConnectionStatusIcon = () => {
    if (connectionStatus === 'connected') {
      return <ConnectedIcon color="success" />;
    } else if (connectionStatus === 'disconnected') {
      return <DisconnectedIcon color="error" />;
    } else {
      return <CircularProgress size={20} />;
    }
  };

  return (
    <Box>
      <Tooltip title={isConnected ? 'Connected' : 'Disconnected'}>
        <IconButton color="inherit" onClick={handleClick}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 500 },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Notifications</Typography>
            {getConnectionStatusIcon()}
          </Box>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />

        {error && (
          <Alert severity="error" sx={{ m: 1 }}>
            {error}
          </Alert>
        )}

        {connectionStatus === 'disconnected' && (
          <Alert severity="warning" sx={{ m: 1 }}>
            Notifications are currently offline. Some updates may be delayed.
          </Alert>
        )}

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.isRead
                      ? 'transparent'
                      : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography variant="body2">
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.type}
                          size="small"
                          color={getNotificationColor(notification.type)}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatNotificationDate(notification.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    {!notification.isRead && (
                      <Button
                        size="small"
                        onClick={() => markAsRead(notification.id)}
                        sx={{ mr: 1 }}
                      >
                        Mark as read
                      </Button>
                    )}
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
    </Box>
  );
};

export default NotificationCenter;

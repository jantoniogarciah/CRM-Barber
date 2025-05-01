# Notification System Documentation

## Overview

The notification system provides real-time notifications to users in the Barber Shop CRM application. It consists of both frontend and backend components that work together to deliver a seamless notification experience.

## Features

- Real-time notifications using WebSocket
- Toast notifications for immediate feedback
- Notification center for managing all notifications
- Support for different notification types (info, success, warning, error, appointment, client)
- Mark as read/unread functionality
- Bulk actions (mark all as read, delete selected)
- Notification history

## Architecture

### Frontend Components

1. **NotificationContext** (`frontend/src/contexts/NotificationContext.jsx`)
   - Manages notification state
   - Handles WebSocket connection
   - Provides notification actions (mark as read, delete, etc.)

2. **NotificationList** (`frontend/src/components/notifications/NotificationList.jsx`)
   - Displays all notifications
   - Supports selection and bulk actions
   - Shows loading and error states

3. **NotificationToast** (`frontend/src/components/notifications/NotificationToast.jsx`)
   - Shows real-time notifications as toasts
   - Auto-dismisses after a configurable duration
   - Supports different notification types

4. **NotificationCenter** (`frontend/src/components/notifications/NotificationCenter.jsx`)
   - Quick access to notifications
   - Shows unread count
   - Provides quick actions

### Backend Components

1. **Notification Routes** (`backend/src/routes/notificationRoutes.js`)
   - GET `/`: Fetch all notifications
   - PUT `/:id/read`: Mark as read
   - PUT `/read-all`: Mark all as read
   - DELETE `/:id`: Delete notification
   - POST `/`: Create notification (admin only)

2. **WebSocket Server** (`backend/src/config/websocket.js`)
   - Handles real-time connections
   - Manages user-specific rooms
   - Authenticates connections

## Database Schema

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Examples

### 1. Creating Notifications

#### Backend Example

```javascript
// Creating a notification for a new appointment
const createAppointmentNotification = async (userId, appointment) => {
  const notification = {
    user_id: userId,
    title: 'New Appointment Scheduled',
    message: `Appointment scheduled for ${format(appointment.date, 'PPp')}`,
    type: 'appointment',
    data: {
      appointmentId: appointment.id,
      clientName: appointment.client_name,
      date: appointment.date,
      service: appointment.service_name
    }
  };

  const [created] = await db('notifications').insert(notification).returning('*');
  io.to(`user_${userId}`).emit('notification', created);
};

// Creating a notification for client updates
const createClientUpdateNotification = async (userId, client, field) => {
  const notification = {
    user_id: userId,
    title: 'Client Information Updated',
    message: `Client ${client.first_name} ${client.last_name}'s ${field} has been updated`,
    type: 'client',
    data: {
      clientId: client.id,
      field,
      updatedAt: new Date()
    }
  };

  const [created] = await db('notifications').insert(notification).returning('*');
  io.to(`user_${userId}`).emit('notification', created);
};
```

#### Frontend Example

```javascript
// Using the notification context in a component
import { useNotifications } from '../contexts/NotificationContext';

function AppointmentForm({ onSubmit }) {
  const { notifications } = useNotifications();

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data);
      // Notification will be handled by the backend
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  return (
    // Form implementation
  );
}
```

### 2. Displaying Notifications

#### Notification List Example

```javascript
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationList } from '../components/notifications';

function NotificationsPage() {
  const { notifications, loading, error } = useNotifications();

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4">Notifications</Typography>
      <NotificationList notifications={notifications} />
    </Box>
  );
}
```

#### Toast Notification Example

```javascript
import { NotificationToast } from '../components/notifications';

function App() {
  return (
    <>
      {/* Other components */}
      <NotificationToast />
    </>
  );
}
```

### 3. Handling Notification Actions

```javascript
function NotificationActions({ notification }) {
  const { markAsRead, deleteNotification } = useNotifications();

  const handleMarkAsRead = async () => {
    try {
      await markAsRead(notification.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNotification(notification.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <Box>
      {!notification.is_read && (
        <Button onClick={handleMarkAsRead}>
          Mark as Read
        </Button>
      )}
      <Button onClick={handleDelete} color="error">
        Delete
      </Button>
    </Box>
  );
}
```

### 4. WebSocket Integration

```javascript
// In NotificationContext.jsx
useEffect(() => {
  const socket = io(process.env.REACT_APP_WS_URL, {
    auth: {
      token: localStorage.getItem('token')
    }
  });

  socket.on('notification', (newNotification) => {
    setNotifications(prev => [newNotification, ...prev]);
  });

  socket.on('connect', () => {
    console.log('Connected to notification service');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from notification service');
  });

  return () => {
    socket.disconnect();
  };
}, []);
```

## Testing

The notification system includes comprehensive tests:

- `NotificationContext.test.jsx`: Tests context functionality
- `NotificationList.test.jsx`: Tests list component
- `NotificationToast.test.jsx`: Tests toast component

Run tests with:
```bash
npm test
```

## Best Practices

1. **Notification Types**
   - Use appropriate types for different notifications
   - Keep messages clear and concise
   - Include relevant data in the `data` field

2. **Performance**
   - Limit notification history
   - Clean up old notifications
   - Use pagination for large lists

3. **Security**
   - Validate user permissions
   - Sanitize notification content
   - Use secure WebSocket connections

4. **User Experience**
   - Don't overwhelm users with too many notifications
   - Use appropriate notification types
   - Provide clear actions for notifications

## Troubleshooting

Common issues and solutions:

1. **WebSocket Connection Issues**
   - Check CORS configuration
   - Verify authentication token
   - Check network connectivity

2. **Missing Notifications**
   - Verify user permissions
   - Check notification creation
   - Verify WebSocket connection

3. **Performance Issues**
   - Implement pagination
   - Clean up old notifications
   - Optimize database queries

## Contributing

When adding new features to the notification system:

1. Follow the existing architecture
2. Add appropriate tests
3. Update documentation
4. Follow security best practices
5. Consider performance implications 
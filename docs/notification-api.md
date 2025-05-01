# Notification API Documentation

## Overview

This document provides detailed information about the notification API endpoints, including request/response formats, authentication requirements, and examples.

## Base URL

```
http://localhost:3001/api/notifications
```

## Authentication

All endpoints require authentication using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Get All Notifications

Retrieves all notifications for the authenticated user.

```
GET /
```

#### Response

```json
[
  {
    "id": 1,
    "user_id": 123,
    "title": "New Appointment",
    "message": "You have a new appointment scheduled for tomorrow",
    "type": "appointment",
    "is_read": false,
    "data": {
      "appointmentId": 456,
      "clientName": "John Doe",
      "date": "2024-03-15T10:00:00Z"
    },
    "created_at": "2024-03-14T15:30:00Z",
    "updated_at": "2024-03-14T15:30:00Z"
  },
  {
    "id": 2,
    "user_id": 123,
    "title": "Client Update",
    "message": "Client information has been updated",
    "type": "client",
    "is_read": true,
    "data": {
      "clientId": 789,
      "field": "phone"
    },
    "created_at": "2024-03-13T09:15:00Z",
    "updated_at": "2024-03-13T09:15:00Z"
  }
]
```

### Mark Notification as Read

Marks a specific notification as read.

```
PUT /:id/read
```

#### Parameters

| Name | Type   | Description        |
|------|--------|--------------------|
| id   | number | Notification ID    |

#### Response

```json
{
  "message": "Notification marked as read"
}
```

### Mark All Notifications as Read

Marks all notifications for the authenticated user as read.

```
PUT /read-all
```

#### Response

```json
{
  "message": "All notifications marked as read"
}
```

### Delete Notification

Deletes a specific notification.

```
DELETE /:id
```

#### Parameters

| Name | Type   | Description        |
|------|--------|--------------------|
| id   | number | Notification ID    |

#### Response

```json
{
  "message": "Notification deleted"
}
```

### Create Notification (Admin Only)

Creates a new notification for a specific user.

```
POST /
```

#### Request Body

| Field    | Type   | Required | Description                    |
|----------|--------|----------|--------------------------------|
| user_id  | number | Yes      | ID of the user to notify       |
| title    | string | Yes      | Notification title             |
| message  | string | Yes      | Notification message           |
| type     | string | Yes      | Type of notification           |
| data     | object | No       | Additional data (JSON)         |

#### Valid Notification Types

- `info`: General information
- `success`: Success message
- `warning`: Warning message
- `error`: Error message
- `appointment`: Appointment-related
- `client`: Client-related

#### Example Request

```json
{
  "user_id": 123,
  "title": "Appointment Reminder",
  "message": "You have an appointment tomorrow at 10:00 AM",
  "type": "appointment",
  "data": {
    "appointmentId": 456,
    "clientName": "John Doe",
    "date": "2024-03-15T10:00:00Z"
  }
}
```

#### Response

```json
{
  "id": 3,
  "user_id": 123,
  "title": "Appointment Reminder",
  "message": "You have an appointment tomorrow at 10:00 AM",
  "type": "appointment",
  "is_read": false,
  "data": {
    "appointmentId": 456,
    "clientName": "John Doe",
    "date": "2024-03-15T10:00:00Z"
  },
  "created_at": "2024-03-14T16:45:00Z",
  "updated_at": "2024-03-14T16:45:00Z"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "message": "Invalid notification ID"
}
```

### 401 Unauthorized

```json
{
  "message": "Authentication error"
}
```

### 403 Forbidden

```json
{
  "message": "Only admins can create notifications"
}
```

### 404 Not Found

```json
{
  "message": "Notification not found"
}
```

### 500 Internal Server Error

```json
{
  "message": "Error fetching notifications"
}
```

## WebSocket Events

### Connection

Connect to the WebSocket server with authentication:

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Receiving Notifications

Listen for new notifications:

```javascript
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

### Connection Events

```javascript
socket.on('connect', () => {
  console.log('Connected to notification service');
});

socket.on('disconnect', () => {
  console.log('Disconnected from notification service');
});
``` 
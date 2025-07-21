import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
  Link,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  ContentCut as ServiceIcon,
  AccessTime as TimeIcon,
  CalendarToday as DateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  EventBusy as NoShowIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import axios from 'axios';

const AppointmentDetails = ({ appointment, onClose, onEdit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no-show':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon />;
      case 'cancelled':
        return <CancelledIcon />;
      case 'no-show':
        return <NoShowIcon />;
      default:
        return null;
    }
  };

  const getDateLabel = (date) => {
    const parsedDate = parseISO(date);
    if (isToday(parsedDate)) {
      return 'Today';
    }
    if (isTomorrow(parsedDate)) {
      return 'Tomorrow';
    }
    return format(parsedDate, 'MMMM d, yyyy');
  };

  const formatPhoneForWhatsApp = (phone) => {
    // Remove any non-numeric characters
    return phone.replace(/\D/g, '');
  };

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    setError('');

    try {
      await axios.put(`/api/appointments/${appointment.id}`, {
        ...appointment,
        status: newStatus,
      });
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update appointment status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.delete(`/api/appointments/${appointment.id}`);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete appointment');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Appointment Details</Typography>
          <Chip
            label={appointment.status}
            color={getStatusColor(appointment.status)}
            icon={getStatusIcon(appointment.status)}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Client Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${appointment.client.firstName} ${appointment.client.lastName}`}
                    secondary={appointment.client.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TimeIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Teléfono" 
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {appointment.client.phone}
                        <Tooltip title="Enviar mensaje por WhatsApp">
                          <Link
                            href={`https://wa.me/${formatPhoneForWhatsApp(appointment.client.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <IconButton size="small" color="success">
                              <WhatsAppIcon />
                            </IconButton>
                          </Link>
                        </Tooltip>
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Service Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ServiceIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={appointment.service.name}
                    secondary={`Duration: ${appointment.service.duration} minutes`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Barber"
                    secondary={`${appointment.barber.firstName} ${appointment.barber.lastName}`}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Appointment Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DateIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={getDateLabel(appointment.date)}
                    secondary={format(parseISO(`2000-01-01T${appointment.time}`), 'h:mm a')}
                  />
                </ListItem>
                {appointment.notes && (
                  <ListItem>
                    <ListItemText primary="Notes" secondary={appointment.notes} />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {appointment.status === 'scheduled' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleStatusChange('completed')}
                disabled={loading}
              >
                Mark as Completed
              </Button>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => handleStatusChange('no-show')}
                disabled={loading}
              >
                Mark as No-Show
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleStatusChange('cancelled')}
                disabled={loading}
              >
                Cancel Appointment
              </Button>
            </>
          )}
          <Button startIcon={<EditIcon />} onClick={onEdit} disabled={loading}>
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            color="error"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
          >
            Delete
          </Button>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </DialogActions>

      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this appointment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AppointmentDetails;

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
import { es } from 'date-fns/locale';
import axios from 'axios';
import { Appointment } from '../types';

interface AppointmentDetailsProps {
  appointment: Appointment | null;
  onClose: () => void;
  onEdit: (appointment: Appointment) => void;
  open: boolean;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({ 
  appointment, 
  onClose, 
  onEdit,
  open 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!appointment) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon fontSize="small" />;
      case 'cancelled':
        return <CancelledIcon fontSize="small" />;
      case 'pending':
        return <NoShowIcon fontSize="small" />;
      default:
        return undefined;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) {
        return 'Hoy';
      }
      if (isTomorrow(date)) {
        return 'Mañana';
      }
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    setError('');

    try {
      await axios.put(`/api/appointments/${appointment.id}`, {
        ...appointment,
        status: newStatus,
      });
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al actualizar el estado de la cita');
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
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar la cita');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Detalles de la Cita</Typography>
          <Chip
            label={getStatusLabel(appointment.status)}
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
                Información del Cliente
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`}
                    secondary={appointment.client?.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TimeIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Teléfono" 
                    secondary={
                      appointment.client?.phone && (
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
                      )
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Detalles del Servicio
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ServiceIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={appointment.service?.name}
                    secondary={appointment.service?.duration ? `Duración: ${appointment.service.duration} minutos` : null}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Barbero"
                    secondary={`${appointment.barber?.firstName || ''} ${appointment.barber?.lastName || ''}`}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Detalles de la Cita
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DateIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={formatDate(appointment.date)}
                    secondary={appointment.time}
                  />
                </ListItem>
                {appointment.notes && (
                  <ListItem>
                    <ListItemText primary="Notas" secondary={appointment.notes} />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {appointment.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleStatusChange('completed')}
                disabled={loading}
              >
                Marcar como Completada
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleStatusChange('cancelled')}
                disabled={loading}
              >
                Cancelar Cita
              </Button>
            </>
          )}
          <Button 
            startIcon={<EditIcon />} 
            onClick={() => onEdit(appointment)} 
            disabled={loading}
          >
            Editar
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            color="error"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
          >
            Eliminar
          </Button>
          <Button onClick={onClose}>Cerrar</Button>
        </Box>
      </DialogActions>

      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AppointmentDetails; 
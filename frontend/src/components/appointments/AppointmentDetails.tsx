import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
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
import { Appointment } from '../../types';
import { useDeleteAppointmentMutation } from '../../services/api';
import { toast } from 'react-hot-toast';

interface AppointmentDetailsProps {
  appointment: Appointment;
  onClose: () => void;
  onEdit: () => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
  appointment,
  onClose,
  onEdit,
}) => {
  const [deleteAppointment, { isLoading }] = useDeleteAppointmentMutation();

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
        return <CompletedIcon />;
      case 'cancelled':
        return <CancelledIcon />;
      case 'no-show':
        return <NoShowIcon />;
      default:
        return undefined;
    }
  };

  const getDateLabel = (date: string) => {
    const parsedDate = parseISO(date);
    if (isToday(parsedDate)) {
      return 'Hoy';
    }
    if (isTomorrow(parsedDate)) {
      return 'Mañana';
    }
    return format(parsedDate, 'dd/MM/yyyy');
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const handleDelete = async () => {
    if (window.confirm('¿Está seguro que desea eliminar esta cita?')) {
      try {
        await deleteAppointment(appointment.id).unwrap();
        toast.success('Cita eliminada exitosamente');
        onClose();
      } catch (error: any) {
        console.error('Error al eliminar la cita:', error);
        toast.error(error.data?.message || 'Error al eliminar la cita');
      }
    }
  };

  return (
    <>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Detalles de la Cita</Typography>
          <Box>
            <IconButton onClick={onEdit} title="Editar">
              <EditIcon />
            </IconButton>
            <IconButton onClick={handleDelete} title="Eliminar" disabled={isLoading}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Información de la Cita
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DateIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Fecha"
                    secondary={getDateLabel(appointment.date)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TimeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Hora"
                    secondary={format(parseISO(`2000-01-01T${appointment.time}`), 'HH:mm')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ServiceIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Servicio"
                    secondary={`${appointment.service?.name} - $${appointment.service?.price}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Estado"
                    secondary={
                      <Chip
                        label={appointment.status}
                        color={getStatusColor(appointment.status)}
                        size="small"
                        icon={getStatusIcon(appointment.status) || undefined}
                      />
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Información del Cliente
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Nombre"
                    secondary={`${appointment.client?.firstName} ${appointment.client?.lastName}`}
                  />
                </ListItem>
                {appointment.client?.phone && (
                  <ListItem>
                    <ListItemIcon>
                      <WhatsAppIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Teléfono"
                      secondary={
                        <Link
                          href={`https://wa.me/${formatPhoneForWhatsApp(
                            appointment.client.phone
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {appointment.client.phone}
                        </Link>
                      }
                    />
                  </ListItem>
                )}
                {appointment.client?.email && (
                  <ListItem>
                    <ListItemText
                      primary="Email"
                      secondary={appointment.client.email}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>

          {appointment.notes && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Notas
                </Typography>
                <Typography variant="body1">{appointment.notes}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </>
  );
};

export default AppointmentDetails; 
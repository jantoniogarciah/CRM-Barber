import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  format,
  parseISO,
  isSameDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Appointment } from '../../types';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onViewClick: () => void;
  onEditClick: (appointment: Appointment) => void;
  onDeleteClick: (appointment: Appointment) => void;
  selectedDate: Date;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onViewClick,
  onEditClick,
  onDeleteClick,
  selectedDate,
}) => {
  const getAppointmentsForDate = (date: Date) => {
    return appointments
      .filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        return isSameDay(appointmentDate, date);
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  };

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

  const getStatusText = (status: string) => {
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

  const dayAppointments = getAppointmentsForDate(selectedDate);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
        </Typography>
        
        {dayAppointments.length === 0 ? (
          <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
            No hay citas programadas para este día
          </Typography>
        ) : (
          <List>
            {dayAppointments.map((appointment, index) => (
              <React.Fragment key={appointment.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {appointment.time}
                        </Typography>
                        <Chip
                          size="small"
                          label={getStatusText(appointment.status)}
                          color={getStatusColor(appointment.status)}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {appointment.client?.firstName} {appointment.client?.lastName}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          {appointment.service?.name} - {appointment.barber?.firstName} {appointment.barber?.lastName}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Editar cita">
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => onEditClick(appointment)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar cita">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => onDeleteClick(appointment)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default AppointmentCalendar; 
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Appointment } from '../../types';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onViewClick: (appointment: Appointment) => void;
  onEditClick: (appointment: Appointment) => void;
  onDeleteClick: (appointment: Appointment) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onViewClick,
  onEditClick,
  onDeleteClick,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [openDayDialog, setOpenDayDialog] = useState(false);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setOpenDayDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDayDialog(false);
    setSelectedDate(null);
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((appointment) =>
      isSameDay(parseISO(appointment.date), date)
    );
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

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <IconButton onClick={handlePrevMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
        }}
      >
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <Box
            key={day}
            sx={{
              p: 1,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            {day}
          </Box>
        ))}

        {days.map((date) => {
          const dayAppointments = getAppointmentsForDate(date);
          const isCurrentMonth = isSameMonth(date, currentDate);

          return (
            <Paper
              key={date.toISOString()}
              sx={{
                p: 1,
                cursor: 'pointer',
                opacity: isCurrentMonth ? 1 : 0.5,
                minHeight: 100,
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => handleDateClick(date)}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  textAlign: 'right',
                  mb: 1,
                }}
              >
                {format(date, 'd')}
              </Typography>
              {dayAppointments.slice(0, 3).map((appointment) => (
                <Chip
                  key={appointment.id}
                  label={`${format(parseISO(`2000-01-01T${appointment.time}`), 'HH:mm')} - ${
                    appointment.client?.firstName
                  }`}
                  color={getStatusColor(appointment.status)}
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              ))}
              {dayAppointments.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  +{dayAppointments.length - 3} más
                </Typography>
              )}
            </Paper>
          );
        })}
      </Box>

      <Dialog open={openDayDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDate && format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </DialogTitle>
        <DialogContent>
          {selectedDate && (
            <List>
              {getAppointmentsForDate(selectedDate).map((appointment) => (
                <React.Fragment key={appointment.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${format(
                        parseISO(`2000-01-01T${appointment.time}`),
                        'HH:mm'
                      )} - ${appointment.client?.firstName} ${appointment.client?.lastName}`}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.service?.name}
                          </Typography>
                          <Chip
                            label={appointment.status}
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => onEditClick(appointment)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => onDeleteClick(appointment)}
                        title="Eliminar"
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentCalendar; 
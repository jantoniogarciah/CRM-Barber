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
  onViewClick: () => void;
  onEditClick: (appointment: Appointment) => void;
  onDeleteClick: (appointment: Appointment) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onViewClick,
  onEditClick,
  onDeleteClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <IconButton onClick={handlePrevMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6">
          {format(currentDate, "MMMM yyyy", { locale: es })}
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

        {daysInMonth.map((date) => {
          const dayAppointments = getAppointmentsForDate(date);
          const isCurrentMonth = isSameMonth(date, currentDate);

          return (
            <Paper
              key={date.toString()}
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
                variant="body2"
                sx={{
                  textAlign: 'right',
                  mb: 1,
                }}
              >
                {format(date, 'd')}
              </Typography>
              <Box sx={{ flex: 1 }}>
                {dayAppointments.slice(0, 3).map((appointment) => (
                  <Chip
                    key={appointment.id}
                    label={`${appointment.time} - ${appointment.client?.firstName}`}
                    size="small"
                    color={getStatusColor(appointment.status)}
                    sx={{ mb: 0.5, width: '100%' }}
                  />
                ))}
                {dayAppointments.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    +{dayAppointments.length - 3} más
                  </Typography>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>

      <Dialog open={openDayDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDate && format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedDate &&
              getAppointmentsForDate(selectedDate).map((appointment) => (
                <React.Fragment key={appointment.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${appointment.time} - ${appointment.client?.firstName} ${appointment.client?.lastName}`}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.service?.name}
                          </Typography>
                          <Chip
                            label={getStatusText(appointment.status)}
                            size="small"
                            color={getStatusColor(appointment.status)}
                          />
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Editar">
                        <IconButton
                          edge="end"
                          onClick={() => {
                            onEditClick(appointment);
                            handleCloseDialog();
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          edge="end"
                          onClick={() => {
                            onDeleteClick(appointment);
                            handleCloseDialog();
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AppointmentCalendar; 
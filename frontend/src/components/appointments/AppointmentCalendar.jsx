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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const AppointmentCalendar = ({
  appointments,
  onViewClick,
  onEditClick,
  onDeleteClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDayDialog, setOpenDayDialog] = useState(false);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setOpenDayDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDayDialog(false);
    setSelectedDate(null);
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter((appointment) =>
      isSameDay(parseISO(appointment.date), date)
    );
  };

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

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <Box
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Typography
            key={day}
            variant="subtitle2"
            align="center"
            sx={{ fontWeight: 'bold', p: 1 }}
          >
            {day}
          </Typography>
        ))}
        {days.map((day) => {
          const dayAppointments = getAppointmentsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <Paper
              key={day.toString()}
              elevation={isToday ? 3 : 1}
              sx={{
                p: 1,
                minHeight: 100,
                cursor: 'pointer',
                bgcolor: isToday ? 'primary.light' : 'background.paper',
                opacity: isCurrentMonth ? 1 : 0.5,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => handleDateClick(day)}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isToday ? 'bold' : 'normal',
                  color: isToday ? 'primary.contrastText' : 'text.primary',
                }}
              >
                {format(day, 'd')}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {dayAppointments.map((appointment) => (
                  <Tooltip
                    key={appointment.id}
                    title={`${format(
                      parseISO(`2000-01-01T${appointment.time}`),
                      'h:mm a'
                    )} - ${appointment.client.firstName} ${
                      appointment.client.lastName
                    }`}
                  >
                    <Chip
                      label={`${format(
                        parseISO(`2000-01-01T${appointment.time}`),
                        'h:mm a'
                      )} - ${appointment.client.firstName}`}
                      size="small"
                      color={getStatusColor(appointment.status)}
                      sx={{ mb: 0.5, width: '100%' }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Paper>
          );
        })}
      </Box>
    );
  };

  const renderDayDialog = () => {
    if (!selectedDate) return null;

    const dayAppointments = getAppointmentsForDate(selectedDate);

    return (
      <Dialog
        open={openDayDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Appointments for {format(selectedDate, 'MMMM d, yyyy')}
        </DialogTitle>
        <DialogContent>
          {dayAppointments.length === 0 ? (
            <Typography color="text.secondary">
              No appointments scheduled
            </Typography>
          ) : (
            <List>
              {dayAppointments.map((appointment) => (
                <React.Fragment key={appointment.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${format(
                        parseISO(`2000-01-01T${appointment.time}`),
                        'h:mm a'
                      )} - ${appointment.client.firstName} ${
                        appointment.client.lastName
                      }`}
                      secondary={`${appointment.service.name} with ${appointment.barber.firstName} ${appointment.barber.lastName}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={appointment.status}
                        color={getStatusColor(appointment.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onViewClick(appointment)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onDeleteClick(appointment)}
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
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handlePrevMonth}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, textAlign: 'center' }}>
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        {renderCalendarDays()}
        {renderDayDialog()}
      </Paper>
    </LocalizationProvider>
  );
};

export default AppointmentCalendar;

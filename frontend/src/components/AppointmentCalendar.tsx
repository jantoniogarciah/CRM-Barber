import React from 'react';
import { Box, Card, CardContent, Grid, IconButton, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Appointment } from '../types';

const WORKING_HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

interface AppointmentCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date | null) => void;
  appointments: Appointment[];
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointment: Appointment) => void;
  selectedBarber?: string;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  selectedDate,
  onDateChange,
  appointments = [],
  onEditAppointment,
  onDeleteAppointment,
  selectedBarber,
}) => {
  const getAppointmentsForHour = (hour: number) => {
    return appointments.filter((appointment) => {
      const appointmentHour = parseInt(appointment.time.split(':')[0]);
      return appointmentHour === hour;
    });
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

  return (
    <Box>
      <DatePicker 
        label="Seleccionar fecha" 
        value={selectedDate} 
        onChange={(newDate) => {
          if (newDate) {
            onDateChange(newDate);
          }
        }}
      />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Horario del día {format(selectedDate, 'EEEE dd/MM/yyyy', { locale: es })}
      </Typography>

      <Grid container spacing={2}>
        {WORKING_HOURS.map((hour) => {
          const hourAppointments = getAppointmentsForHour(hour);
          return (
            <Grid item xs={12} key={hour}>
              <Card
                sx={{ p: 2, backgroundColor: hourAppointments.length ? '#f5f5f5' : 'transparent' }}
              >
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {`${hour}:00`}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {hourAppointments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      sx={{
                        minWidth: 300,
                        backgroundColor: 'white',
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle2" color="text.secondary">
                            {appointment.time}
                          </Typography>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => onEditAppointment(appointment)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => onDeleteAppointment(appointment)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {appointment.client?.firstName} {appointment.client?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {appointment.service?.name}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {appointment.barber?.firstName} {appointment.barber?.lastName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography
                              variant="body2"
                              color={`${getStatusColor(appointment.status)}.main`}
                            >
                              {getStatusText(appointment.status)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default AppointmentCalendar;

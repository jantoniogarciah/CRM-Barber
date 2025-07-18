import React, { useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Grid,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  NavigateBefore as PrevIcon,
  Today as TodayIcon,
  NavigateNext as NextIcon,
} from '@mui/icons-material';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths, isThisMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Appointment } from '../../types';

interface AppointmentWithRelations extends Appointment {
  barber: {
    id: string;
    firstName: string;
    lastName: string;
    isActive?: boolean;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    status?: string;
  };
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
    isActive?: boolean;
  };
}

interface AppointmentCalendarProps {
  appointments: AppointmentWithRelations[];
  onViewClick: (appointment: AppointmentWithRelations) => void;
  onEditClick: (appointment: AppointmentWithRelations) => void;
  onDeleteClick: (appointment: AppointmentWithRelations) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onViewClick,
  onEditClick,
  onDeleteClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(parseISO(appointment.date), date)
    ).sort((a, b) => a.time.localeCompare(b.time));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h6">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            size="small"
          >
            <PrevIcon />
          </IconButton>
          <IconButton 
            onClick={() => setCurrentDate(new Date())}
            size="small"
            color={isThisMonth(currentDate) ? "primary" : "default"}
          >
            <TodayIcon />
          </IconButton>
          <IconButton 
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            size="small"
          >
            <NextIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {days.map(day => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={day.toISOString()}>
            <Paper
              sx={{
                p: 2,
                height: '100%',
                bgcolor: isSameDay(day, currentDate) ? 'action.selected' : 'background.paper',
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {format(day, 'EEEE d', { locale: es })}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {getAppointmentsForDay(day).map(appointment => (
                  <Paper
                    key={appointment.id}
                    sx={{
                      p: 1,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {format(parseISO(`2000-01-01T${appointment.time}`), 'h:mm a')}
                      </Typography>
                      <Box>
                        <IconButton size="small" onClick={() => onViewClick(appointment)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => onEditClick(appointment)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => onDeleteClick(appointment)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" noWrap>
                      {appointment.client.firstName} {appointment.client.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {appointment.service.name}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        size="small"
                        color={
                          appointment.status === 'completed' ? 'success' :
                          appointment.status === 'confirmed' ? 'info' :
                          appointment.status === 'cancelled' ? 'error' :
                          'warning'
                        }
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AppointmentCalendar; 
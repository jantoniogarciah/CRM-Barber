import React, { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectAppointments, selectLoading, selectError } from '../store/slices/appointmentSlice';
import AppointmentForm from '../components/AppointmentForm';
import { Appointment } from '../types';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';

const Appointments: React.FC = () => {
  const appointments = useAppSelector(selectAppointments);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const [open, setOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();

  const handleOpen = (appointment?: Appointment) => {
    setSelectedAppointment(appointment);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAppointment(undefined);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Appointments</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          New Appointment
        </Button>
      </Box>
      <AppointmentForm open={open} onClose={handleClose} appointment={selectedAppointment} />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.client?.name}</TableCell>
                <TableCell>{appointment.service?.name}</TableCell>
                <TableCell>{appointment.date}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>{appointment.status}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen(appointment)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Appointments;

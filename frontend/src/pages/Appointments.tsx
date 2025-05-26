import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGetAppointmentsQuery, useDeleteAppointmentMutation } from '../services/api';
import { Appointment } from '../types';
import AppointmentForm from '../components/AppointmentForm';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'error',
} as const;

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
} as const;

export const Appointments = () => {
  const [openForm, setOpenForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [openDelete, setOpenDelete] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | undefined>();

  const { data: appointments = [], isLoading, refetch } = useGetAppointmentsQuery();
  const [deleteAppointment] = useDeleteAppointmentMutation();

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setOpenForm(true);
  };

  const handleDelete = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (appointmentToDelete?.id) {
      try {
        await deleteAppointment(appointmentToDelete.id.toString());
        refetch();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Error al eliminar la cita');
      }
    }
    setOpenDelete(false);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedAppointment(undefined);
  };

  const handleSuccess = () => {
    refetch();
    handleCloseForm();
  };

  if (isLoading) {
    return (
      <Container>
        <Typography>Cargando citas...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Citas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Nueva Cita
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Servicio</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Notas</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  {appointment.client 
                    ? `${appointment.client.firstName} ${appointment.client.lastName}` 
                    : 'N/A'}
                </TableCell>
                <TableCell>{appointment.service?.name || 'N/A'}</TableCell>
                <TableCell>
                  {format(new Date(appointment.date), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>
                  <Chip
                    label={statusLabels[appointment.status]}
                    color={statusColors[appointment.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>{appointment.notes}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" size="small" onClick={() => handleEdit(appointment)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => handleDelete(appointment)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AppointmentForm
        open={openForm}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
        appointment={selectedAppointment}
      />

      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Cita"
        content="¿Estás seguro de que deseas eliminar esta cita?"
      />
    </Container>
  );
};

export default Appointments;

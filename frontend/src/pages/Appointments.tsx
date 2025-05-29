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
import { toast } from 'react-hot-toast';

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
        toast.success('Cita eliminada exitosamente');
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error('Error al eliminar la cita');
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
    toast.success(
      selectedAppointment
        ? 'Cita actualizada exitosamente'
        : 'Cita creada exitosamente'
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

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
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
          onClick={() => {
            setSelectedAppointment(undefined);
            setOpenForm(true);
          }}
        >
          Nueva Cita
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Barbero</TableCell>
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
            {appointments.map((appointment: any) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  {`${appointment.barber.firstName} ${appointment.barber.lastName}`}
                </TableCell>
                <TableCell>
                  {`${appointment.client.firstName} ${appointment.client.lastName}`}
                </TableCell>
                <TableCell>{appointment.service.name}</TableCell>
                <TableCell>{formatDate(appointment.date)}</TableCell>
                <TableCell>{appointment.time}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(appointment.status)}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{appointment.notes || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(appointment)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(appointment)}
                    color="error"
                  >
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

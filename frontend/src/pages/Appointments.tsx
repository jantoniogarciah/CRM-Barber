import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewList as ViewListIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { Appointment } from '../types';
import AppointmentList from '../components/appointments/AppointmentList';
import AppointmentForm from '../components/AppointmentForm';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { toast } from 'react-hot-toast';
import { PageContainer } from '../components/PageContainer';

type ViewMode = 'list' | 'calendar';

export const Appointments = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [openForm, setOpenForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  const handleAdd = () => {
    setSelectedAppointment(null);
    setOpenForm(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setOpenForm(true);
  };

  const handleDelete = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (appointmentToDelete) {
      try {
        // La lógica de eliminación ahora está en el componente AppointmentList
        setOpenDeleteDialog(false);
        setAppointmentToDelete(null);
        toast.success('Cita eliminada exitosamente');
      } catch (error: any) {
        console.error('Error al eliminar la cita:', error);
        toast.error(error.data?.message || 'Error al eliminar la cita');
      }
    }
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedAppointment(null);
  };

  const handleSuccess = () => {
    handleCloseForm();
    toast.success(selectedAppointment ? 'Cita actualizada correctamente' : 'Cita creada correctamente');
  };

  return (
    <PageContainer>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5" component="h1">
              Citas
            </Typography>
          </Grid>
          <Grid item>
            <Box display="flex" gap={2}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="list" title="Vista de Lista">
                  <ViewListIcon />
                </ToggleButton>
                <ToggleButton value="calendar" title="Vista de Calendario">
                  <CalendarIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAdd}
              >
                Nueva Cita
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <AppointmentList
        viewMode={viewMode}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      <AppointmentForm
        open={openForm}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
        appointment={selectedAppointment}
      />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cita"
        content="¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer."
      />
    </PageContainer>
  );
};

export default Appointments;

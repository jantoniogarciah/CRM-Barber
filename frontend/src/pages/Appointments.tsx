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
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ViewList as ViewListIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useGetAppointmentsQuery,
  useDeleteAppointmentMutation,
  useGetBarbersQuery,
} from '../services/api';
import { Appointment, Barber } from '../types';
import AppointmentForm from '../components/AppointmentForm';
import { AppointmentCalendar } from '../components/AppointmentCalendar';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import toast from 'react-hot-toast';
import { PageContainer } from '../components/PageContainer';

type ViewMode = 'list' | 'calendar';

interface AppointmentsResponse {
  appointments: Appointment[];
  total: number;
}

const Appointments: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [openForm, setOpenForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: appointmentsData = { appointments: [] },
    isLoading,
    error,
    refetch
  } = useGetAppointmentsQuery();

  const {
    data: barbers = [],
    isLoading: isLoadingBarbers,
    error: barbersError,
  } = useGetBarbersQuery({ showInactive: false });

  const [deleteAppointment, { isLoading: isDeleting }] = useDeleteAppointmentMutation();

  const isLoadingCombined = isLoading || isLoadingBarbers;
  const errorCombined = error || barbersError;

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleOpenForm = (appointment?: Appointment) => {
    setSelectedAppointment(appointment || null);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedAppointment(null);
  };

  const handleOpenDeleteDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedAppointment(null);
  };

  const handleDelete = async () => {
    if (!selectedAppointmentId) return;

    try {
      await deleteAppointment(selectedAppointmentId).unwrap();
      toast.success('Cita eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedAppointmentId(null);
      refetch();
    } catch (error) {
      toast.error('Error al eliminar la cita');
    }
  };

  const handleEditAppointment = (appointment?: Appointment) => {
    // Implement edit functionality
    console.log('Edit appointment:', appointment);
  };

  if (isLoadingCombined) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorCombined) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error al cargar las citas. Por favor, intenta nuevamente.
        </Alert>
      </Box>
    );
  }

  const getAppointmentStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      case 'confirmed':
        return 'confirmed';
      default:
        return 'pending';
    }
  };

  return (
    <PageContainer>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4">Citas</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode"
              >
                <ToggleButton value="list" aria-label="list view">
                  <ViewListIcon />
                </ToggleButton>
                <ToggleButton value="calendar" aria-label="calendar view">
                  <CalendarIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
              >
                Nueva Cita
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {viewMode === 'calendar' ? (
        <AppointmentCalendar
          appointments={appointmentsData.appointments.map(appointment => ({
            ...appointment,
            client: appointment.client || { firstName: 'Cliente', lastName: 'Desconocido' },
            barber: appointment.barber || { firstName: 'Barbero', lastName: 'Desconocido' },
            service: appointment.service || { name: 'Servicio Desconocido' },
            status: getAppointmentStatus(appointment.status)
          }))}
          onEditAppointment={handleEditAppointment}
          onDeleteAppointment={(id: string) => {
            setSelectedAppointmentId(id);
            setIsDeleteDialogOpen(true);
          }}
        />
      ) : (
        <Box>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Filtrar por barbero"
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
              >
                <MenuItem value="">Todos los barberos</MenuItem>
                {barbers.map((barber) => (
                  <MenuItem key={barber.id} value={barber.id}>
                    {`${barber.firstName} ${barber.lastName}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                fullWidth
                label="Filtrar por fecha"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Barbero</TableCell>
                  <TableCell>Servicio</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Hora</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointmentsData.appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {`${appointment.client.firstName} ${appointment.client.lastName}`}
                    </TableCell>
                    <TableCell>
                      {`${appointment.barber.firstName} ${appointment.barber.lastName}`}
                    </TableCell>
                    <TableCell>{appointment.service.name}</TableCell>
                    <TableCell>
                      {format(new Date(appointment.date), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.status}
                        color={
                          appointment.status === 'COMPLETED'
                            ? 'success'
                            : appointment.status === 'CANCELLED'
                            ? 'error'
                            : 'primary'
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(appointment)}
                        title="Editar cita"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDeleteDialog(appointment)}
                        title="Eliminar cita"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <AppointmentForm
        open={openForm}
        onClose={handleCloseForm}
        onSuccess={handleCloseForm}
        appointment={selectedAppointment || undefined}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar cita?"
        content="¿Estás seguro que deseas eliminar esta cita? Esta acción no se puede deshacer."
        isSubmitting={isDeleting}
      />
    </PageContainer>
  );
};

export default Appointments;

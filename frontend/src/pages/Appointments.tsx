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
  FormControl,
  InputLabel,
  Select,
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
import AppointmentCalendar from '../components/AppointmentCalendar';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { toast } from 'react-hot-toast';
import { PageContainer } from '../components/PageContainer';

type ViewMode = 'list' | 'calendar';

interface AppointmentsResponse {
  appointments: Appointment[];
  total: number;
}

interface BarbersResponse {
  barbers: Barber[];
  total: number;
}

export const Appointments = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [openForm, setOpenForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  const { data: appointmentsData, isLoading: isLoadingAppointments, refetch: refetchAppointments } = useGetAppointmentsQuery();
  const { data: barbersData, isLoading: isLoadingBarbers } = useGetBarbersQuery({ showInactive: false });
  const [deleteAppointment] = useDeleteAppointmentMutation();

  const barbers = barbersData || [];
  const appointments = appointmentsData?.appointments || [];

  const handleAdd = () => {
    setSelectedAppointment(undefined);
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
        await deleteAppointment(appointmentToDelete.id).unwrap();
        toast.success('Cita eliminada exitosamente');
        refetchAppointments();
      } catch (error: any) {
        console.error('Error al eliminar la cita:', error);
        toast.error(error.data?.message || 'Error al eliminar la cita');
      }
    }
    setOpenDeleteDialog(false);
    setAppointmentToDelete(null);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedAppointment(undefined);
  };

  const handleSuccess = () => {
    handleCloseForm();
    toast.success(selectedAppointment ? 'Cita actualizada correctamente' : 'Cita creada correctamente');
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
      const date = new Date(dateStr);
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
  };

  const filteredAppointments = appointments.filter((appointment: Appointment) => {
    if (!appointment || !appointment.date) return false;
    
    try {
      const appointmentDate = new Date(appointment.date);
      const compareDate = new Date(format(selectedDate, 'yyyy-MM-dd'));

      const isDateMatch = format(appointmentDate, 'yyyy-MM-dd') === format(compareDate, 'yyyy-MM-dd');
      const isBarberMatch = !selectedBarber || appointment.barberId === selectedBarber;
      return isDateMatch && isBarberMatch;
    } catch (error) {
      console.error('Error filtering appointment:', error);
      return false;
    }
  });

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleBarberChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedBarber(event.target.value as string);
  };

  if (isLoadingAppointments || isLoadingBarbers) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Cargando...</Typography>
        </Box>
      </PageContainer>
    );
  }

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
                <ToggleButton value="list">
                  <ViewListIcon />
                </ToggleButton>
                <ToggleButton value="calendar">
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

      {viewMode === 'list' ? (
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
              {appointments.map((appointment: Appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {`${appointment.barber?.firstName} ${appointment.barber?.lastName}`}
                  </TableCell>
                  <TableCell>
                    {`${appointment.client?.firstName} ${appointment.client?.lastName}`}
                  </TableCell>
                  <TableCell>{appointment.service?.name}</TableCell>
                  <TableCell>{formatDate(appointment.date)}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(appointment.status)}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{appointment.notes}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(appointment)}
                      title="Editar Cita"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(appointment)}
                      title="Eliminar Cita"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <AppointmentCalendar
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          appointments={filteredAppointments}
          onEditAppointment={handleEdit}
          onDeleteAppointment={handleDelete}
          selectedBarber={selectedBarber}
        />
      )}

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

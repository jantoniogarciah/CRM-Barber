import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import { format, startOfMonth, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

import { useGetAppointmentsQuery, useDeleteAppointmentMutation, Filters } from '../services/api';
import { useGetBarbersQuery } from '../services/api';
import { Appointment } from '../types';
import AppointmentForm from '../components/AppointmentForm';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';
import AppointmentList from '../components/appointments/AppointmentList';
import { PageContainer } from '../components/PageContainer';

type ViewMode = 'list' | 'calendar';

export const Appointments = () => {
  // Obtener la fecha actual y el primer día del mes
  const today = new Date();
  const firstDayOfMonth = startOfMonth(today);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [openForm, setOpenForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>(undefined);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [filters, setFilters] = useState<Filters>({
    name: '',
    phone: '',
    status: '',
    startDate: format(firstDayOfMonth, 'yyyy-MM-dd'),
    endDate: format(today, 'yyyy-MM-dd'),
  });

  const { data: appointmentsData, isLoading: isLoadingAppointments } = useGetAppointmentsQuery(filters);
  const { data: barbersData, isLoading: isLoadingBarbers } = useGetBarbersQuery({ showInactive: false });
  const [deleteAppointment] = useDeleteAppointmentMutation();

  const barbers = barbersData || [];
  const appointments = appointmentsData?.appointments || [];

  // Modificar el estado de los filtros para usar la misma fecha
  const handleTextChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;
    setFilters(prev => {
      // Si es un campo de fecha, actualizar ambas fechas
      if (field === 'startDate' || field === 'endDate') {
        return {
          ...prev,
          startDate: newValue,
          endDate: newValue
        };
      }
      return {
        ...prev,
        [field]: newValue
      };
    });
  };

  const handleSelectChange = (field: string) => (
    event: SelectChangeEvent
  ) => {
    setFilters((prev: Filters) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Efecto para monitorear cambios en los filtros
  useEffect(() => {
    console.log('Current filters:', filters);
  }, [filters]);

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
        setOpenDeleteDialog(false);
        setAppointmentToDelete(null);
      } catch (error: any) {
        console.error('Error al eliminar la cita:', error);
        toast.error(error.data?.message || 'Error al eliminar la cita');
      }
    }
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    toast.success(selectedAppointment ? 'Cita actualizada correctamente' : 'Cita creada correctamente');
  };

  // Función para asegurarse de que las fechas estén en el formato correcto
  const formatDateForFilter = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
  };

  // Efecto para formatear las fechas cuando cambien
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      startDate: formatDateForFilter(prev.startDate || ''),
      endDate: formatDateForFilter(prev.endDate || '')
    }));
  }, []);

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
      <Box sx={{ 
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2
        }}>
          <Typography 
            variant="h5" 
            component="h1"
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
          >
            Citas
          </Typography>
          <Box sx={{ 
            display: 'flex',
            gap: 2,
            justifyContent: { xs: 'space-between', sm: 'flex-end' }
          }}>
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
              sx={{ whiteSpace: 'nowrap' }}
            >
              Nueva Cita
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 2, mb: 3, overflow: 'hidden' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Buscar por nombre"
                value={filters.name}
                onChange={handleTextChange('name')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Nombre del cliente..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Buscar por teléfono"
                value={filters.phone}
                onChange={handleTextChange('phone')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Teléfono del cliente..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.status}
                  onChange={handleSelectChange('status')}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="confirmed">Confirmada</MenuItem>
                  <MenuItem value="completed">Completada</MenuItem>
                  <MenuItem value="cancelled">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Fecha Inicio"
                type="date"
                value={filters.startDate}
                onChange={handleTextChange('startDate')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Fecha Fin"
                type="date"
                value={filters.endDate}
                onChange={handleTextChange('endDate')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>

        {viewMode === 'list' ? (
          <AppointmentList
            appointments={appointments}
            onEditClick={handleEdit}
            onDeleteClick={handleDelete}
          />
        ) : (
          <AppointmentCalendar
            appointments={appointments}
            onViewClick={() => {}}
            onEditClick={handleEdit}
            onDeleteClick={handleDelete}
            selectedDate={parseISO(filters.startDate)}
          />
        )}

        <AppointmentForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          appointment={selectedAppointment}
          onSuccess={handleFormSuccess}
        />

        <DeleteConfirmDialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          title="Eliminar Cita"
          content="¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer."
        />
      </Box>
    </PageContainer>
  );
};

export default Appointments;

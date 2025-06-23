import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Grid,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CalendarMonth as CalendarIcon,
  ViewList as ListIcon,
} from '@mui/icons-material';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import AppointmentForm from './AppointmentForm';
import AppointmentDetails from './AppointmentDetails';
import AppointmentCalendar from './AppointmentCalendar';
import { Appointment } from '../../types';
import { useGetAppointmentsQuery, useDeleteAppointmentMutation, useUpdateAppointmentMutation, useCreateAppointmentMutation } from '../../store/services/appointmentApi';
import { toast } from 'react-hot-toast';

const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
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

const getStatusLabel = (status: string): string => {
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

const AppointmentList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const { data = [], isLoading, isError } = useGetAppointmentsQuery();
  const [deleteAppointment] = useDeleteAppointmentMutation();
  const [updateAppointment] = useUpdateAppointmentMutation();
  const [createAppointment] = useCreateAppointmentMutation();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value);
    setPage(0);
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    setPage(0);
  };

  const handleAddClick = () => {
    setFormMode('add');
    setSelectedAppointment(null);
    setOpenForm(true);
  };

  const handleEditClick = (appointment: Appointment) => {
    setFormMode('edit');
    setSelectedAppointment(appointment);
    setOpenForm(true);
  };

  const handleViewClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setOpenDetails(true);
  };

  const handleDeleteClick = async (appointment: Appointment) => {
    if (window.confirm('¿Está seguro que desea eliminar esta cita?')) {
      try {
        await deleteAppointment(appointment.id).unwrap();
        toast.success('Cita eliminada exitosamente');
      } catch (error: any) {
        console.error('Error al eliminar la cita:', error);
        toast.error(error.data?.message || 'Error al eliminar la cita');
      }
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedAppointment(null);
  };

  const handleDetailsClose = () => {
    setOpenDetails(false);
    setSelectedAppointment(null);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (selectedAppointment) {
        await updateAppointment({
          id: selectedAppointment.id,
          appointment: values,
        }).unwrap();
        toast.success('Cita actualizada exitosamente');
      } else {
        await createAppointment(values).unwrap();
        toast.success('Cita creada exitosamente');
      }
      handleFormClose();
    } catch (error) {
      console.error('Error al guardar la cita:', error);
      toast.error('Error al guardar la cita');
    }
  };

  const filteredAppointments = data.filter((appointment: Appointment) => {
    const searchString = search.toLowerCase();
    const appointmentDate = new Date(appointment.date);
    
    const matchesSearch = 
      appointment.client?.firstName.toLowerCase().includes(searchString) ||
      appointment.client?.lastName.toLowerCase().includes(searchString) ||
      appointment.barber?.firstName.toLowerCase().includes(searchString) ||
      appointment.barber?.lastName.toLowerCase().includes(searchString) ||
      appointment.service?.name.toLowerCase().includes(searchString);

    const matchesStatus = !status || appointment.status === status;
    
    const matchesDateRange = (!startDate || appointmentDate >= new Date(startDate)) &&
      (!endDate || appointmentDate <= new Date(endDate));

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const paginatedAppointments = filteredAppointments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        Error al cargar las citas
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Buscar citas..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={status} onChange={handleStatusChange} label="Estado">
              <MenuItem value="">Todos los estados</MenuItem>
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="confirmed">Confirmada</MenuItem>
              <MenuItem value="completed">Completada</MenuItem>
              <MenuItem value="cancelled">Cancelada</MenuItem>
            </Select>
          </FormControl>
          <TextField
            type="date"
            label="Fecha inicial"
            value={startDate}
            onChange={(e) => handleDateChange('start', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="Fecha final"
            value={endDate}
            onChange={(e) => handleDateChange('end', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={viewMode === 'list' ? <CalendarIcon /> : <ListIcon />}
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          >
            {viewMode === 'list' ? 'Ver Calendario' : 'Ver Lista'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Nueva Cita
          </Button>
        </Box>
      </Box>

      {viewMode === 'list' ? (
        <>
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
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No se encontraron citas
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAppointments.map((appointment: Appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {appointment.client
                          ? `${appointment.client.firstName} ${appointment.client.lastName}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {appointment.barber
                          ? `${appointment.barber.firstName} ${appointment.barber.lastName}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{appointment.service?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {format(new Date(appointment.date), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>{appointment.time}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(appointment.status)}
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewClick(appointment)}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(appointment)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(appointment)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredAppointments.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página"
          />
        </>
      ) : (
        <AppointmentCalendar
          appointments={filteredAppointments}
          onViewClick={handleViewClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      )}

      <Dialog open={openForm} onClose={handleFormClose} maxWidth="sm" fullWidth>
        <AppointmentForm
          onSubmit={handleFormSubmit}
          appointment={selectedAppointment || undefined}
          onClose={handleFormClose}
        />
      </Dialog>

      <Dialog open={openDetails} onClose={handleDetailsClose} maxWidth="sm" fullWidth>
        {selectedAppointment && (
          <AppointmentDetails
            appointment={selectedAppointment}
            onClose={handleDetailsClose}
            onEdit={() => {
              handleDetailsClose();
              handleEditClick(selectedAppointment);
            }}
          />
        )}
      </Dialog>
    </Box>
  );
};

export default AppointmentList;

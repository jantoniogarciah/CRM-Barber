import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CalendarMonth as CalendarIcon,
  ViewList as ListIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format, parseISO, isToday, isTomorrow, isPast, startOfToday, endOfToday } from 'date-fns';
import axios from 'axios';
import AppointmentForm from '../../components/AppointmentForm';
import AppointmentDetails from './AppointmentDetails';
import AppointmentCalendar from './AppointmentCalendar';
import { Appointment } from '../../types';

interface AppointmentListProps {
  barberId?: string;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ barberId }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfToday(), 'yyyy-MM-dd'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          barberId,
          clientName: nameFilter,
          clientPhone: phoneFilter,
          status,
          startDate,
          endDate,
          page: page + 1,
          limit: rowsPerPage,
        },
      });

      if (response.data && Array.isArray(response.data.appointments)) {
        setAppointments(response.data.appointments);
        setTotalCount(response.data.total || response.data.appointments.length);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      setError(error.response?.data?.message || 'An error occurred while fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, rowsPerPage, nameFilter, phoneFilter, status, startDate, endDate, barberId]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(event.target.value);
    setPage(0);
  };

  const handlePhoneFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneFilter(event.target.value);
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
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/appointments/${appointment.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchAppointments();
      } catch (error: any) {
        setError(
          error.response?.data?.message || 'An error occurred while deleting the appointment'
        );
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

  const handleFormSubmit = async () => {
    await fetchAppointments();
    handleFormClose();
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

  const getDateLabel = (date: string) => {
    const parsedDate = parseISO(date);
    if (isToday(parsedDate)) {
      return 'Today';
    }
    if (isTomorrow(parsedDate)) {
      return 'Tomorrow';
    }
    return format(parsedDate, 'MMM d, yyyy');
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Filtros */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Buscar por nombre..."
              value={nameFilter}
              onChange={handleNameFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Buscar por teléfono..."
              value={phoneFilter}
              onChange={handlePhoneFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select value={status} onChange={handleStatusChange} label="Estado">
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pending">Pendiente</MenuItem>
                <MenuItem value="confirmed">Confirmada</MenuItem>
                <MenuItem value="completed">Completada</MenuItem>
                <MenuItem value="cancelled">Cancelada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Fecha Inicio"
              value={startDate}
              onChange={(e) => handleDateChange('start', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Fecha Fin"
              value={endDate}
              onChange={(e) => handleDateChange('end', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Nueva Cita
        </Button>
        <Box>
          <IconButton 
            onClick={() => setViewMode('list')}
            color={viewMode === 'list' ? 'primary' : 'default'}
          >
            <ListIcon />
          </IconButton>
          <IconButton
            onClick={() => setViewMode('calendar')}
            color={viewMode === 'calendar' ? 'primary' : 'default'}
          >
            <CalendarIcon />
          </IconButton>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'list' ? (
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
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{`${appointment.barber.firstName} ${appointment.barber.lastName}`}</TableCell>
                  <TableCell>{`${appointment.client.firstName} ${appointment.client.lastName}`}</TableCell>
                  <TableCell>{appointment.service.name}</TableCell>
                  <TableCell>{format(parseISO(appointment.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{appointment.notes}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleViewClick(appointment)}>
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEditClick(appointment)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(appointment)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      ) : (
        <AppointmentCalendar
          appointments={appointments}
          onAppointmentClick={handleViewClick}
        />
      )}

      <AppointmentForm
        open={openForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        appointment={selectedAppointment}
        mode={formMode}
      />

      <AppointmentDetails
        open={openDetails}
        onClose={handleDetailsClose}
        appointment={selectedAppointment}
      />
    </Box>
  );
};

export default AppointmentList;

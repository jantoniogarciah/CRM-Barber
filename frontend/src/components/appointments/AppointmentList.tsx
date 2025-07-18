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
  Today as TodayIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
} from '@mui/icons-material';
import { format, parseISO, isToday, isTomorrow, isPast, addDays, subDays } from 'date-fns';
import axios from 'axios';
import AppointmentForm from '../../components/AppointmentForm';
import AppointmentDetails from './AppointmentDetails';
import AppointmentCalendar from './AppointmentCalendar';
import { Appointment } from '../../types';

interface AppointmentListProps {
  barberId?: string;
}

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

const AppointmentList: React.FC<AppointmentListProps> = ({ barberId }) => {
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
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
          search,
          status,
          date: selectedDate,
          page: page + 1,
          limit: rowsPerPage,
        },
      });

      if (response.data && Array.isArray(response.data.appointments)) {
        // Ordenar citas por barbero y hora
        const sortedAppointments = response.data.appointments.sort((a: AppointmentWithRelations, b: AppointmentWithRelations) => {
          // Primero ordenar por barbero
          const barberCompare = a.barber.firstName.localeCompare(b.barber.firstName);
          if (barberCompare !== 0) return barberCompare;
          
          // Luego por hora
          return a.time.localeCompare(b.time);
        });
        
        setAppointments(sortedAppointments);
        setTotalCount(response.data.total || sortedAppointments.length);
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
  }, [page, rowsPerPage, search, status, selectedDate, barberId]);

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

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setPage(0);
  };

  const handlePrevDay = () => {
    const prevDay = subDays(parseISO(selectedDate), 1);
    setSelectedDate(format(prevDay, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const nextDay = addDays(parseISO(selectedDate), 1);
    setSelectedDate(format(nextDay, 'yyyy-MM-dd'));
  };

  const handleToday = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const handleAddClick = () => {
    setFormMode('add');
    setSelectedAppointment(null);
    setOpenForm(true);
  };

  const handleEditClick = (appointment: AppointmentWithRelations) => {
    setFormMode('edit');
    setSelectedAppointment(appointment);
    setOpenForm(true);
  };

  const handleViewClick = (appointment: AppointmentWithRelations) => {
    setSelectedAppointment(appointment);
    setOpenDetails(true);
  };

  const handleDeleteClick = async (appointment: AppointmentWithRelations) => {
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

      {/* Sección de filtros */}
      <Paper sx={{ p: 1.5, mb: 2 }} elevation={1}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              size="small"
              fullWidth
              placeholder="Buscar por nombre o teléfono..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select 
                value={status} 
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                }} 
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

          <Grid item xs={12} md={3}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              bgcolor: 'background.default',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              p: 0.5,
              height: '40px' // Mismo alto que los otros inputs
            }}>
              <IconButton onClick={handlePrevDay} size="small">
                <PrevIcon fontSize="small" />
              </IconButton>
              
              <TextField
                size="small"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                sx={{ 
                  width: '100%',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  },
                  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  },
                  '& .MuiInputBase-input': {
                    py: 0.5,
                    px: 1
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <IconButton onClick={handleNextDay} size="small">
                <NextIcon fontSize="small" />
              </IconButton>
              
              <IconButton 
                onClick={handleToday} 
                size="small" 
                color={isToday(parseISO(selectedDate)) ? "primary" : "default"}
              >
                <TodayIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant={viewMode === 'list' ? "contained" : "outlined"}
                onClick={() => setViewMode('list')}
                startIcon={<ListIcon fontSize="small" />}
                size="small"
              >
                Lista
              </Button>
              <Button
                fullWidth
                variant={viewMode === 'calendar' ? "contained" : "outlined"}
                onClick={() => setViewMode('calendar')}
                startIcon={<CalendarIcon fontSize="small" />}
                size="small"
              >
                Calendario
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Botón de nueva cita */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          size="small"
        >
          Nueva Cita
        </Button>
      </Box>

      {/* Contenido principal */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : appointments.length === 0 ? (
        <Alert severity="info">
          No hay citas programadas para esta fecha
        </Alert>
      ) : viewMode === 'calendar' ? (
        <AppointmentCalendar
          appointments={appointments}
          onViewClick={handleViewClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Barbero</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Servicio</TableCell>
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
                      {appointment.barber.firstName} {appointment.barber.lastName}
                    </TableCell>
                    <TableCell>
                      {appointment.client.firstName} {appointment.client.lastName}
                    </TableCell>
                    <TableCell>{appointment.service.name}</TableCell>
                    <TableCell>{format(parseISO(`2000-01-01T${appointment.time}`), 'h:mm a')}</TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{appointment.notes}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleViewClick(appointment)}
                        title="Ver detalles"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(appointment)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(appointment)}
                        title="Eliminar"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Citas por página"
          />
        </>
      )}

      {/* Mantener los diálogos existentes */}
      <Dialog open={openForm} onClose={handleFormClose} maxWidth="md" fullWidth>
        <AppointmentForm
          open={openForm}
          onClose={handleFormClose}
          onSuccess={handleFormSubmit}
          appointment={selectedAppointment as Appointment | undefined}
        />
      </Dialog>

      <Dialog open={openDetails} onClose={handleDetailsClose} maxWidth="md" fullWidth>
        <AppointmentDetails
          appointment={selectedAppointment as Appointment | undefined}
          onClose={handleDetailsClose}
          onEdit={() => {
            handleDetailsClose();
            if (selectedAppointment) {
              handleEditClick(selectedAppointment);
            }
          }}
        />
      </Dialog>
    </Box>
  );
};

export default AppointmentList;


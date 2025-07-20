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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format, parseISO, startOfToday, endOfToday } from 'date-fns';
import AppointmentForm from '../AppointmentForm';
import AppointmentDetails from './AppointmentDetails';
import AppointmentCalendar from '../AppointmentCalendar';
import { Appointment } from '../../types';
import api from '../../services/api';

interface AppointmentListProps {
  barberId?: string;
  viewMode: 'list' | 'calendar';
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  onAdd: () => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  barberId,
  viewMode,
  onEdit,
  onDelete,
  onAdd
}) => {
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
  const [openDetails, setOpenDetails] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/api/appointments', {
        params: {
          barberId,
          clientName: nameFilter,
          clientPhone: phoneFilter,
          status,
          startDate,
          endDate,
          page: page + 1,
          limit: rowsPerPage,
        }
      });

      if (response.data && Array.isArray(response.data.appointments)) {
        setAppointments(response.data.appointments);
        setTotalCount(response.data.pagination?.total || 0);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Formato de respuesta inválido del servidor');
      }
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      
      if (error.response) {
        // Error de respuesta del servidor
        if (error.response.status === 401) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (error.response.status === 404) {
          setError('No se encontró el recurso solicitado');
        } else {
          setError(error.response.data?.message || 'Error al cargar las citas');
        }
      } else if (error.request) {
        // Error de red
        setError('Error de conexión con el servidor. Por favor, verifica tu conexión a internet.');
      } else {
        // Otros errores
        setError(error.message || 'Error al cargar las citas');
      }
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

  const handleViewClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setOpenDetails(true);
  };

  const handleDetailsClose = () => {
    setOpenDetails(false);
    setSelectedAppointment(null);
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

  const getStatusLabel = (status: string) => {
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
              label="Buscar por nombre"
              placeholder="Nombre del cliente..."
              value={nameFilter}
              onChange={handleNameFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Buscar por teléfono"
              placeholder="Teléfono del cliente..."
              value={phoneFilter}
              onChange={handlePhoneFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
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
              size="small"
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
              size="small"
            />
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : appointments.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No se encontraron citas con los filtros seleccionados
        </Alert>
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
                  <TableCell>{`${appointment.barber?.firstName || ''} ${appointment.barber?.lastName || ''}`}</TableCell>
                  <TableCell>{`${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`}</TableCell>
                  <TableCell>{appointment.service?.name || ''}</TableCell>
                  <TableCell>{format(parseISO(appointment.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(appointment.status)}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{appointment.notes}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleViewClick(appointment)} title="Ver Detalles">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => onEdit(appointment)} title="Editar">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(appointment)} title="Eliminar">
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
            labelRowsPerPage="Citas por página"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </TableContainer>
      ) : (
        <AppointmentCalendar
          appointments={appointments}
          selectedDate={parseISO(startDate)}
          onDateChange={(date: Date | null) => {
            if (date) {
              handleDateChange('start', format(date, 'yyyy-MM-dd'));
              handleDateChange('end', format(date, 'yyyy-MM-dd'));
            }
          }}
          onEditAppointment={onEdit}
          onDeleteAppointment={onDelete}
        />
      )}

      <AppointmentDetails
        appointment={selectedAppointment}
        onClose={handleDetailsClose}
        onEdit={onEdit}
        open={openDetails}
      />
    </Box>
  );
};

export default AppointmentList;

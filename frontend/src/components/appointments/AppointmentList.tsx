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
import { format, parseISO, isToday } from 'date-fns';
import AppointmentForm from '../../components/AppointmentForm';
import AppointmentDetails from './AppointmentDetails';
import AppointmentCalendar from './AppointmentCalendar';
import { useGetAppointmentsQuery, useDeleteAppointmentMutation } from '../../services/api';
import { toast } from 'react-hot-toast';

interface AppointmentListProps {
  barberId?: string;
}

interface AppointmentWithRelations {
  id: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
  barber: {
    firstName: string;
    lastName: string;
  };
  client: {
    firstName: string;
    lastName: string;
  };
  service: {
    name: string;
  };
}

const AppointmentList: React.FC<AppointmentListProps> = ({ barberId }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Usar RTK Query hooks
  const { 
    data: appointmentsData, 
    isLoading, 
    error: fetchError,
    refetch: refetchAppointments
  } = useGetAppointmentsQuery({
    date: selectedDate,
    status,
    search,
    page: page + 1,
    limit: rowsPerPage,
    barberId
  });

  const [deleteAppointment] = useDeleteAppointmentMutation();

  const appointments = (appointmentsData?.appointments || []) as AppointmentWithRelations[];
  const totalCount = appointmentsData?.total || 0;

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
    const date = parseISO(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const date = parseISO(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };

  const handleToday = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const handleAddClick = () => {
    setFormMode('add');
    setSelectedAppointment(null);
    setOpenForm(true);
  };

  const handleEditClick = (appointment: any) => {
    setFormMode('edit');
    setSelectedAppointment(appointment);
    setOpenForm(true);
  };

  const handleViewClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setOpenDetails(true);
  };

  const handleDeleteClick = async (appointment: any) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      try {
        await deleteAppointment(appointment.id).unwrap();
        toast.success('Cita eliminada exitosamente');
        refetchAppointments();
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

  const handleFormSubmit = async () => {
    refetchAppointments();
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

  // Mostrar error si no hay autenticación
  if (fetchError) {
    const errorMessage = (fetchError as any)?.data?.message || 'Error al cargar las citas';
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {errorMessage}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
      {isLoading ? (
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
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(appointment)}
                        title="Editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(appointment)}
                        title="Eliminar"
                      >
                        <DeleteIcon fontSize="small" />
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

      {/* Diálogos */}
      <Dialog open={openForm} onClose={handleFormClose} maxWidth="md" fullWidth>
        <AppointmentForm
          open={openForm}
          onClose={handleFormClose}
          onSuccess={handleFormSubmit}
          appointment={selectedAppointment}
        />
      </Dialog>

      <Dialog open={openDetails} onClose={handleDetailsClose} maxWidth="md" fullWidth>
        <AppointmentDetails
          appointment={selectedAppointment}
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


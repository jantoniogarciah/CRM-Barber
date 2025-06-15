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
import axios from 'axios';
import AppointmentForm from './AppointmentForm';
import AppointmentDetails from './AppointmentDetails';
import AppointmentCalendar from './AppointmentCalendar';

interface AppointmentListProps {
  barberId?: string;
}

interface Appointment {
  id: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  date: string;
  // Add other appointment properties as needed
}

const AppointmentList: React.FC<AppointmentListProps> = ({ barberId }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
          search,
          status,
          startDate,
          endDate,
          page: page + 1,
          limit: rowsPerPage,
        },
      });

      setAppointments(response.data.appointments);
      setTotalCount(response.data.total);
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred while fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, rowsPerPage, search, status, startDate, endDate, barberId]);

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

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      case 'scheduled':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no-show':
        return 'warning';
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
            placeholder="Search appointments..."
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
            <InputLabel>Status</InputLabel>
            <Select value={status} onChange={handleStatusChange} label="Status">
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="no-show">No Show</MenuItem>
            </Select>
          </FormControl>
          <TextField
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => handleDateChange('start', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="End Date"
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
            {viewMode === 'list' ? 'Calendar View' : 'List View'}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
            Add Appointment
          </Button>
        </Box>
      </Box>

      {viewMode === 'list' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Barber</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{getDateLabel(appointment.date)}</TableCell>
                    <TableCell>
                      {format(parseISO(`2000-01-01T${appointment.time}`), 'h:mm a')}
                    </TableCell>
                    <TableCell>
                      {appointment.client.firstName} {appointment.client.lastName}
                    </TableCell>
                    <TableCell>{appointment.service.name}</TableCell>
                    <TableCell>
                      {appointment.barber.firstName} {appointment.barber.lastName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.status}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleViewClick(appointment)}
                        title="View Details"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(appointment)}
                        title="Edit Appointment"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(appointment)}
                        title="Delete Appointment"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      ) : (
        <AppointmentCalendar
          appointments={appointments}
          onViewClick={handleViewClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      )}

      <Dialog open={openForm} onClose={handleFormClose} maxWidth="md" fullWidth>
        <AppointmentForm
          appointment={selectedAppointment}
          mode={formMode}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
        />
      </Dialog>

      <Dialog open={openDetails} onClose={handleDetailsClose} maxWidth="lg" fullWidth>
        <AppointmentDetails
          appointment={selectedAppointment}
          onClose={handleDetailsClose}
          onEdit={() => {
            handleDetailsClose();
            handleEditClick(selectedAppointment);
          }}
        />
      </Dialog>
    </Box>
  );
};

export default AppointmentList;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  Note as NoteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';

const ClientDetails = ({ client, onClose, onEdit }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        const [appointmentsRes, statsRes] = await Promise.all([
          axios.get(`/api/clients/${client.id}/appointments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`/api/clients/${client.id}/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setAppointments(appointmentsRes.data);
        setStats(statsRes.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            'An error occurred while fetching client data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [client.id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no-show':
        return 'warning';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
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
        <Typography variant="h5" component="h2">
          Client Details
        </Typography>
        <Box>
          <Button onClick={onEdit} sx={{ mr: 1 }}>
            Edit
          </Button>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Personal Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography>
                {client.firstName} {client.lastName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ mr: 1 }} />
              <Typography>{client.phone}</Typography>
            </Box>
            {client.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1 }} />
                <Typography>{client.email}</Typography>
              </Box>
            )}
            {client.birthDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CakeIcon sx={{ mr: 1 }} />
                <Typography>
                  {format(new Date(client.birthDate), 'MMMM d, yyyy')}
                </Typography>
              </Box>
            )}
            {client.notes && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <NoteIcon sx={{ mr: 1 }} /> Notes
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {client.notes}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Appointments
                </Typography>
                <Typography variant="h4">{stats.totalAppointments}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Completed
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.completedAppointments}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Cancelled
                </Typography>
                <Typography variant="h4" color="error.main">
                  {stats.cancelledAppointments}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Spent
                </Typography>
                <Typography variant="h4" color="primary.main">
                  ${stats.totalSpent.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Appointments" />
              <Tab label="History" />
            </Tabs>

            {activeTab === 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Barber</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {format(new Date(appointment.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(`2000-01-01T${appointment.time}`),
                            'h:mm a'
                          )}
                        </TableCell>
                        <TableCell>{appointment.service.name}</TableCell>
                        <TableCell>
                          {appointment.barber.firstName}{' '}
                          {appointment.barber.lastName}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={appointment.status}
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          ${appointment.service.price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {activeTab === 1 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Barber</TableCell>
                      <TableCell>Price Paid</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments
                      .filter((a) => a.status === 'completed')
                      .map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            {format(new Date(appointment.date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>{appointment.service.name}</TableCell>
                          <TableCell>
                            {appointment.barber.firstName}{' '}
                            {appointment.barber.lastName}
                          </TableCell>
                          <TableCell>
                            ${appointment.service.price.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientDetails;

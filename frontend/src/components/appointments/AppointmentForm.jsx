import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const AppointmentForm = ({ appointment, mode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    barberId: '',
    date: new Date(),
    time: new Date(),
    notes: '',
    status: 'scheduled',
  });

  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchClients();
    fetchServices();
    fetchBarbers();
    if (appointment) {
      setFormData({
        clientId: appointment.clientId,
        serviceId: appointment.serviceId,
        barberId: appointment.barberId,
        date: new Date(appointment.date),
        time: new Date(`2000-01-01T${appointment.time}`),
        notes: appointment.notes || '',
        status: appointment.status,
      });
    }
  }, [appointment]);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data.clients);
    } catch (error) {
      setError('Failed to fetch clients');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services');
      setServices(response.data.services);
    } catch (error) {
      setError('Failed to fetch services');
    }
  };

  const fetchBarbers = async () => {
    try {
      const response = await axios.get('/api/users?role=barber');
      setBarbers(response.data.users);
    } catch (error) {
      setError('Failed to fetch barbers');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.clientId) errors.clientId = 'Client is required';
    if (!formData.serviceId) errors.serviceId = 'Service is required';
    if (!formData.barberId) errors.barberId = 'Barber is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.time) errors.time = 'Time is required';
    if (formData.date < new Date()) errors.date = 'Date cannot be in the past';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const appointmentData = {
        clientId: formData.clientId,
        serviceId: formData.serviceId,
        barberId: formData.barberId,
        date: formData.date.toISOString().split('T')[0],
        time: formData.time.toTimeString().split(' ')[0],
        notes: formData.notes,
        status: formData.status,
      };

      if (mode === 'edit') {
        await axios.put(`/api/appointments/${appointment.id}`, appointmentData);
      } else {
        await axios.post('/api/appointments', appointmentData);
      }

      onSubmit();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleDateChange = (newDate) => {
    setFormData((prev) => ({
      ...prev,
      date: newDate,
    }));
  };

  const handleTimeChange = (newTime) => {
    setFormData((prev) => ({
      ...prev,
      time: newTime,
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogTitle>
        {mode === 'edit' ? 'Edit Appointment' : 'New Appointment'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                options={clients}
                getOptionLabel={(option) =>
                  `${option.firstName} ${option.lastName}`
                }
                value={clients.find((c) => c.id === formData.clientId) || null}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    clientId: newValue?.id || '',
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Client"
                    required
                    error={!!validationErrors.clientId}
                    helperText={validationErrors.clientId}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={services}
                getOptionLabel={(option) => `${option.name} - $${option.price}`}
                value={
                  services.find((s) => s.id === formData.serviceId) || null
                }
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    serviceId: newValue?.id || '',
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Service"
                    required
                    error={!!validationErrors.serviceId}
                    helperText={validationErrors.serviceId}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!validationErrors.barberId}>
                <InputLabel>Barber</InputLabel>
                <Select
                  value={formData.barberId}
                  onChange={handleChange('barberId')}
                  label="Barber"
                  required
                >
                  {barbers.map((barber) => (
                    <MenuItem key={barber.id} value={barber.id}>
                      {barber.firstName} {barber.lastName}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.barberId && (
                  <FormHelperText>{validationErrors.barberId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Date"
                value={formData.date}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    error={!!validationErrors.date}
                    helperText={validationErrors.date}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Time"
                value={formData.time}
                onChange={handleTimeChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    error={!!validationErrors.time}
                    helperText={validationErrors.time}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleChange('status')}
                  label="Status"
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="no-show">No Show</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={formData.notes}
                onChange={handleChange('notes')}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </LocalizationProvider>
  );
};

export default AppointmentForm;

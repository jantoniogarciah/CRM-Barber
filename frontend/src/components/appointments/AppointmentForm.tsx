import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useGetClientsQuery } from '../../store/services/clientApi';
import { useGetServicesQuery } from '../../store/services/serviceApi';
import { useGetBarbersQuery } from '../../store/services/barberApi';
import { Client, Service, Barber } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AppointmentFormProps {
  onSubmit: (values: any) => void;
  appointment?: any;
  onClose?: () => void;
}

const validationSchema = Yup.object().shape({
  clientId: Yup.string().required('El cliente es requerido'),
  serviceId: Yup.string().required('El servicio es requerido'),
  barberId: Yup.string().required('El barbero es requerido'),
  date: Yup.date().required('La fecha es requerida'),
  time: Yup.string().required('La hora es requerida'),
  status: Yup.string().required('El estado es requerido'),
  notes: Yup.string(),
});

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSubmit,
  appointment,
  onClose,
}) => {
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  const { data: clientsData = [], isLoading: isLoadingClients, error: clientsError } = useGetClientsQuery();
  const { data: servicesData = [], isLoading: isLoadingServices, error: servicesError } = useGetServicesQuery();
  const { data: barbersData = [], isLoading: isLoadingBarbers, error: barbersError } = useGetBarbersQuery();

  // Filter active records
  const clients = clientsData.filter((client: Client) => client.status === 'ACTIVE');
  const services = servicesData.filter((service: Service) => service.isActive);
  const barbers = barbersData.filter((barber: Barber) => barber.isActive);

  const isLoading = isLoadingClients || isLoadingServices || isLoadingBarbers;
  const hasError = clientsError || servicesError || barbersError;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (hasError) {
    return (
      <Alert severity="error">
        Error al cargar los datos necesarios para el formulario
      </Alert>
    );
  }

  const initialValues = {
    clientId: appointment?.clientId || '',
    serviceId: appointment?.serviceId || '',
    barberId: appointment?.barberId || '',
    date: appointment?.date ? new Date(appointment.date) : new Date(),
    time: appointment?.time || '10:00',
    status: appointment?.status || 'pending',
    notes: appointment?.notes || '',
  };

  const handleSubmit = async (values: any) => {
    try {
      // Format date and time for the backend
      const formattedValues = {
        ...values,
        date: format(values.date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      };
      await onSubmit(formattedValues);
      if (onClose) {
        onClose();
      }
    } catch (error) {
      setError('Error al guardar la cita');
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, setFieldValue, values }) => (
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth error={touched.clientId && Boolean(errors.clientId)}>
                <InputLabel>Cliente</InputLabel>
                <Field
                  as={Select}
                  name="clientId"
                  label="Cliente"
                >
                  {clients.map((client: Client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {`${client.firstName} ${client.lastName}`}
                    </MenuItem>
                  ))}
                </Field>
                {touched.clientId && errors.clientId && (
                  <FormHelperText>{errors.clientId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={touched.serviceId && Boolean(errors.serviceId)}>
                <InputLabel>Servicio</InputLabel>
                <Field
                  as={Select}
                  name="serviceId"
                  label="Servicio"
                >
                  {services.map((service: Service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Field>
                {touched.serviceId && errors.serviceId && (
                  <FormHelperText>{errors.serviceId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={touched.barberId && Boolean(errors.barberId)}>
                <InputLabel>Barbero</InputLabel>
                <Field
                  as={Select}
                  name="barberId"
                  label="Barbero"
                >
                  {barbers.map((barber: Barber) => (
                    <MenuItem key={barber.id} value={barber.id}>
                      {`${barber.firstName} ${barber.lastName}`}
                    </MenuItem>
                  ))}
                </Field>
                {touched.barberId && errors.barberId && (
                  <FormHelperText>{errors.barberId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha"
                value={values.date}
                onChange={(newValue) => {
                  setFieldValue('date', newValue);
                }}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: touched.date && Boolean(errors.date),
                    helperText: touched.date && errors.date,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Hora"
                value={new Date(`2000-01-01T${values.time}`)}
                onChange={(newValue) => {
                  if (newValue) {
                    setFieldValue('time', format(newValue, 'HH:mm'));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: touched.time && Boolean(errors.time),
                    helperText: touched.time && errors.time,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={touched.status && Boolean(errors.status)}>
                <InputLabel>Estado</InputLabel>
                <Field
                  as={Select}
                  name="status"
                  label="Estado"
                >
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="confirmed">Confirmada</MenuItem>
                  <MenuItem value="completed">Completada</MenuItem>
                  <MenuItem value="cancelled">Cancelada</MenuItem>
                </Field>
                {touched.status && errors.status && (
                  <FormHelperText>{errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Field
                as={TextField}
                fullWidth
                name="notes"
                label="Notas"
                multiline
                rows={4}
                error={touched.notes && Boolean(errors.notes)}
                helperText={touched.notes && errors.notes}
              />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                {onClose && (
                  <Button onClick={onClose} color="inherit">
                    Cancelar
                  </Button>
                )}
                <Button type="submit" variant="contained" color="primary">
                  {appointment ? 'Actualizar' : 'Crear'} Cita
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default AppointmentForm; 
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Grid,
  CircularProgress,
  Typography,
} from '@mui/material';
import {
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useGetClientsQuery,
  useGetServicesQuery,
  useGetBarbersQuery,
  useGetClientByPhoneQuery,
  useCreateClientMutation,
} from '../services/api';
import { Appointment, Client, Service, Barber } from '../types';
import { format, addDays, isAfter, startOfToday, parseISO } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { toast } from 'react-hot-toast';

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment?: Appointment;
}

interface AppointmentFormValues {
  clientId: string;
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  isNewClient: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

const validationSchema = Yup.object({
  clientId: Yup.string().when(['isNewClient'], {
    is: (isNewClient: boolean) => !isNewClient,
    then: (schema) => schema.required('Por favor seleccione un cliente'),
    otherwise: (schema) => schema
  }),
  serviceId: Yup.string().required('Por favor seleccione un servicio'),
  barberId: Yup.string().required('Por favor seleccione un barbero'),
  date: Yup.string()
    .required('Por favor seleccione una fecha')
    .test('is-future-date', 'La fecha debe ser posterior al día de hoy', (value) => {
      if (!value) return false;
      const selectedDate = parseISO(value);
      const today = startOfToday();
      return isAfter(selectedDate, today);
    }),
  time: Yup.string().required('Por favor seleccione una hora'),
  status: Yup.string().oneOf(['pending', 'confirmed', 'completed', 'cancelled']).required(),
  notes: Yup.string(),
  // Campos para nuevo cliente
  firstName: Yup.string().when(['isNewClient'], {
    is: (isNewClient: boolean) => isNewClient,
    then: (schema) => schema.required('El nombre es requerido'),
    otherwise: (schema) => schema
  }),
  lastName: Yup.string().when(['isNewClient'], {
    is: (isNewClient: boolean) => isNewClient,
    then: (schema) => schema.required('El apellido es requerido'),
    otherwise: (schema) => schema
  }),
  phone: Yup.string().when(['isNewClient'], {
    is: (isNewClient: boolean) => isNewClient,
    then: (schema) => schema.required('El teléfono es requerido').length(10, 'El teléfono debe tener 10 dígitos'),
    otherwise: (schema) => schema
  }),
  email: Yup.string().email('Email inválido'),
  isNewClient: Yup.boolean()
});

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  open,
  onClose,
  onSuccess,
  appointment,
}) => {
  const [phoneSearch, setPhoneSearch] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [foundClient, setFoundClient] = useState<Client | null>(null);

  const [createAppointment] = useCreateAppointmentMutation();
  const [updateAppointment] = useUpdateAppointmentMutation();
  const [createClient] = useCreateClientMutation();
  
  const { data: clientsData, isLoading: isLoadingClients } = useGetClientsQuery({ showInactive: false });
  const { data: servicesData, isLoading: isLoadingServices } = useGetServicesQuery({ showInactive: false });
  const { data: barbersData, isLoading: isLoadingBarbers } = useGetBarbersQuery({ showInactive: false });
  const { data: clientByPhone, isFetching: isSearchingClient } = useGetClientByPhoneQuery(phoneSearch, {
    skip: !phoneSearch || phoneSearch.length < 10,
  });

  // Asegurarse de que los datos existan y sean arrays
  const clients = clientsData?.clients || [];
  const services = servicesData || [];
  const barbers = barbersData || [];

  // Obtener la fecha mínima (mañana)
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const formik = useFormik({
    initialValues: {
      clientId: '',
      serviceId: '',
      barberId: '',
      date: tomorrow,
      time: '',
      status: 'pending',
      notes: '',
      isNewClient: false,
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        let clientId = values.clientId;

        // Si es un cliente nuevo, crearlo primero
        if (isNewClient) {
          const newClientData = {
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone,
            email: values.email || undefined,
          };

          const createdClient = await createClient(newClientData).unwrap();
          clientId = createdClient.id;
          toast.success('Cliente registrado exitosamente');
        }

        const appointmentData = {
          clientId: clientId,
          serviceId: values.serviceId,
          barberId: values.barberId,
          date: zonedTimeToUtc(new Date(`${values.date}T${values.time}`), 'America/Mexico_City').toISOString(),
          time: values.time,
          status: values.status,
          notes: values.notes || undefined,
        };

        if (appointment?.id) {
          await updateAppointment({
            id: appointment.id,
            appointment: appointmentData,
          }).unwrap();
          toast.success('Cita actualizada exitosamente');
        } else {
          await createAppointment(appointmentData).unwrap();
          toast.success('Cita creada exitosamente');
        }

        onSuccess();
        onClose();
      } catch (error: any) {
        console.error('Error al guardar la cita:', error);
        toast.error(error.data?.message || 'Error al guardar la cita');
      }
    },
  });

  // Efecto para restaurar valores cuando se abre el formulario
  useEffect(() => {
    if (open) {
      if (appointment) {
        // Si es edición, restaurar valores de la cita existente
        const client = clients.find(c => c.id === appointment.clientId);
        if (client) {
          setFoundClient(client);
        }
        formik.resetForm({
          values: {
            clientId: appointment.clientId || '',
            serviceId: appointment.serviceId || '',
            barberId: appointment.barberId || '',
            date: appointment.date ? format(new Date(appointment.date), 'yyyy-MM-dd') : tomorrow,
            time: appointment.time || '',
            status: appointment.status || 'pending',
            notes: appointment.notes || '',
            isNewClient: false,
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
          }
        });
      } else {
        // Si es nueva cita, limpiar todo
        setPhoneSearch('');
        setFoundClient(null);
        setIsNewClient(false);
        formik.resetForm();
      }
    }
  }, [open, appointment]);

  // Efecto para manejar la búsqueda de cliente
  useEffect(() => {
    if (phoneSearch.length === 10) {
      if (clientByPhone) {
        setFoundClient(clientByPhone);
        setIsNewClient(false);
        formik.setValues({
          ...formik.values,
          clientId: clientByPhone.id,
          isNewClient: false,
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
        });
      } else {
        // Limpiar completamente el estado anterior y preparar para nuevo cliente
        setFoundClient(null);
        setIsNewClient(true);
        formik.setValues({
          ...formik.values,
          clientId: '',
          isNewClient: true,
          firstName: '',
          lastName: '',
          phone: phoneSearch,
          email: '',
        });
      }
    }
  }, [clientByPhone]);

  // Efecto separado para manejar cambios en phoneSearch
  useEffect(() => {
    if (phoneSearch.length < 10) {
      setFoundClient(null);
      setIsNewClient(false);
      formik.setValues({
        ...formik.values,
        clientId: '',
        isNewClient: false,
        firstName: '',
        lastName: '',
        phone: phoneSearch,
        email: '',
      });
    }
  }, [phoneSearch]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneSearch(value);
  };

  if (isLoadingClients || isLoadingServices || isLoadingBarbers) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{appointment ? 'Editar Cita' : 'Nueva Cita'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {!appointment && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Buscar cliente por teléfono"
                    value={phoneSearch}
                    onChange={handlePhoneChange}
                    placeholder="Ingrese 10 dígitos"
                    helperText={
                      isSearchingClient 
                        ? 'Buscando...' 
                        : phoneSearch.length === 10 && !clientByPhone
                        ? 'Cliente no encontrado. Se registrará como nuevo.' 
                        : 'Ingrese el número telefónico del cliente'
                    }
                  />
                </Grid>
              )}

              {foundClient && !isNewClient && phoneSearch.length === 10 && clientByPhone && (
                <Grid item xs={12}>
                  <Alert severity="success">
                    Cliente encontrado: {foundClient.firstName} {foundClient.lastName}
                  </Alert>
                </Grid>
              )}

              {isNewClient && phoneSearch.length === 10 && !clientByPhone && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Registrar Nuevo Cliente
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="firstName"
                      label="Nombre"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                      helperText={formik.touched.firstName && formik.errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="lastName"
                      label="Apellido"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                      helperText={formik.touched.lastName && formik.errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="email"
                      label="Email (opcional)"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                    />
                  </Grid>
                </>
              )}

              {((appointment || foundClient) && !isNewClient) && (
                <Grid item xs={12}>
                  <FormControl fullWidth error={formik.touched.clientId && Boolean(formik.errors.clientId)}>
                    <InputLabel>Cliente</InputLabel>
                    <Select
                      name="clientId"
                      value={formik.values.clientId}
                      onChange={formik.handleChange}
                      label="Cliente"
                    >
                      {clients.map((client: Client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControl fullWidth error={formik.touched.serviceId && Boolean(formik.errors.serviceId)}>
                  <InputLabel>Servicio</InputLabel>
                  <Select
                    name="serviceId"
                    value={formik.values.serviceId}
                    onChange={formik.handleChange}
                    label="Servicio"
                  >
                    {services.map((service: Service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.name} - ${service.price}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth error={formik.touched.barberId && Boolean(formik.errors.barberId)}>
                  <InputLabel>Barbero</InputLabel>
                  <Select
                    name="barberId"
                    value={formik.values.barberId}
                    onChange={formik.handleChange}
                    label="Barbero"
                  >
                    {barbers.map((barber: Barber) => (
                      <MenuItem key={barber.id} value={barber.id}>
                        {barber.firstName} {barber.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="date"
                  label="Fecha"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: tomorrow
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  name="time"
                  label="Hora"
                  value={formik.values.time}
                  onChange={formik.handleChange}
                  error={formik.touched.time && Boolean(formik.errors.time)}
                  helperText={formik.touched.time && formik.errors.time}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    label="Estado"
                  >
                    <MenuItem value="pending">Pendiente</MenuItem>
                    <MenuItem value="confirmed">Confirmada</MenuItem>
                    <MenuItem value="completed">Completada</MenuItem>
                    <MenuItem value="cancelled">Cancelada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="notes"
                  label="Notas"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  error={formik.touched.notes && Boolean(formik.errors.notes)}
                  helperText={formik.touched.notes && formik.errors.notes}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isSearchingClient}
          >
            {appointment ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AppointmentForm;

import React, { useEffect } from 'react';
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
} from '@mui/material';
import {
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useGetClientsQuery,
  useGetServicesQuery,
  useGetBarbersQuery,
} from '../services/api';
import { Appointment, Client, Service, Barber } from '../types';
import { format, startOfToday, isBefore, parseISO } from 'date-fns';
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
}

const validationSchema = Yup.object({
  clientId: Yup.string().required('Por favor seleccione un cliente'),
  serviceId: Yup.string().required('Por favor seleccione un servicio'),
  barberId: Yup.string().required('Por favor seleccione un barbero'),
  date: Yup.string()
    .required('Por favor seleccione una fecha')
    .test('is-future-date', 'La fecha debe ser hoy o una fecha futura', (value) => {
      if (!value) return false;
      const selectedDate = parseISO(value);
      const today = startOfToday();
      return !isBefore(selectedDate, today);
    }),
  time: Yup.string().required('Por favor seleccione una hora'),
  status: Yup.string().oneOf(['pending', 'confirmed', 'completed', 'cancelled']).required(),
  notes: Yup.string(),
});

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  open,
  onClose,
  onSuccess,
  appointment,
}) => {
  const [createAppointment] = useCreateAppointmentMutation();
  const [updateAppointment] = useUpdateAppointmentMutation();
  
  const { data: clientsData, isLoading: isLoadingClients } = useGetClientsQuery({ showInactive: false });
  const { data: servicesData, isLoading: isLoadingServices } = useGetServicesQuery({ showInactive: false });
  const { data: barbersData, isLoading: isLoadingBarbers } = useGetBarbersQuery({ showInactive: false });

  // Asegurarse de que los datos existan y sean arrays
  const clients = clientsData?.clients || [];
  const services = servicesData || [];
  const barbers = barbersData || [];

  console.log('Form data:', {
    clients,
    services,
    barbers,
    appointment
  });

  const formik = useFormik<AppointmentFormValues>({
    initialValues: {
      clientId: appointment?.clientId || '',
      serviceId: appointment?.serviceId || '',
      barberId: appointment?.barberId || '',
      date: appointment?.date ? format(new Date(appointment.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: appointment?.time || '',
      status: appointment?.status || 'pending',
      notes: appointment?.notes || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Submitting form with values:', values);

        const appointmentData = {
          clientId: values.clientId,
          serviceId: values.serviceId,
          barberId: values.barberId,
          date: new Date(values.date).toISOString(),
          time: values.time,
          status: values.status,
          notes: values.notes || undefined,
        };

        console.log('Appointment data to submit:', appointmentData);

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

  useEffect(() => {
    if (open) {
      console.log('Resetting form with appointment:', appointment);
      formik.resetForm({
        values: {
          clientId: appointment?.clientId || '',
          serviceId: appointment?.serviceId || '',
          barberId: appointment?.barberId || '',
          date: appointment?.date ? format(new Date(appointment.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          time: appointment?.time || '',
          status: appointment?.status || 'pending',
          notes: appointment?.notes || '',
        },
      });
    }
  }, [open, appointment]);

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

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{appointment ? 'Editar Cita' : 'Nueva Cita'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
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
                    min: today
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
          <Button type="submit" variant="contained" color="primary">
            {appointment ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AppointmentForm;

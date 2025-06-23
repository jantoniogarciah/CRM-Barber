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
import { format, parseISO } from 'date-fns';
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
  date: Yup.string().required('Por favor seleccione una fecha'),
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
  
  const { 
    data: clientsData, 
    isLoading: isLoadingClients,
    error: clientsError 
  } = useGetClientsQuery({ showInactive: false });
  
  const { 
    data: servicesData, 
    isLoading: isLoadingServices,
    error: servicesError 
  } = useGetServicesQuery({ showInactive: false });
  
  const { 
    data: barbersData, 
    isLoading: isLoadingBarbers,
    error: barbersError 
  } = useGetBarbersQuery({ showInactive: false });

  const clients = (clientsData?.clients || []) as Client[];
  const services = (servicesData || []) as Service[];
  const barbers = (barbersData || []) as Barber[];

  const isLoading = isLoadingClients || isLoadingServices || isLoadingBarbers;
  const hasError = clientsError || servicesError || barbersError;

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
        const appointmentData = {
          clientId: values.clientId,
          serviceId: values.serviceId,
          barberId: values.barberId,
          date: new Date(values.date).toISOString(),
          time: values.time,
          status: values.status,
          notes: values.notes || undefined,
        };

        if (appointment?.id) {
          await updateAppointment({
            id: appointment.id,
            appointment: appointmentData,
          }).unwrap();
        } else {
          await createAppointment(appointmentData).unwrap();
        }

        onSuccess();
        onClose();
        toast.success(appointment ? 'Cita actualizada exitosamente' : 'Cita creada exitosamente');
      } catch (error: any) {
        console.error('Error al guardar la cita:', error);
        toast.error(error.data?.message || 'Error al guardar la cita');
      }
    },
  });

  useEffect(() => {
    if (open) {
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

  if (hasError) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 2 }}>
            Error al cargar los datos necesarios para el formulario. Por favor, intente nuevamente.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{appointment ? 'Editar Cita' : 'Nueva Cita'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Cliente</InputLabel>
                    <Select
                      name="clientId"
                      value={formik.values.clientId}
                      onChange={formik.handleChange}
                      error={formik.touched.clientId && Boolean(formik.errors.clientId)}
                      label="Cliente"
                    >
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Servicio</InputLabel>
                    <Select
                      name="serviceId"
                      value={formik.values.serviceId}
                      onChange={formik.handleChange}
                      error={formik.touched.serviceId && Boolean(formik.errors.serviceId)}
                      label="Servicio"
                    >
                      {services.map((service) => (
                        <MenuItem key={service.id} value={service.id}>
                          {service.name} - ${service.price}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Barbero</InputLabel>
                    <Select
                      name="barberId"
                      value={formik.values.barberId}
                      onChange={formik.handleChange}
                      error={formik.touched.barberId && Boolean(formik.errors.barberId)}
                      label="Barbero"
                    >
                      {barbers.map((barber) => (
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
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      name="status"
                      value={formik.values.status}
                      onChange={formik.handleChange}
                      error={formik.touched.status && Boolean(formik.errors.status)}
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isLoading}
          >
            {appointment ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AppointmentForm;

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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
}

const validationSchema = Yup.object({
  clientId: Yup.string().required('Por favor seleccione un cliente'),
  serviceId: Yup.string().required('Por favor seleccione un servicio'),
  barberId: Yup.string().required('Por favor seleccione un barbero'),
  date: Yup.string().required('Por favor seleccione una fecha'),
  time: Yup.string().required('Por favor seleccione una hora'),
  status: Yup.string().oneOf(['pending', 'confirmed', 'cancelled', 'completed']).required(),
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
  const { data: clients = [] } = useGetClientsQuery({ showInactive: false });
  const { data: barbers = [] } = useGetBarbersQuery({ showInactive: false });
  const {
    data: services = [],
    isLoading: isLoadingServices,
    error: servicesError,
  } = useGetServicesQuery({ showInactive: false });

  useEffect(() => {
    if (servicesError) {
      console.error('Error loading services:', servicesError);
      alert('Error al cargar los servicios. Por favor, intente de nuevo.');
    }
  }, [servicesError]);

  const formik = useFormik<AppointmentFormValues>({
    initialValues: {
      clientId: appointment?.clientId || '',
      serviceId: appointment?.serviceId || '',
      barberId: appointment?.barberId || '',
      date: appointment?.date || format(new Date(), 'yyyy-MM-dd'),
      time: appointment?.time || '',
      status: (appointment?.status as AppointmentFormValues['status']) || 'pending',
      notes: appointment?.notes || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (!values.clientId) {
          throw new Error('Por favor seleccione un cliente');
        }
        if (!values.serviceId) {
          throw new Error('Por favor seleccione un servicio');
        }
        if (!values.barberId) {
          throw new Error('Por favor seleccione un barbero');
        }
        if (!values.date) {
          throw new Error('Por favor seleccione una fecha');
        }

        // Ensure the date is in YYYY-MM-DD format without any timezone adjustments
        const formattedDate = format(parseISO(values.date), 'yyyy-MM-dd');

        const appointmentData = {
          clientId: values.clientId,
          serviceId: values.serviceId,
          barberId: values.barberId,
          date: formattedDate,
          time: values.time,
          status: values.status,
          notes: values.notes,
        };

        console.log('Appointment data to be sent:', appointmentData);

        if (appointment) {
          await updateAppointment({
            id: appointment.id.toString(),
            appointment: appointmentData,
          }).unwrap();
          onSuccess();
        } else {
          await createAppointment(appointmentData).unwrap();
          onSuccess();
        }
        onClose();
      } catch (error: any) {
        console.error('Error saving appointment:', error);
        let errorMessage = 'Error al guardar la cita. ';

        if (error.data?.message) {
          errorMessage += error.data.message;
        } else if (error.message) {
          errorMessage += error.message;
        } else if (error.data?.errors) {
          errorMessage += error.data.errors.map((e: any) => e.msg).join(', ');
        }

        alert(errorMessage);
      }
    },
  });

  useEffect(() => {
    if (open) {
      console.log('Appointment data received:', appointment);

      formik.resetForm({
        values: {
          clientId: appointment?.clientId || '',
          serviceId: appointment?.serviceId || '',
          barberId: appointment?.barberId || '',
          date: appointment?.date || format(new Date(), 'yyyy-MM-dd'),
          time: appointment?.time || '',
          status: (appointment?.status as AppointmentFormValues['status']) || 'pending',
          notes: appointment?.notes || '',
        },
      });
    }
  }, [open, appointment]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{appointment ? 'Editar Cita' : 'Nueva Cita'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              id="clientId"
              name="clientId"
              label="Cliente"
              select
              value={formik.values.clientId}
              onChange={formik.handleChange}
              error={formik.touched.clientId && Boolean(formik.errors.clientId)}
              helperText={formik.touched.clientId && formik.errors.clientId}
            >
              <MenuItem value="">Seleccionar cliente</MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {`${client.firstName} ${client.lastName}`}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              id="serviceId"
              name="serviceId"
              label="Servicio"
              select
              value={formik.values.serviceId}
              onChange={formik.handleChange}
              error={formik.touched.serviceId && Boolean(formik.errors.serviceId)}
              helperText={formik.touched.serviceId && formik.errors.serviceId}
            >
              <MenuItem value="">Seleccionar servicio</MenuItem>
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              id="barberId"
              name="barberId"
              label="Barbero"
              select
              value={formik.values.barberId}
              onChange={formik.handleChange}
              error={formik.touched.barberId && Boolean(formik.errors.barberId)}
              helperText={formik.touched.barberId && formik.errors.barberId}
            >
              <MenuItem value="">Seleccionar barbero</MenuItem>
              {barbers.map((barber) => (
                <MenuItem key={barber.id} value={barber.id}>
                  {`${barber.firstName} ${barber.lastName}`}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              id="date"
              name="date"
              label="Fecha"
              type="date"
              value={formik.values.date}
              onChange={formik.handleChange}
              error={formik.touched.date && Boolean(formik.errors.date)}
              helperText={formik.touched.date && formik.errors.date}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              fullWidth
              id="time"
              name="time"
              label="Hora"
              type="time"
              value={formik.values.time}
              onChange={formik.handleChange}
              error={formik.touched.time && Boolean(formik.errors.time)}
              helperText={formik.touched.time && formik.errors.time}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              fullWidth
              id="status"
              name="status"
              label="Estado"
              select
              value={formik.values.status}
              onChange={formik.handleChange}
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={formik.touched.status && formik.errors.status}
            >
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="confirmed">Confirmada</MenuItem>
              <MenuItem value="completed">Completada</MenuItem>
              <MenuItem value="cancelled">Cancelada</MenuItem>
            </TextField>

            <TextField
              fullWidth
              id="notes"
              name="notes"
              label="Notas"
              multiline
              rows={4}
              value={formik.values.notes}
              onChange={formik.handleChange}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={formik.isSubmitting || isLoadingServices}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={24} />
            ) : appointment ? (
              'Actualizar'
            ) : (
              'Crear'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AppointmentForm;

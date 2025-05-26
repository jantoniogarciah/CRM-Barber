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
} from '../services/api';
import { Appointment, Client, Service } from '../types';

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment?: Appointment;
}

interface AppointmentFormValues {
  clientId: number;
  serviceId: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
}

const validationSchema = Yup.object({
  clientId: Yup.number()
    .min(1, 'Por favor seleccione un cliente')
    .required('El cliente es requerido'),
  serviceId: Yup.number()
    .min(1, 'Por favor seleccione un servicio')
    .required('El servicio es requerido'),
  date: Yup.string().required('La fecha es requerida'),
  time: Yup.string().required('La hora es requerida'),
  status: Yup.string()
    .oneOf(['pending', 'confirmed', 'cancelled', 'completed'], 'Estado inválido')
    .required('El estado es requerido'),
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
      clientId: appointment?.clientId || 0,
      serviceId: appointment?.serviceId || 0,
      date: appointment?.date || new Date().toISOString().split('T')[0],
      time: appointment?.time || '',
      status: (appointment?.status as AppointmentFormValues['status']) || 'pending',
      notes: appointment?.notes || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Form values before submission:', {
          values,
          clients,
          selectedClient: clients.find((c) => c.id === values.clientId),
          services,
          selectedService: services.find((s) => s.id === values.serviceId),
        });

        const appointmentData = {
          clientId: Number(values.clientId),
          serviceId: Number(values.serviceId),
          date: values.date,
          time: values.time,
          status: values.status,
          notes: values.notes || '',
        };

        console.log('Appointment data to be sent:', appointmentData);

        if (appointment?.id) {
          console.log('Updating appointment:', appointmentData);
          const result = await updateAppointment({
            id: appointment.id.toString(),
            appointment: appointmentData,
          }).unwrap();
          console.log('Update successful:', result);
        } else {
          console.log('Creating new appointment:', appointmentData);
          const result = await createAppointment(appointmentData).unwrap();
          console.log('Creation successful:', result);
        }
        onSuccess();
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
      formik.resetForm({
        values: {
          clientId: appointment?.clientId || 0,
          serviceId: appointment?.serviceId || 0,
          date: appointment?.date || new Date().toISOString().split('T')[0],
          time: appointment?.time || '',
          status: (appointment?.status as AppointmentFormValues['status']) || 'pending',
          notes: appointment?.notes || '',
        },
      });
    }
  }, [open, appointment]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{appointment ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              id="clientId"
              name="clientId"
              label="Client"
              select
              value={formik.values.clientId}
              onChange={formik.handleChange}
              error={formik.touched.clientId && Boolean(formik.errors.clientId)}
              helperText={formik.touched.clientId && formik.errors.clientId}
            >
              <MenuItem value={0}>Select a client</MenuItem>
              {clients.map((client: Client) => (
                <MenuItem key={client.id} value={client.id}>
                  {`${client.firstName} ${client.lastName}`}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              id="serviceId"
              name="serviceId"
              label="Service"
              select
              value={formik.values.serviceId}
              onChange={(e) => {
                console.log('Service selected:', {
                  selectedValue: e.target.value,
                  availableServices: services,
                });
                formik.handleChange(e);
              }}
              error={formik.touched.serviceId && Boolean(formik.errors.serviceId)}
              helperText={
                (formik.touched.serviceId && formik.errors.serviceId) ||
                (isLoadingServices ? 'Loading services...' : '')
              }
              disabled={isLoadingServices}
            >
              <MenuItem value={0}>Select a service</MenuItem>
              {services.map((service: Service) => {
                console.log('Rendering service option:', service);
                return (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
                  </MenuItem>
                );
              })}
            </TextField>

            <TextField
              fullWidth
              id="date"
              name="date"
              label="Date"
              type="date"
              value={formik.values.date}
              onChange={formik.handleChange}
              error={formik.touched.date && Boolean(formik.errors.date)}
              helperText={formik.touched.date && formik.errors.date}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              id="time"
              name="time"
              label="Time"
              type="time"
              value={formik.values.time}
              onChange={formik.handleChange}
              error={formik.touched.time && Boolean(formik.errors.time)}
              helperText={formik.touched.time && formik.errors.time}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              id="status"
              name="status"
              label="Status"
              select
              value={formik.values.status}
              onChange={formik.handleChange}
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={formik.touched.status && formik.errors.status}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>

            <TextField
              fullWidth
              id="notes"
              name="notes"
              label="Notes"
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
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? (
              <CircularProgress size={24} />
            ) : appointment ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AppointmentForm;

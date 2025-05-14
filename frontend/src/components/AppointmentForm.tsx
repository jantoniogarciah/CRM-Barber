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
  appointment?: Appointment;
}

interface AppointmentFormValues {
  clientId: number;
  serviceId: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}

const validationSchema = Yup.object({
  clientId: Yup.number().required('Client is required'),
  serviceId: Yup.number().required('Service is required'),
  date: Yup.string().required('Date is required'),
  time: Yup.string().required('Time is required'),
  status: Yup.string()
    .oneOf(['pending', 'confirmed', 'completed', 'cancelled'])
    .required('Status is required'),
  notes: Yup.string(),
});

const AppointmentForm: React.FC<AppointmentFormProps> = ({ open, onClose, appointment }) => {
  const [createAppointment] = useCreateAppointmentMutation();
  const [updateAppointment] = useUpdateAppointmentMutation();
  const { data: clients = [] } = useGetClientsQuery();
  const { data: services = [] } = useGetServicesQuery({});

  const formik = useFormik<AppointmentFormValues>({
    initialValues: {
      clientId: appointment?.clientId || 0,
      serviceId: appointment?.serviceId || 0,
      date: appointment?.date || '',
      time: appointment?.time || '',
      status: appointment?.status || 'pending',
      notes: appointment?.notes || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const appointmentData: Partial<Appointment> = {
          clientId: values.clientId,
          serviceId: values.serviceId,
          date: values.date,
          time: values.time,
          status: values.status,
          notes: values.notes,
        };

        if (appointment?.id) {
          await updateAppointment({ id: appointment.id.toString(), appointment: appointmentData });
        } else {
          await createAppointment(appointmentData);
        }
        onClose();
      } catch (error) {
        console.error('Error saving appointment:', error);
      }
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
      if (appointment) {
        formik.setValues({
          clientId: appointment.clientId,
          serviceId: appointment.serviceId,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status,
          notes: appointment.notes || '',
        });
      }
    }
  }, [open, appointment]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{appointment ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              {clients.map((client: Client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
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
              onChange={formik.handleChange}
              error={formik.touched.serviceId && Boolean(formik.errors.serviceId)}
              helperText={formik.touched.serviceId && formik.errors.serviceId}
            >
              {services.map((service: Service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))}
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
          <Button type="submit" variant="contained">
            {appointment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AppointmentForm;

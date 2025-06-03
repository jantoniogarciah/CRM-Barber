import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
} from '@mui/material';
import { Client } from '../types';
import { useCreateClientMutation, useUpdateClientMutation } from '../services/api';

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  client?: Client;
}

interface ClientFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

const validationSchema = Yup.object({
  firstName: Yup.string().required('El nombre es requerido'),
  lastName: Yup.string().required('El apellido es requerido'),
  email: Yup.string().email('Email inválido').nullable(),
  phone: Yup.string()
    .required('El teléfono es requerido')
    .matches(/^\+?[\d\s-]{10,}$/, 'Formato de teléfono inválido'),
  notes: Yup.string(),
});

const ClientForm = ({
  open,
  onClose,
  onSuccess,
  onError,
  client,
}: ClientFormProps): React.ReactElement => {
  const [createClient] = useCreateClientMutation();
  const [updateClient] = useUpdateClientMutation();

  const formik = useFormik<ClientFormValues>({
    initialValues: {
      firstName: client?.firstName || '',
      lastName: client?.lastName || '',
      email: client?.email || '',
      phone: client?.phone || '',
      notes: client?.notes || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (client?.id) {
          await updateClient({
            id: client.id,
            client: values,
          }).unwrap();
          onSuccess('Cliente actualizado exitosamente');
        } else {
          await createClient(values).unwrap();
          onSuccess('Cliente creado exitosamente');
        }
        onClose();
      } catch (error: any) {
        console.error('Error saving client:', error);
        onError(error.data?.message || 'Error al guardar el cliente');
      }
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm({
        values: {
          firstName: client?.firstName || '',
          lastName: client?.lastName || '',
          email: client?.email || '',
          phone: client?.phone || '',
          notes: client?.notes || '',
        },
      });
    }
  }, [open, client]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{client ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="firstName"
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
                  id="lastName"
                  name="lastName"
                  label="Apellido"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Teléfono"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email (opcional)"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12}>
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
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            {client ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ClientForm;

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
  Alert,
  Typography,
} from '@mui/material';
import { Client } from '../types';
import { useCreateClientMutation, useUpdateClientMutation } from '../services/api';

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  client?: Client;
  onShowExistingClient?: (clientId: string) => void;
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
    .matches(/^\d{10}$/, 'El teléfono debe tener exactamente 10 dígitos'),
  notes: Yup.string(),
});

const ClientForm = ({
  open,
  onClose,
  onSuccess,
  onError,
  client,
  onShowExistingClient,
}: ClientFormProps): React.ReactElement => {
  const [createClient] = useCreateClientMutation();
  const [updateClient] = useUpdateClientMutation();
  const [existingClient, setExistingClient] = React.useState<{
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
  } | null>(null);

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
        console.log('Submitting form with values:', values);
        const cleanPhone = values.phone.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
          onError('El teléfono debe tener exactamente 10 dígitos');
          return;
        }

        const clientData = {
          ...values,
          phone: cleanPhone,
        };

        if (client?.id) {
          await updateClient({
            id: client.id,
            client: clientData,
          }).unwrap();
          onSuccess('Cliente actualizado exitosamente');
        } else {
          await createClient(clientData).unwrap();
          onSuccess('Cliente creado exitosamente');
        }
        setExistingClient(null);
        onClose();
      } catch (error: any) {
        console.error('Error saving client:', error);
        if (error.data?.existingClient) {
          console.log('Found existing client:', error.data.existingClient);
          setExistingClient(error.data.existingClient);
        } else {
          onError(error.data?.message || 'Error al guardar el cliente');
        }
      }
    },
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    console.log('Phone changed:', value);
    formik.setFieldValue('phone', value);
    setExistingClient(null);
  };

  useEffect(() => {
    if (open) {
      console.log('Form opened with client:', client);
      formik.resetForm({
        values: {
          firstName: client?.firstName || '',
          lastName: client?.lastName || '',
          email: client?.email || '',
          phone: client?.phone || '',
          notes: client?.notes || '',
        },
      });
      setExistingClient(null);
    }
  }, [open, client]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{client ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <DialogContent>
          {existingClient && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                onShowExistingClient && (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      console.log('Show existing client clicked:', existingClient.id);
                      onShowExistingClient(existingClient.id);
                      onClose();
                    }}
                  >
                    Ver Cliente
                  </Button>
                )
              }
            >
              Ya existe un cliente con este número de teléfono:
              <br />
              Nombre: {existingClient.firstName} {existingClient.lastName}
              <br />
              Teléfono: {existingClient.phone}
              <br />
              Estado: {existingClient.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
              <br />
              Creado: {new Date(existingClient.createdAt).toLocaleDateString()}
              {existingClient.status === 'INACTIVE' && (
                <Typography color="textSecondary" sx={{ mt: 1, fontSize: '0.875rem' }}>
                  * El cliente está inactivo. Al hacer clic en "Ver Cliente" se activará la opción de mostrar clientes inactivos.
                </Typography>
              )}
            </Alert>
          )}
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
                  onChange={handlePhoneChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={
                    (formik.touched.phone && formik.errors.phone) ||
                    'Ingresa exactamente 10 dígitos'
                  }
                  inputProps={{
                    maxLength: 10,
                  }}
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
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!formik.isValid || formik.isSubmitting}
          >
            {client ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ClientForm;

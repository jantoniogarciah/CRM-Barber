import React, { useState } from 'react';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Grid,
  Typography,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useGetServicesQuery, useGetClientByPhoneQuery, useCreateServiceLogMutation } from '../services/api';
import ClientForm from './ClientForm';

interface ServiceFormProps {
  barberId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ServiceFormValues {
  serviceId: string;
  clientPhone: string;
  notes: string;
}

const validationSchema = Yup.object({
  serviceId: Yup.string().required('Debes seleccionar un servicio'),
  clientPhone: Yup.string().required('El teléfono del cliente es requerido'),
  notes: Yup.string(),
});

const ServiceForm = ({ barberId, onClose, onSuccess }: ServiceFormProps) => {
  const [openClientForm, setOpenClientForm] = useState(false);
  const { data: services = [] } = useGetServicesQuery();
  const [createServiceLog] = useCreateServiceLogMutation();
  const [searchPhone, setSearchPhone] = useState('');
  const { data: foundClient, isLoading: isSearchingClient } = useGetClientByPhoneQuery(
    searchPhone,
    { skip: !searchPhone }
  );

  const formik = useFormik<ServiceFormValues>({
    initialValues: {
      serviceId: '',
      clientPhone: '',
      notes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await createServiceLog({
          barberId,
          serviceId: values.serviceId,
          clientPhone: values.clientPhone,
          notes: values.notes,
        }).unwrap();
        onSuccess();
      } catch (error) {
        console.error('Error creating service log:', error);
      }
    },
  });

  const handlePhoneSearch = (phone: string) => {
    setSearchPhone(phone);
    formik.setFieldValue('clientPhone', phone);
  };

  const handleCreateClient = () => {
    setOpenClientForm(true);
  };

  const handleClientCreated = (phone: string) => {
    setOpenClientForm(false);
    handlePhoneSearch(phone);
  };

  const selectedService = services.find(
    (service) => service.id === formik.values.serviceId
  );

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <DialogTitle>Registrar Nuevo Servicio</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={services}
              getOptionLabel={(option) => `${option.name} - ${option.price}`}
              onChange={(_, value) => formik.setFieldValue('serviceId', value?.id || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Servicio"
                  error={formik.touched.serviceId && Boolean(formik.errors.serviceId)}
                  helperText={formik.touched.serviceId && formik.errors.serviceId}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Teléfono del Cliente"
                value={formik.values.clientPhone}
                onChange={(e) => handlePhoneSearch(e.target.value)}
                error={formik.touched.clientPhone && Boolean(formik.errors.clientPhone)}
                helperText={formik.touched.clientPhone && formik.errors.clientPhone}
              />
              <Button
                variant="outlined"
                onClick={handleCreateClient}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Nuevo Cliente
              </Button>
            </Box>
          </Grid>

          {foundClient && (
            <Grid item xs={12}>
              <Alert severity="info">
                Cliente encontrado: {foundClient.firstName} {foundClient.lastName}
              </Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Notas"
              name="notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
            />
          </Grid>

          {selectedService && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Precio del servicio: ${selectedService.price}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!formik.isValid || formik.isSubmitting}
        >
          Registrar Servicio
        </Button>
      </DialogActions>

      {openClientForm && (
        <ClientForm
          open={openClientForm}
          onClose={() => setOpenClientForm(false)}
          onSuccess={(phone) => handleClientCreated(phone)}
          onError={() => {}}
        />
      )}
    </Box>
  );
};

export default ServiceForm;

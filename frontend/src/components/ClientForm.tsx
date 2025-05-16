import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Grid, Box, Typography, CircularProgress } from '@mui/material';
import { useCreateClientMutation, useUpdateClientMutation } from '../services/api';
import { Client } from '../types';

interface ClientFormProps {
  client?: Client;
  isEditing?: boolean;
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Required'),
  name: Yup.string().required('Required'),
  phone: Yup.string().required('Required'),
  password: Yup.string().when('isEditing', {
    is: (isEditing: boolean) => !isEditing,
    then: (schema) => schema.required('Required'),
    otherwise: (schema) => schema,
  }),
});

const ClientForm: React.FC<ClientFormProps> = ({ client, isEditing = false, onSuccess }) => {
  const [createClient] = useCreateClientMutation();
  const [updateClient] = useUpdateClientMutation();
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: client?.email || '',
      name: client?.name || '',
      phone: client?.phone || '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditing && client?.id) {
          await updateClient({ id: client.id.toString(), client: values });
        } else {
          setGeneratedPassword(values.password);
          setShowPassword(false);
          await createClient(values);
          setShowPassword(true);
        }
        formik.resetForm();
        onSuccess?.();
      } catch (error) {
        console.error('Error saving client:', error);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Edit Client' : 'Add New Client'}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="phone"
            name="phone"
            label="Phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />
        </Grid>
        {!isEditing && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
          </Grid>
        )}
      </Grid>
      <Grid item xs={12}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? <CircularProgress size={24} /> : isEditing ? 'Update' : 'Create'}
        </Button>
      </Grid>
      {!isEditing && showPassword && generatedPassword && (
        <Box mt={2}>
          <Typography variant="subtitle1" color="success.main">
            Password for the new client: <b>{generatedPassword}</b>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ClientForm;

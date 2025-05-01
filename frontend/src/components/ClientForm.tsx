import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  CreateClientData,
  UpdateClientData,
  useCreateClientMutation,
  useUpdateClientMutation,
} from '../services/clientService';

interface ClientFormProps {
  client?: UpdateClientData & { id?: number };
  isEditing?: boolean;
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Required'),
  firstName: Yup.string().required('Required'),
  lastName: Yup.string().required('Required'),
  phone: Yup.string().required('Required'),
  password: Yup.string().when('isEditing', {
    is: (isEditing: boolean) => !isEditing,
    then: (schema) => schema.required('Required'),
    otherwise: (schema) => schema,
  }),
});

const ClientForm: React.FC<ClientFormProps> = ({
  client,
  isEditing = false,
  onSuccess,
}) => {
  const [createClient] = useCreateClientMutation();
  const [updateClient] = useUpdateClientMutation();

  const formik = useFormik({
    initialValues: {
      email: client?.email || '',
      firstName: client?.firstName || '',
      lastName: client?.lastName || '',
      phone: client?.phone || '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditing && client?.id) {
          await updateClient({ id: client.id, client: values });
        } else {
          await createClient(values);
        }
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
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="firstName"
            name="firstName"
            label="First Name"
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
            label="Last Name"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
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
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={formik.isSubmitting}
      >
        {formik.isSubmitting ? (
          <CircularProgress size={24} />
        ) : isEditing ? (
          'Update Client'
        ) : (
          'Add Client'
        )}
      </Button>
    </Box>
  );
};

export default ClientForm;

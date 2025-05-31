import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Barber } from '../types';

interface BarberFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (barber: Partial<Barber>) => Promise<void>;
  initialValues?: Partial<Barber>;
  isSubmitting?: boolean;
}

const validationSchema = Yup.object({
  firstName: Yup.string().required('El nombre es requerido'),
  lastName: Yup.string().required('El apellido es requerido'),
  phone: Yup.string()
    .required('El teléfono es requerido')
    .matches(/^\+?[\d\s-]{10,}$/, 'Formato de teléfono inválido'),
  email: Yup.string().email('Email inválido').nullable(),
  instagram: Yup.string().nullable(),
});

const BarberForm: React.FC<BarberFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  isSubmitting = false,
}) => {
  const formik = useFormik({
    initialValues: {
      firstName: initialValues?.firstName || '',
      lastName: initialValues?.lastName || '',
      phone: initialValues?.phone || '',
      email: initialValues?.email || '',
      instagram: initialValues?.instagram || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
      formik.resetForm();
    },
    enableReinitialize: true,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { overflowY: 'visible' },
      }}
    >
      <DialogTitle>{initialValues ? 'Editar Barbero' : 'Nuevo Barbero'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
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
                  disabled={isSubmitting}
                  required
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
                  disabled={isSubmitting}
                  required
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
                  disabled={isSubmitting}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  disabled={isSubmitting}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="instagram"
                  name="instagram"
                  label="Instagram"
                  value={formik.values.instagram}
                  onChange={formik.handleChange}
                  error={formik.touched.instagram && Boolean(formik.errors.instagram)}
                  helperText={formik.touched.instagram && formik.errors.instagram}
                  disabled={isSubmitting}
                  placeholder="@usuario"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !formik.isValid || !formik.dirty}
          >
            {isSubmitting ? <CircularProgress size={24} /> : initialValues ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BarberForm;

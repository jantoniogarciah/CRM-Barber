import React from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useCreateServiceMutation, useUpdateServiceMutation } from '../services/api';
import { Service } from '../types';

interface ServiceFormProps {
  open: boolean;
  onClose: () => void;
  service?: Service;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

interface ServiceFormValues {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
  price: Yup.number().required('Price is required').min(0, 'Price must be positive'),
  duration: Yup.number()
    .required('Duration is required')
    .min(1, 'Duration must be at least 1 minute'),
  category: Yup.string(),
});

const ServiceForm: React.FC<ServiceFormProps> = ({
  open,
  onClose,
  service,
  onSuccess,
  onError,
}) => {
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();

  const formik = useFormik<ServiceFormValues>({
    initialValues: {
      name: service?.name || '',
      description: service?.description || '',
      price: typeof service?.price === 'string' ? parseFloat(service.price) : service?.price || 0,
      duration: service?.duration || 30,
      category: service?.category || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const serviceData: Partial<Service> = {
          name: values.name,
          description: values.description,
          price: parseFloat(values.price.toString()),
          duration: parseInt(values.duration.toString(), 10),
          category: values.category || undefined,
          active: true,
        };

        if (service?.id) {
          await updateService({
            id: service.id.toString(),
            service: serviceData,
          }).unwrap();
          onSuccess?.('Service updated successfully');
          onClose();
          formik.resetForm();
        } else {
          await createService(serviceData).unwrap();
          onSuccess?.('Service created successfully');
          onClose();
          formik.resetForm();
        }
      } catch (error) {
        console.error('Error saving service:', error);
        onError?.(service?.id ? 'Error updating service' : 'Error creating service');
      }
    },
  });

  const isLoading = isCreating || isUpdating;

  const handleCancel = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{service ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Nombre"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Descripción"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="price"
              name="price"
              label="Precio"
              type="number"
              value={formik.values.price}
              onChange={formik.handleChange}
              error={formik.touched.price && Boolean(formik.errors.price)}
              helperText={formik.touched.price && formik.errors.price}
              disabled={isLoading}
              inputProps={{ step: 0.01, min: 0 }}
            />
            <TextField
              fullWidth
              id="duration"
              name="duration"
              label="Duración (minutos)"
              type="number"
              value={formik.values.duration}
              onChange={formik.handleChange}
              error={formik.touched.duration && Boolean(formik.errors.duration)}
              helperText={formik.touched.duration && formik.errors.duration}
              disabled={isLoading}
              inputProps={{ min: 1 }}
            />
            <FormControl fullWidth>
              <InputLabel id="category-label">Categoría</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                label="Categoría"
                disabled={isLoading}
              >
                <MenuItem value="">Ninguna</MenuItem>
                <MenuItem value="Cabello Hombre">Cabello Hombre</MenuItem>
                <MenuItem value="Barba">Barba</MenuItem>
                <MenuItem value="Producto">Producto</MenuItem>
                <MenuItem value="Cabello Mujer">Cabello Mujer</MenuItem>
                <MenuItem value="Cabello Niño">Cabello Niño</MenuItem>
                <MenuItem value="Promoción">Promoción</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} />}
          >
            {isLoading
              ? service
                ? 'Actualizando...'
                : 'Creando...'
              : service
              ? 'Actualizar'
              : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ServiceForm;

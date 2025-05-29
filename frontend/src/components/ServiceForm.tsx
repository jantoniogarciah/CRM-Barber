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
import {
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useGetCategoriesQuery,
} from '../services/api';
import { Service } from '../types';
import { toast } from 'react-hot-toast';

interface ServiceFormProps {
  open: boolean;
  onClose: () => void;
  service?: Service;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

interface ServiceFormValues {
  name: string;
  description: string;
  price: number;
  duration: number;
  categoryId: string;
  isActive: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .required('El nombre es requerido'),
  description: Yup.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .required('La descripción es requerida'),
  price: Yup.number().min(0, 'El precio no puede ser negativo').required('El precio es requerido'),
  duration: Yup.number()
    .min(1, 'La duración debe ser mayor a 0')
    .required('La duración es requerida'),
  categoryId: Yup.string().required('La categoría es requerida'),
  isActive: Yup.boolean(),
});

const CATEGORIES = [
  'Cabello Hombre',
  'Barba',
  'Producto',
  'Cabello Mujer',
  'Cabello Niño',
  'Promoción',
];

const ServiceForm: React.FC<ServiceFormProps> = ({
  open,
  onClose,
  service,
  onSuccess,
  onError,
}) => {
  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery({
    showInactive: false,
  });

  const formik = useFormik<ServiceFormValues>({
    initialValues: {
      name: service?.name || '',
      description: service?.description || '',
      price: service?.price || 0,
      duration: service?.duration || 30,
      categoryId: service?.categoryId || '',
      isActive: service?.isActive ?? true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const serviceData = {
          name: values.name,
          description: values.description,
          price: values.price,
          duration: values.duration,
          categoryId: values.categoryId,
          isActive: values.isActive,
        };

        if (service?.id) {
          await updateService({
            id: service.id.toString(),
            service: serviceData,
          }).unwrap();
        } else {
          await createService(serviceData).unwrap();
        }
        onSuccess('Servicio guardado exitosamente');
        onClose();
      } catch (error: any) {
        console.error('Error saving service:', error);
        let errorMessage = 'Error al guardar el servicio. ';

        if (error.data?.message) {
          errorMessage += error.data.message;
        } else if (error.message) {
          errorMessage += error.message;
        } else if (error.data?.errors) {
          errorMessage += error.data.errors.map((e: any) => e.msg).join(', ');
        }

        onError(errorMessage);
      }
    },
  });

  if (isLoadingCategories) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{service ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Nombre"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
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
            />

            <FormControl fullWidth>
              <InputLabel id="category-label">Categoría</InputLabel>
              <Select
                labelId="category-label"
                id="categoryId"
                name="categoryId"
                value={formik.values.categoryId}
                onChange={formik.handleChange}
                label="Categoría"
                error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
              >
                <MenuItem value="">Ninguna</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? (
              <CircularProgress size={24} />
            ) : service ? (
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

export default ServiceForm;

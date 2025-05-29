import React from 'react';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { useCreateServiceMutation, useUpdateServiceMutation, useGetCategoriesQuery } from '../../services/api';

const schema = yup.object().shape({
  name: yup.string().required('El nombre es requerido'),
  description: yup.string().required('La descripción es requerida'),
  price: yup
    .number()
    .typeError('El precio debe ser un número')
    .required('El precio es requerido')
    .min(0, 'El precio no puede ser negativo'),
  duration: yup
    .number()
    .typeError('La duración debe ser un número')
    .required('La duración es requerida')
    .min(1, 'La duración debe ser al menos 1 minuto'),
  categoryId: yup.string().required('La categoría es requerida'),
});

const ServiceForm = ({ service, onClose, onSuccess }) => {
  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();
  const { data: categories = [] } = useGetCategoriesQuery({ showInactive: false });
  const mode = service ? 'edit' : 'add';

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      price: service?.price || '',
      duration: service?.duration || '',
      categoryId: service?.categoryId || '',
    },
  });

  const handleFormSubmit = async (data) => {
    try {
      if (mode === 'add') {
        await createService(data).unwrap();
        toast.success('Servicio creado exitosamente');
      } else {
        await updateService({ id: service.id, service: data }).unwrap();
        toast.success('Servicio actualizado exitosamente');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error.data?.message || 'Error al guardar el servicio');
    }
  };

  return (
    <>
      <DialogTitle>{mode === 'add' ? 'Agregar Servicio' : 'Editar Servicio'}</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 2,
          }}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />

          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.categoryId}>
                <InputLabel>Categoría</InputLabel>
                <Select {...field} label="Categoría">
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && (
                  <Box sx={{ color: 'error.main', mt: 1, fontSize: '0.75rem' }}>
                    {errors.categoryId.message}
                  </Box>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Precio"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: '$',
                }}
                error={!!errors.price}
                helperText={errors.price?.message}
              />
            )}
          />

          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Duración (minutos)"
                type="number"
                fullWidth
                error={!!errors.duration}
                helperText={errors.duration?.message}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit(handleFormSubmit)} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : mode === 'add' ? 'Agregar' : 'Guardar'}
        </Button>
      </DialogActions>
    </>
  );
};

export default ServiceForm;

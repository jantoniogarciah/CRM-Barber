import React from 'react';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Barber } from '../types';
import { useCreateBarberMutation, useUpdateBarberMutation } from '../services/api';

interface BarberFormProps {
  barber?: Barber | null;
  open: boolean;
  onSuccess: () => void;
  onClose: () => void;
  onError: (error: string) => void;
}

const schema = yup.object().shape({
  firstName: yup.string().required('El nombre es requerido'),
  lastName: yup.string().required('El apellido es requerido'),
  phone: yup.string().required('El teléfono es requerido'),
  email: yup.string().transform((value) => value === '' ? null : value).nullable().email('Email inválido'),
  instagram: yup.string().transform((value) => value === '' ? null : value).nullable(),
});

const BarberForm: React.FC<BarberFormProps> = ({
  barber,
  onSuccess,
  onClose,
  onError,
}) => {
  const [createBarber] = useCreateBarberMutation();
  const [updateBarber] = useUpdateBarberMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: barber?.firstName || '',
      lastName: barber?.lastName || '',
      phone: barber?.phone || '',
      email: barber?.email || '',
      instagram: barber?.instagram || '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      console.log('Form data being submitted:', data);
      if (barber) {
        await updateBarber({ id: barber.id, barber: data }).unwrap();
      } else {
        const result = await createBarber(data).unwrap();
        console.log('Create barber response:', result);
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      onError(error.data?.message || 'Error al guardar el barbero');
    }
  };

  return (
    <>
      <DialogTitle>{barber ? 'Editar Barbero' : 'Nuevo Barbero'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Nombre"
              {...register('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              fullWidth
            />
            <TextField
              label="Apellido"
              {...register('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              fullWidth
            />
            <TextField
              label="Teléfono"
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              fullWidth
            />
            <TextField
              label="Email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />
            <TextField
              label="Instagram"
              {...register('instagram')}
              error={!!errors.instagram}
              helperText={errors.instagram?.message}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            {barber ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default BarberForm; 
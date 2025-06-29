import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { toast } from 'react-hot-toast';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import { useUpdateProfileMutation } from '../services/api';

const Profile = () => {
  const user = useAppSelector(selectUser);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData).unwrap();
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Mi Perfil
      </Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Apellido"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Perfil'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile;

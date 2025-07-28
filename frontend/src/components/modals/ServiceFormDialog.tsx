import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { Service } from '../../types';
import { useCreateServiceMutation, useUpdateServiceMutation } from '../../services/api';
import { toast } from 'react-hot-toast';

interface ServiceFormDialogProps {
  open: boolean;
  onClose: () => void;
  service: Service | null;
  onSuccess: () => void;
}

const ServiceFormDialog: React.FC<ServiceFormDialogProps> = ({
  open,
  onClose,
  service,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30',
    isActive: true,
  });

  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price.toString(),
        duration: service.duration?.toString() || '30',
        isActive: service.isActive,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '30',
        isActive: true,
      });
    }
  }, [service]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
      };

      if (service?.id) {
        await updateService({
          id: service.id,
          service: serviceData,
        }).unwrap();
        toast.success('Servicio actualizado exitosamente');
      } else {
        await createService(serviceData).unwrap();
        toast.success('Servicio creado exitosamente');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Error al guardar el servicio');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{service ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            name="name"
            label="Nombre"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <TextField
            name="description"
            label="Descripción"
            value={formData.description}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            name="price"
            label="Precio"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            fullWidth
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
          <TextField
            name="duration"
            label="Duración (minutos)"
            type="number"
            value={formData.duration}
            onChange={handleInputChange}
            fullWidth
            required
            InputProps={{
              endAdornment: <InputAdornment position="end">min</InputAdornment>,
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.name || !formData.price}
        >
          {service ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceFormDialog; 
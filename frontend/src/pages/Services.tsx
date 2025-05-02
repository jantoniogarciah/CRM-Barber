import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAppSelector } from '../store/hooks';
import { useGetServicesQuery, useDeleteServiceMutation } from '../services/api';
import ServiceForm from '../components/ServiceForm';
import { Service } from '../types';

const formatPrice = (price: number | string): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(numericPrice) ? `$${numericPrice.toFixed(2)}` : '$0.00';
};

const Services: React.FC = () => {
  const { data: services = [], isLoading, error } = useGetServicesQuery();
  const [deleteService] = useDeleteServiceMutation();
  const { user } = useAppSelector((state) => state.auth);
  const [openForm, setOpenForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      try {
        await deleteService(id);
        setSuccessMessage('Servicio eliminado exitosamente');
      } catch (error) {
        setErrorMessage('Error al eliminar el servicio');
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al cargar los servicios: {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Servicios
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Nuevo Servicio
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Duración (min)</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services?.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>{service.category || 'N/A'}</TableCell>
                  <TableCell>{formatPrice(service.price)}</TableCell>
                  <TableCell>{service.duration}</TableCell>
                  <TableCell>
                    <Chip
                      label={service.active ? 'Activo' : 'Inactivo'}
                      color={service.active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(service)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(service.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ServiceForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        service={selectedService}
        onSuccess={(message) => {
          setOpenForm(false);
          setSelectedService(undefined);
          setSuccessMessage(message);
        }}
        onError={(message) => setErrorMessage(message)}
      />

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
      >
        <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Services;

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
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAppSelector } from '../store/hooks';
import {
  useGetServicesQuery,
  useDeleteServiceMutation,
  useUpdateServiceMutation,
} from '../services/api';
import ServiceForm from '../components/ServiceForm';
import { Service } from '../types';

const formatPrice = (price: number | string): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(numericPrice) ? `$${numericPrice.toFixed(2)}` : '$0.00';
};

const Services: React.FC = () => {
  const [showInactive, setShowInactive] = useState(false);
  const { data: services = [], isLoading, error } = useGetServicesQuery({ showInactive });
  const [deleteService] = useDeleteServiceMutation();
  const [updateService] = useUpdateServiceMutation();
  const { user } = useAppSelector((state) => state.auth);
  const [openForm, setOpenForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setOpenForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      try {
        await deleteService(id.toString());
        setSuccessMessage('Servicio eliminado exitosamente');
      } catch (error) {
        setErrorMessage('Error al eliminar el servicio');
      }
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      const result = await updateService({
        id: service.id.toString(),
        service: {
          active: !service.active,
        },
      }).unwrap();

      setSuccessMessage(`Servicio ${!service.active ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      console.error('Error updating service status:', error);
      setErrorMessage('Error al actualizar el estado del servicio');
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
        Error al cargar los servicios
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Servicios
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                color="primary"
              />
            }
            label="Mostrar servicios inactivos"
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
          >
            Nuevo Servicio
          </Button>
        </Box>
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
                    <Switch
                      checked={service.active}
                      onChange={() => handleToggleStatus(service)}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(service)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(service.id)} color="error">
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

      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => setErrorMessage('')}>
        <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Services;

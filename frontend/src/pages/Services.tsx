import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Alert,
  Switch,
  FormControlLabel,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  useGetServicesQuery,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useToggleServiceStatusMutation,
} from '../services/api';
import ServiceForm from '../components/services/ServiceForm';
import { Service } from '../types';
import { toast } from 'react-hot-toast';

const Services = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const { data: services = [], isLoading, error, refetch } = useGetServicesQuery({ showInactive });
  const [updateService] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();
  const [toggleStatus] = useToggleServiceStatusMutation();

  const handleAddClick = () => {
    setSelectedService(null);
    setFormOpen(true);
  };

  const handleEditClick = (service: Service) => {
    setSelectedService(service);
    setFormOpen(true);
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (serviceToDelete) {
      try {
        await deleteService(serviceToDelete.id).unwrap();
        await refetch();
        toast.success('Servicio eliminado exitosamente');
      } catch (error: any) {
        toast.error(error.data?.message || 'Error al eliminar el servicio');
      }
    }
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedService(null);
  };

  const handleFormSuccess = async () => {
    await refetch();
    handleFormClose();
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      await toggleStatus(service.id).unwrap();
      toast.success(`Servicio ${service.isActive ? 'desactivado' : 'activado'} exitosamente`);
      refetch();
    } catch (error) {
      console.error('Error updating service status:', error);
      toast.error('Error al actualizar el estado del servicio');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  if (isLoading) {
    return (
      <Container>
        <Typography>Cargando servicios...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">Error al cargar los servicios</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Servicios</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                color="primary"
              />
            }
            label="Mostrar Servicios Inactivos"
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Agregar Servicio
          </Button>
        </Box>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Duración</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow
                key={service.id}
                sx={{
                  opacity: service.isActive ? 1 : 0.6,
                  backgroundColor: service.isActive ? 'inherit' : 'action.hover',
                }}
              >
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.description}</TableCell>
                <TableCell>{formatPrice(service.price)}</TableCell>
                <TableCell>{service.duration} min</TableCell>
                <TableCell>{service.category?.name || 'Sin categoría'}</TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={service.isActive}
                        onChange={() => handleToggleStatus(service)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={service.isActive ? 'Activo' : 'Inactivo'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(service)}
                    title="Editar servicio"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(service)}
                    title="Eliminar servicio"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setServiceToDelete(null);
        }}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography paragraph>
              ¿Estás seguro de que deseas eliminar el servicio "{serviceToDelete?.name}"?
            </Typography>
            <Typography paragraph>
              <strong>Advertencia:</strong> Esta acción eliminará permanentemente el servicio de la base de datos y no se puede deshacer.
            </Typography>
            <Typography>
              Si el servicio tiene citas asociadas, no podrá ser eliminado y deberá ser desactivado en su lugar.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setServiceToDelete(null);
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar Permanentemente
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={formOpen} onClose={handleFormClose} maxWidth="md" fullWidth>
        <ServiceForm
          service={selectedService}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      </Dialog>
    </Container>
  );
};

export default Services;

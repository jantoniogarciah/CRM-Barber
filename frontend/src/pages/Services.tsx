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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAppSelector } from '../store/hooks';
import {
  useGetServicesQuery,
  useDeleteServiceMutation,
  useUpdateServiceMutation,
  useGetCategoriesQuery,
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
  const { data: categories = [] } = useGetCategoriesQuery({ showInactive: false });
  const [deleteService] = useDeleteServiceMutation();
  const [updateService] = useUpdateServiceMutation();
  const { user } = useAppSelector((state) => state.auth);
  const [openForm, setOpenForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const getCategoryName = (categoryId: number | null | undefined) => {
    if (!categoryId) return 'N/A';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setOpenForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    
    try {
      await deleteService(serviceToDelete.id.toString());
      setSuccessMessage('Servicio eliminado exitosamente');
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Error al eliminar el servicio';
      setErrorMessage(errorMessage);
      if (!error.data?.message?.includes('citas asociadas')) {
        setDeleteDialogOpen(false);
        setServiceToDelete(null);
      }
    }
  };

  const handleDelete = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      await updateService({
        id: service.id.toString(),
        service: {
          is_active: !service.is_active,
        },
      }).unwrap();

      setSuccessMessage(`Servicio ${service.is_active ? 'desactivado' : 'activado'} exitosamente`);
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
                <TableCell>Precio</TableCell>
                <TableCell>Duración (min)</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services?.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>{formatPrice(service.price)}</TableCell>
                  <TableCell>{service.duration} min</TableCell>
                  <TableCell>{getCategoryName(service.category_id)}</TableCell>
                  <TableCell>
                    <Tooltip title={service.is_active ? 'Desactivar servicio' : 'Activar servicio'}>
                      <Switch
                        checked={service.is_active}
                        onChange={() => handleToggleStatus(service)}
                        color="primary"
                        size="small"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Editar servicio">
                      <IconButton size="small" onClick={() => handleEdit(service)} color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar servicio">
                      <IconButton size="small" onClick={() => handleDelete(service)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ServiceForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedService(undefined);
        }}
        service={selectedService}
        onSuccess={(message) => {
          setOpenForm(false);
          setSelectedService(undefined);
          setSuccessMessage(message);
        }}
        onError={(message) => setErrorMessage(message)}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setServiceToDelete(null);
        }}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el servicio "{serviceToDelete?.name}"?
            <br /><br />
            <strong>Advertencia:</strong> Esta acción eliminará permanentemente el servicio de la base de datos y no se puede deshacer. 
            Si el servicio tiene citas asociadas, no podrá ser eliminado y deberá ser desactivado en su lugar.
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

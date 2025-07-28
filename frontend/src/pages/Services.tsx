import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
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
  Grid,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Block as BlockIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import {
  useGetServicesQuery,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useToggleServiceStatusMutation,
} from '../services/api';
import { Service } from '../types';
import { toast } from 'react-hot-toast';
import ServiceFormDialog from '../components/modals/ServiceFormDialog';
import DeleteConfirmDialog from '../components/modals/DeleteConfirmDialog';

const Services = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const { data: services = [], isLoading, error, refetch } = useGetServicesQuery({ showInactive });
  const [updateService] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();
  const [toggleStatus] = useToggleServiceStatusMutation();

  const handleOpenCreate = () => {
    setSelectedService(null);
    setOpenDialog(true);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    setServiceToDelete({ id } as Service);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (serviceToDelete) {
      try {
        await deleteService(serviceToDelete.id).unwrap();
        await refetch();
        toast.success('Servicio eliminado exitosamente');
      } catch (error: any) {
        toast.error(error.data?.message || 'Error al eliminar el servicio');
      }
    }
    setOpenDeleteDialog(false);
    setServiceToDelete(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedService(null);
  };

  const handleSuccess = async () => {
    await refetch();
    handleCloseDialog();
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

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      p: { xs: 2, sm: 3 }
    }}>
      <Box sx={{ 
        mb: 4,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          Servicios
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Nuevo Servicio
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3, overflow: 'hidden' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                />
              }
              label="Mostrar inactivos"
            />
          </Grid>
        </Grid>
      </Paper>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar servicios
        </Alert>
      ) : (
        <TableContainer 
          component={Paper}
          sx={{ 
            overflow: 'auto',
            maxWidth: '100%',
            '& .MuiTable-root': {
              minWidth: 800,
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services?.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>${service.price}</TableCell>
                  <TableCell>
                    <Chip
                      label={service.isActive ? 'Activo' : 'Inactivo'}
                      color={service.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(service)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(service)}
                        color="warning"
                      >
                        {service.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(service.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modales */}
      <ServiceFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        service={selectedService}
        onSuccess={handleSuccess}
      />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Servicio"
        content="¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer."
      />
    </Box>
  );
};

export default Services;

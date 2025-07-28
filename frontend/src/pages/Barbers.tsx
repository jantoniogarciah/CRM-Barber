import React, { useState, useEffect } from 'react';
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
  IconButton,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  Tooltip,
  Link,
  Grid,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  WhatsApp as WhatsAppIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  useGetBarbersQuery,
  useCreateBarberMutation,
  useUpdateBarberMutation,
  useDeleteBarberMutation,
  useToggleBarberStatusMutation,
} from '../services/api';
import BarberForm from '../components/BarberForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { Barber } from '../types';
import LoadingScreen from '../components/LoadingScreen';
import { format } from 'date-fns';
import { Alert } from '@mui/material';

const BarbersPage: React.FC = () => {
  console.log('BarbersPage - Component rendering');

  useEffect(() => {
    console.log('BarbersPage - Component mounted');
    return () => {
      console.log('BarbersPage - Component unmounted');
    };
  }, []);

  const { enqueueSnackbar } = useSnackbar();
  const [showInactive, setShowInactive] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Partial<Barber> | null>(null);

  const { data: barbers = [], isLoading, refetch, error } = useGetBarbersQuery({ showInactive });

  useEffect(() => {
    if (error) {
      console.error('BarbersPage - Error fetching barbers:', error);
    }
  }, [error]);

  const [createBarber, { isLoading: isCreating }] = useCreateBarberMutation();
  const [updateBarber, { isLoading: isUpdating }] = useUpdateBarberMutation();
  const [deleteBarber, { isLoading: isDeleting }] = useDeleteBarberMutation();
  const [toggleBarberStatus] = useToggleBarberStatusMutation();

  const handleOpenForm = (barber?: Barber) => {
    setSelectedBarber(barber || null);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedBarber(null);
  };

  const handleOpenConfirmDialog = (barber: Barber) => {
    setSelectedBarber(barber);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setSelectedBarber(null);
  };

  const handleSubmit = async (barber: Partial<Barber>) => {
    try {
      if (selectedBarber?.id) {
        await updateBarber({
          id: selectedBarber.id,
          barber,
        }).unwrap();
        enqueueSnackbar('Barbero actualizado exitosamente', { variant: 'success' });
      } else {
        await createBarber(barber).unwrap();
        enqueueSnackbar('Barbero creado exitosamente', { variant: 'success' });
      }
      handleCloseForm();
      refetch();
    } catch (error: any) {
      console.error('Error saving barber:', error);
      enqueueSnackbar(error.data?.message || 'Error al guardar el barbero', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedBarber?.id) return;

    try {
      await deleteBarber(selectedBarber.id).unwrap();
      enqueueSnackbar('Barbero eliminado exitosamente', { variant: 'success' });
      handleCloseConfirmDialog();
      refetch();
    } catch (error: any) {
      console.error('Error deleting barber:', error);
      enqueueSnackbar(error.data?.message || 'Error al eliminar el barbero', { variant: 'error' });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleBarberStatus(id).unwrap();
      enqueueSnackbar('Estado del barbero actualizado exitosamente', { variant: 'success' });
      refetch();
    } catch (error: any) {
      console.error('Error toggling barber status:', error);
      enqueueSnackbar(error.data?.message || 'Error al actualizar el estado del barbero', {
        variant: 'error',
      });
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove any non-numeric characters
    return phone.replace(/\D/g, '');
  };

  if (isLoading) {
    console.log('BarbersPage - Loading state');
    return <LoadingScreen />;
  }

  console.log('BarbersPage - Rendering with data:', { barbers, showInactive });

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
          Barberos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Nuevo Barbero
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
          Error al cargar barberos
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
                <TableCell>Email</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {barbers?.map((barber) => (
                <TableRow key={barber.id}>
                  <TableCell>
                    {barber.firstName} {barber.lastName}
                  </TableCell>
                  <TableCell>{barber.email}</TableCell>
                  <TableCell>{barber.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={barber.isActive ? 'Activo' : 'Inactivo'}
                      color={barber.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(barber)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(barber.id)}
                        color="warning"
                      >
                        {barber.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenConfirmDialog(barber)}
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
      <BarberForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialValues={selectedBarber || undefined}
        isSubmitting={isCreating || isUpdating}
      />

      <ConfirmDialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleDelete}
        title="Eliminar Barbero"
        content="¿Estás seguro de que deseas eliminar este barbero? Esta acción no se puede deshacer."
        isSubmitting={isDeleting}
      />
    </Box>
  );
};

export default BarbersPage;

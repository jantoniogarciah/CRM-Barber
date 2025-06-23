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
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import {
  useGetBarbersQuery,
  useCreateBarberMutation,
  useUpdateBarberMutation,
  useDeleteBarberMutation,
  useToggleBarberStatusMutation,
} from '../store/services/barberApi';
import BarberForm from '../components/BarberForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { Barber } from '../types';
import { format } from 'date-fns';

const BarbersPage: React.FC = () => {
  const [showInactive, setShowInactive] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Partial<Barber> | null>(null);

  const { data: barbers = [], isLoading, error } = useGetBarbersQuery({ showInactive });
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
        toast.success('Barbero actualizado exitosamente');
      } else {
        await createBarber(barber).unwrap();
        toast.success('Barbero creado exitosamente');
      }
      handleCloseForm();
    } catch (error: any) {
      console.error('Error saving barber:', error);
      toast.error(error.data?.message || 'Error al guardar el barbero');
    }
  };

  const handleDelete = async () => {
    if (!selectedBarber?.id) return;

    try {
      await deleteBarber(selectedBarber.id).unwrap();
      toast.success('Barbero eliminado exitosamente');
      handleCloseConfirmDialog();
    } catch (error: any) {
      console.error('Error deleting barber:', error);
      toast.error(error.data?.message || 'Error al eliminar el barbero');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleBarberStatus(id).unwrap();
      toast.success('Estado del barbero actualizado exitosamente');
    } catch (error: any) {
      console.error('Error toggling barber status:', error);
      toast.error(error.data?.message || 'Error al actualizar el estado del barbero');
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove any non-numeric characters
    return phone.replace(/\D/g, '');
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error al cargar los barberos. Por favor, intenta nuevamente.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Barberos
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
            label="Mostrar inactivos"
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            disabled={isCreating}
          >
            Nuevo Barbero
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Instagram</TableCell>
              <TableCell>Fecha de registro</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {barbers.map((barber) => (
              <TableRow
                key={barber.id}
                sx={{
                  opacity: barber.isActive ? 1 : 0.6,
                  backgroundColor: barber.isActive ? 'inherit' : 'action.hover',
                  transition: 'all 0.3s ease',
                }}
              >
                <TableCell>{`${barber.firstName} ${barber.lastName}`}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {barber.phone}
                    <Tooltip title="Enviar mensaje por WhatsApp">
                      <Link
                        href={`https://wa.me/${formatPhoneForWhatsApp(barber.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconButton size="small" color="success">
                          <WhatsAppIcon />
                        </IconButton>
                      </Link>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>{barber.email || '-'}</TableCell>
                <TableCell>{barber.instagram || '-'}</TableCell>
                <TableCell>
                  {barber.createdAt ? format(new Date(barber.createdAt), 'dd/MM/yyyy') : '-'}
                </TableCell>
                <TableCell>
                  <Tooltip title={barber.isActive ? 'Desactivar barbero' : 'Activar barbero'}>
                    <Switch
                      checked={barber.isActive}
                      onChange={() => handleToggleStatus(barber.id)}
                      color="primary"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenForm(barber)}
                    disabled={isUpdating}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenConfirmDialog(barber)}
                    disabled={isDeleting}
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

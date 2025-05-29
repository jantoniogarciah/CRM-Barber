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
  useGetBarbersQuery,
  useToggleBarberStatusMutation,
  useDeleteBarberMutation,
} from '../services/api';
import BarberForm from '../components/BarberForm';
import { Barber } from '../types';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const Barbers = () => {
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [barberToDelete, setBarberToDelete] = useState<Barber | null>(null);

  const { data: barbers = [], isLoading, refetch } = useGetBarbersQuery({ showInactive });
  const [toggleBarberStatus] = useToggleBarberStatusMutation();
  const [deleteBarber] = useDeleteBarberMutation();

  const handleAdd = () => {
    setSelectedBarber(null);
    setFormOpen(true);
  };

  const handleEdit = (barber: Barber) => {
    setSelectedBarber(barber);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedBarber(null);
  };

  const handleFormSuccess = async () => {
    setFormOpen(false);
    setSelectedBarber(null);
    await refetch();
    toast.success(selectedBarber ? 'Barbero actualizado exitosamente' : 'Barbero creado exitosamente');
  };

  const handleDelete = (barber: Barber) => {
    setBarberToDelete(barber);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (barberToDelete) {
      try {
        await deleteBarber(barberToDelete.id).unwrap();
        await refetch();
        toast.success('Barbero eliminado exitosamente');
      } catch (error: any) {
        toast.error(error.data?.message || 'Error al eliminar el barbero');
      }
    }
    setDeleteDialogOpen(false);
    setBarberToDelete(null);
  };

  const handleToggleStatus = async (barber: Barber) => {
    try {
      await toggleBarberStatus(barber.id).unwrap();
      await refetch();
      toast.success(`Barbero ${barber.isActive ? 'desactivado' : 'activado'} exitosamente`);
    } catch (error: any) {
      console.error('Error toggling barber status:', error);
      toast.error(error.data?.message || 'Error al actualizar el estado del barbero');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Cargando barberos...</Typography>
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Barberos</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                color="primary"
              />
            }
            label="Mostrar Barberos Inactivos"
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Agregar Barbero
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Instagram</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Creado</TableCell>
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
                <TableCell>{barber.phone}</TableCell>
                <TableCell>
                  {barber.instagram ? (
                    <a
                      href={`https://www.instagram.com/${barber.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', color: '#1976d2' }}
                    >
                      {barber.instagram}
                    </a>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{barber.email || '-'}</TableCell>
                <TableCell>
                  {barber.createdAt ? format(new Date(barber.createdAt), 'yyyy-MM-dd') : ''}
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={barber.isActive}
                        onChange={() => handleToggleStatus(barber)}
                        color="primary"
                      />
                    }
                    label={barber.isActive ? 'Activo' : 'Inactivo'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(barber)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(barber)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={formOpen} onClose={handleFormClose} maxWidth="md" fullWidth>
        {formOpen && (
          <BarberForm
            barber={selectedBarber}
            open={formOpen}
            onSuccess={handleFormSuccess}
            onClose={handleFormClose}
            onError={(error: string) => toast.error(error)}
          />
        )}
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setBarberToDelete(null);
        }}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography paragraph>
              ¿Estás seguro de que deseas eliminar al barbero "{barberToDelete?.firstName} {barberToDelete?.lastName}"?
            </Typography>
            <Typography paragraph>
              <strong>Advertencia:</strong> Esta acción eliminará permanentemente el barbero de la base de datos y no se puede deshacer.
            </Typography>
            <Typography>
              Si el barbero tiene citas asociadas, no podrá ser eliminado y deberá ser desactivado en su lugar.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setBarberToDelete(null);
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar Permanentemente
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Barbers; 
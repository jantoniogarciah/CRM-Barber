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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Switch,
  FormControlLabel,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  useGetClientsQuery,
  useToggleClientStatusMutation,
  useDeleteClientMutation,
} from '../services/api';
import ClientForm from '../components/ClientForm';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Client } from '../types';
import { toast } from 'react-hot-toast';

const Clients: React.FC = () => {
  const [showInactive, setShowInactive] = useState(false);
  const { data: clients = [], isLoading, refetch } = useGetClientsQuery({ showInactive });
  const [toggleClientStatus] = useToggleClientStatusMutation();
  const [deleteClient] = useDeleteClientMutation();
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedClient(undefined);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedClient(undefined);
  };

  const handleFormSuccess = async () => {
    setFormOpen(false);
    setSelectedClient(undefined);
    await refetch();
    toast.success(
      selectedClient ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente'
    );
  };

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (clientToDelete) {
      try {
        await deleteClient(clientToDelete.id).unwrap();
        await refetch();
        toast.success('Cliente eliminado exitosamente');
      } catch (error: any) {
        toast.error(error.data?.message || 'Error al eliminar el cliente');
      }
    }
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const handleToggleStatus = async (client: Client) => {
    try {
      setTogglingId(client.id);
      await toggleClientStatus(client.id).unwrap();
      await refetch();
      toast.success(`Cliente ${client.isActive ? 'desactivado' : 'activado'} exitosamente`);
    } catch (error: any) {
      console.error('Error toggling client status:', error);
      toast.error(error.data?.message || 'Error al actualizar el estado del cliente');
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Clientes</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                color="primary"
              />
            }
            label="Mostrar Clientes Inactivos"
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Agregar Cliente
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Notas</TableCell>
              <TableCell>Creado</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client.id}
                sx={{
                  opacity: client.isActive ? 1 : 0.6,
                  backgroundColor: client.isActive ? 'inherit' : 'action.hover',
                  transition: 'all 0.3s ease',
                }}
              >
                <TableCell>{`${client.firstName} ${client.lastName}`}</TableCell>
                <TableCell>{client.email || '-'}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.notes || '-'}</TableCell>
                <TableCell>
                  {client.createdAt ? format(new Date(client.createdAt), 'yyyy-MM-dd') : ''}
                </TableCell>
                <TableCell>
                  <Tooltip title={client.isActive ? 'Click para desactivar' : 'Click para activar'}>
                    <Switch
                      checked={client.isActive}
                      onChange={() => handleToggleStatus(client)}
                      disabled={togglingId === client.id}
                      color="primary"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(client)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(client)}>
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
          <ClientForm
            client={selectedClient}
            open={formOpen}
            onSuccess={async () => {
              await handleFormSuccess();
              toast.success('Cliente guardado exitosamente');
            }}
            onClose={handleFormClose}
            onError={(error) => toast.error(error)}
          />
        )}
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar a{' '}
            {clientToDelete
              ? `${clientToDelete.firstName} ${clientToDelete.lastName}`
              : 'este cliente'}
            ? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Clients;

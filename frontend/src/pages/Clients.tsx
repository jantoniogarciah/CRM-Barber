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
  Snackbar,
  Alert,
  Button,
  Dialog,
  Switch,
  FormControlLabel,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useAppSelector } from '../store/hooks';
import {
  useGetClientsQuery,
  useDeleteClientMutation,
  useToggleClientStatusMutation,
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
  const { data: clients = [], isLoading } = useGetClientsQuery({ showInactive });
  const [deleteClient] = useDeleteClientMutation();
  const [toggleClientStatus] = useToggleClientStatusMutation();
  const [selectedClient, setSelectedClient] = React.useState<Client | undefined>(undefined);
  const [formOpen, setFormOpen] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<number | null>(null);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const { user } = useAppSelector((state) => state.auth);
  const [error, setError] = React.useState<string | null>(null);

  const handleEdit = (client: Client) => {
    console.log('handleEdit called with client:', client);
    setSelectedClient(client);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedClient(undefined);
    setFormOpen(true);
  };

  const handleDelete = async (clientId: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        console.log('Deleting client with ID:', clientId);
        await deleteClient(clientId.toString()).unwrap();
        console.log('Client deleted successfully');
        setSnackbar({
          open: true,
          message: 'Client deleted successfully',
          severity: 'success',
        });
      } catch (error) {
        console.error('Error deleting client:', error);
        setSnackbar({
          open: true,
          message: 'Error deleting client',
          severity: 'error',
        });
      }
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedClient(undefined);
  };

  const handleFormSuccess = () => {
    console.log('Form success handler called');
    setFormOpen(false);
    setSelectedClient(undefined);
    setSnackbar({
      open: true,
      message: selectedClient ? 'Client updated successfully' : 'Client created successfully',
      severity: 'success',
    });
  };

  const handleToggleStatus = async (id: number) => {
    try {
      setTogglingId(id);
      console.log('Toggling client status for ID:', id);
      const result = await toggleClientStatus(id).unwrap();
      console.log('Toggle result:', result);
      toast.success('Estado del cliente actualizado exitosamente');
    } catch (error) {
      console.error('Error toggling client status:', error);
      toast.error('Error al actualizar el estado del cliente');
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
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
                  opacity: client.is_active ? 1 : 0.6,
                  backgroundColor: client.is_active ? 'inherit' : 'action.hover',
                  transition: 'all 0.3s ease',
                }}
              >
                <TableCell>{`${client.firstName} ${client.lastName}`}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.notes || '-'}</TableCell>
                <TableCell>
                  {client.created_at ? format(new Date(client.created_at), 'yyyy-MM-dd') : ''}
                </TableCell>
                <TableCell>
                  <Chip
                    label={client.is_active ? 'Activo' : 'Inactivo'}
                    color={client.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(client)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(client.id)}>
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
            open={Boolean(selectedClient) || formOpen}
            onSuccess={handleFormSuccess}
            onClose={handleFormClose}
            onError={(error) => setError(error)}
          />
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Clients;

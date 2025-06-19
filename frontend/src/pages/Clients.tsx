import React from 'react';
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
  Link,
} from '@mui/material';
import {
  useGetClientsQuery,
  useToggleClientStatusMutation,
  useDeleteClientMutation,
  useGetLastCompletedAppointmentsQuery,
} from '../services/api';
import ClientForm from '../components/ClientForm';
import { format, differenceInDays } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Client, Appointment } from '../types';
import { toast } from 'react-hot-toast';

interface ChangeEvent {
  target: {
    checked: boolean;
  };
}

interface ApiError {
  data?: {
    message?: string;
  };
  error?: string;
  message?: string;
  status?: string;
}

const Clients = () => {
  const [showInactive, setShowInactive] = React.useState(false);
  const { data: clients = [], isLoading, refetch } = useGetClientsQuery({ showInactive });
  const { data: lastAppointments = {} } = useGetLastCompletedAppointmentsQuery();
  const [toggleClientStatus] = useToggleClientStatusMutation();
  const [deleteClient] = useDeleteClientMutation();
  const [selectedClient, setSelectedClient] = React.useState<Client | undefined>(undefined);
  const [formOpen, setFormOpen] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

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
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClient) return;

    try {
      await deleteClient(selectedClient.id);
      toast.success('Cliente eliminado exitosamente');
      setDeleteDialogOpen(false);
      setSelectedClient(undefined);
    } catch (error: unknown) {
      const err = error as ApiError;
      const message =
        err.data?.message || err.error || err.message || 'Error al eliminar el cliente';
      toast.error(message);
    }
  };

  const handleToggleStatus = async (client: Client) => {
    try {
      setTogglingId(client.id);
      await toggleClientStatus(client.id).unwrap();
      await refetch();
      toast.success(`Cliente ${client.status === 'ACTIVE' ? 'desactivado' : 'activado'} exitosamente`);
    } catch (error: any) {
      const err = error as ApiError;
      const message =
        err.data?.message || err.error || err.message || 'Error al cambiar el estado del cliente';
      toast.error(message);
    } finally {
      setTogglingId(null);
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove any non-numeric characters
    return phone.replace(/\D/g, '');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Clientes</Typography>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e: ChangeEvent) => setShowInactive(e.target.checked)}
              />
            }
            label="Mostrar inactivos"
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} sx={{ ml: 2 }}>
            Nuevo Cliente
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
              <TableCell>Días desde última cita</TableCell>
              <TableCell>Creado</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => {
              const lastAppointment = lastAppointments[client.id];
              const daysSinceLastAppointment = lastAppointment
                ? differenceInDays(new Date(), new Date(lastAppointment.date))
                : null;

              return (
                <TableRow
                  key={client.id}
                  sx={{
                    opacity: client.status === 'ACTIVE' ? 1 : 0.5,
                    backgroundColor: client.status === 'ACTIVE' ? 'transparent' : '#f5f5f5',
                    '&:hover': {
                      backgroundColor: client.status === 'ACTIVE' ? '#f8f8f8' : '#eeeeee',
                    },
                  }}
                >
                  <TableCell>{`${client.firstName} ${client.lastName}`}</TableCell>
                  <TableCell>{client.email || '-'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {client.phone}
                      <Tooltip title="Enviar mensaje por WhatsApp">
                        <Link
                          href={`https://wa.me/${formatPhoneForWhatsApp(client.phone)}`}
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
                  <TableCell>{client.notes || '-'}</TableCell>
                  <TableCell>
                    <Typography
                      component="span"
                      sx={{
                        color:
                          daysSinceLastAppointment && daysSinceLastAppointment > 20
                            ? 'error.main'
                            : 'inherit',
                      }}
                    >
                      {daysSinceLastAppointment !== null
                        ? `${daysSinceLastAppointment} días`
                        : 'Sin citas'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {client.createdAt ? format(new Date(client.createdAt), 'dd/MM/yyyy') : ''}
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={client.status === 'ACTIVE' ? 'Click para desactivar' : 'Click para activar'}
                    >
                      <Switch
                        checked={client.status === 'ACTIVE'}
                        onChange={() => handleToggleStatus(client)}
                        disabled={togglingId === client.id}
                        color="primary"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(client)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(client)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {formOpen && (
        <ClientForm
          open={formOpen}
          onClose={handleFormClose}
          client={selectedClient}
          onSuccess={handleFormSuccess}
          onError={(message: string) => toast.error(message)}
        />
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Clients;

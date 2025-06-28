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
  TextField,
  TablePagination,
} from '@mui/material';
import {
  useGetClientsQuery,
  useToggleClientStatusMutation,
  useDeleteClientMutation,
  useGetLastCompletedAppointmentsQuery,
} from '../services/api';
import ClientForm from '../components/ClientForm';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
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
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [searchPhone, setSearchPhone] = React.useState('');
  const [searchTimeout, setSearchTimeout] = React.useState<ReturnType<typeof setTimeout> | null>(null);

  const { 
    data: clientsData, 
    isLoading,
    refetch 
  } = useGetClientsQuery({ 
    showInactive,
    page,
    limit,
    phone: searchPhone
  });

  const { data: lastAppointments = {} } = useGetLastCompletedAppointmentsQuery();
  const [toggleClientStatus] = useToggleClientStatusMutation();
  const [deleteClient] = useDeleteClientMutation();
  const [selectedClient, setSelectedClient] = React.useState<Client | undefined>(undefined);
  const [formOpen, setFormOpen] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const clients = clientsData?.clients || [];
  const pagination = clientsData?.pagination || { total: 0, totalPages: 0 };

  // Efecto para loguear cambios en los clientes y showInactive
  React.useEffect(() => {
    console.log('Clients state changed:', { 
      showInactive, 
      page,
      limit,
      searchPhone,
      clientsCount: clients.length,
      activeClients: clients.filter(c => c.status === 'ACTIVE').length,
      inactiveClients: clients.filter(c => c.status === 'INACTIVE').length,
      pagination
    });
  }, [clients, showInactive, page, limit, searchPhone, pagination]);

  const handlePhoneSearch = (value: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setSearchPhone(value);
      setPage(1); // Reset to first page when searching
    }, 500);

    setSearchTimeout(timeout);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page when changing limit
  };

  const handleShowExistingClient = async (clientId: string) => {
    console.log('Showing existing client:', clientId);
    const client = clients.find(c => c.id === clientId);
    
    if (client) {
      console.log('Found client:', client);
      if (client.status === 'INACTIVE' && !showInactive) {
        console.log('Client is inactive, enabling showInactive');
        setShowInactive(true);
        // Esperamos a que se actualice el estado y refrescamos
        await refetch();
      }
      // Hacemos scroll al cliente
      const element = document.getElementById(`client-row-${clientId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Añadimos un highlight temporal
        element.style.backgroundColor = '#e3f2fd';
        setTimeout(() => {
          element.style.backgroundColor = '';
        }, 2000);
      }
    } else {
      console.log('Client not found in current list');
      // Si no encontramos el cliente, forzamos una actualización
      await refetch();
    }
  };

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
          <TextField
            size="small"
            placeholder="Buscar por teléfono..."
            onChange={(e) => handlePhoneSearch(e.target.value)}
            sx={{ mr: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e: ChangeEvent) => {
                  console.log('Toggling showInactive:', e.target.checked);
                  setShowInactive(e.target.checked);
                  setPage(1); // Reset to first page when toggling inactive
                }}
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
              <TableCell>Última visita</TableCell>
              <TableCell>Creado</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No se encontraron clientes
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => {
                const lastAppointment = lastAppointments[client.id];
                const daysSinceLastAppointment = lastAppointment
                  ? differenceInDays(new Date(), new Date(lastAppointment.date))
                  : null;

                return (
                  <TableRow
                    key={client.id}
                    id={`client-row-${client.id}`}
                    sx={{
                      opacity: client.status === 'ACTIVE' ? 1 : 0.5,
                      backgroundColor: client.status === 'ACTIVE' ? 'transparent' : '#f5f5f5',
                      '&:hover': {
                        backgroundColor: client.status === 'ACTIVE' ? '#f8f8f8' : '#eeeeee',
                      },
                      transition: 'background-color 0.3s ease',
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
                      {client.lastVisit ? (
                        <>
                          {format(new Date(client.lastVisit), "d 'de' MMMM 'de' yyyy", { locale: es })}
                          <br />
                          <Typography variant="caption" color="textSecondary">
                            {differenceInDays(new Date(), new Date(client.lastVisit))} días
                          </Typography>
                        </>
                      ) : (
                        'Sin visitas'
                      )}
                    </TableCell>
                    <TableCell>
                      {client.createdAt ? format(new Date(client.createdAt), 'dd/MM/yyyy', { locale: es }) : ''}
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
              })
            )}
          </TableBody>
        </Table>
        <Box sx={{ p: 2 }}>
          <TablePagination
            component="div"
            count={pagination.total}
            page={page - 1}
            onPageChange={handlePageChange}
            rowsPerPage={limit}
            onRowsPerPageChange={handleLimitChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Clientes por página"
          />
        </Box>
      </TableContainer>

      {formOpen && (
        <ClientForm
          open={formOpen}
          onClose={handleFormClose}
          client={selectedClient}
          onSuccess={handleFormSuccess}
          onError={(message: string) => {
            console.log('Form error:', message);
            toast.error(message);
          }}
          onShowExistingClient={handleShowExistingClient}
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

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  DialogContentText,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Delete as DeleteIcon,
  Edit as EditIcon 
} from '@mui/icons-material';
import { 
  useGetServicesQuery, 
  useGetClientByPhoneQuery, 
  useCreateSaleMutation, 
  useGetBarbersQuery, 
  useGetSalesQuery,
  useCreateClientMutation,
  useDeleteSaleMutation,
  useUpdateSaleMutation
} from '../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sale, Service, Barber, Client } from '../types';

interface ServicesResponse {
  services: Service[];
  total: number;
}

interface BarbersResponse {
  barbers: Barber[];
  total: number;
}

interface SalesResponse {
  sales: Sale[];
  total: number;
}

const Sales: React.FC = () => {
  const [openNewSale, setOpenNewSale] = useState(false);
  const [openEditSale, setOpenEditSale] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'DEBITO' | 'CREDITO'>('EFECTIVO');
  const [notes, setNotes] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);
  const [foundClient, setFoundClient] = useState<Client | null>(null);

  const { data: servicesResponse, isLoading: isLoadingServices } = useGetServicesQuery({ showInactive: false });
  const { data: barbersResponse, isLoading: isLoadingBarbers } = useGetBarbersQuery({ showInactive: false });
  const { data: client, isFetching: isSearchingClient, error: searchError } = useGetClientByPhoneQuery(phoneNumber, {
    skip: !phoneNumber || phoneNumber.length < 10,
  });
  const [createSale] = useCreateSaleMutation();
  const [updateSale] = useUpdateSaleMutation();
  const { data: salesResponse, isLoading: isLoadingSales } = useGetSalesQuery();
  const [createClient] = useCreateClientMutation();
  const [deleteSale] = useDeleteSaleMutation();

  const services = servicesResponse?.services || [];
  const barbers = barbersResponse?.barbers || [];
  const sales = salesResponse?.sales || [];

  useEffect(() => {
    if (searchError) {
      const errorMessage = (searchError as any)?.data?.message || 'Error al buscar el cliente';
      toast.error(errorMessage);
    }
  }, [searchError]);

  useEffect(() => {
    if (client) {
      setFoundClient(client);
    } else if (phoneNumber.length === 10) {
      setFoundClient(null);
    }
  }, [client, phoneNumber]);

  useEffect(() => {
    if (phoneNumber.length < 10) {
      setFoundClient(null);
    }
  }, [phoneNumber]);

  const handleNewSale = () => {
    setOpenNewSale(true);
  };

  const handleEditClick = (sale: Sale) => {
    setSaleToEdit(sale);
    setPaymentMethod(sale.paymentMethod);
    setNotes(sale.notes || '');
    setOpenEditSale(true);
  };

  const handleEditClose = () => {
    setOpenEditSale(false);
    setSaleToEdit(null);
    setPaymentMethod('EFECTIVO');
    setNotes('');
  };

  const handleEditSubmit = async () => {
    if (!saleToEdit) return;

    try {
      await updateSale({
        id: saleToEdit.id,
        sale: {
          paymentMethod,
          notes: notes || undefined,
        },
      }).unwrap();

      toast.success('Venta actualizada exitosamente');
      handleEditClose();
    } catch (error) {
      console.error('Error al actualizar la venta:', error);
      toast.error('Error al actualizar la venta');
    }
  };

  const handleClose = () => {
    setOpenNewSale(false);
    setPhoneNumber('');
    setSelectedService('');
    setSelectedBarber('');
    setPaymentMethod('EFECTIVO');
    setNotes('');
    setShowNewClientForm(false);
    setFoundClient(null);
    setNewClient({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limpiar el número de teléfono (eliminar espacios, guiones, etc.)
    const value = e.target.value.replace(/\D/g, '');
    
    // Limitar a 10 dígitos
    const cleanPhone = value.slice(0, 10);
    
    setPhoneNumber(cleanPhone);
    if (!showNewClientForm) {
      setNewClient(prev => ({ ...prev, phone: cleanPhone }));
    }
  };

  const handleCreateClient = async () => {
    try {
      if (!newClient.firstName || !newClient.lastName || !newClient.phone) {
        toast.error('Por favor completa los campos requeridos');
        return;
      }

      const createdClient = await createClient(newClient).unwrap();
      toast.success('Cliente registrado exitosamente');
      setShowNewClientForm(false);
      setPhoneNumber(createdClient.phone);
    } catch (error) {
      console.error('Error al crear el cliente:', error);
      toast.error('Error al crear el cliente');
    }
  };

  const handleSaleSubmit = async () => {
    try {
      if (!foundClient) {
        toast.error('Por favor busca un cliente primero');
        return;
      }
      if (!selectedService) {
        toast.error('Por favor selecciona un servicio');
        return;
      }
      if (!selectedBarber) {
        toast.error('Por favor selecciona un barbero');
        return;
      }

      const service = services.find(s => s.id === selectedService);
      if (!service) {
        toast.error('Servicio no encontrado');
        return;
      }

      await createSale({
        clientId: foundClient.id,
        serviceId: selectedService,
        barberId: selectedBarber,
        amount: service.price,
        paymentMethod,
        notes: notes || undefined,
      }).unwrap();

      toast.success('Venta registrada exitosamente');
      handleClose();
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      toast.error('Error al registrar la venta');
    }
  };

  const handleDeleteClick = (saleId: string) => {
    setSaleToDelete(saleId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!saleToDelete) return;

    try {
      await deleteSale(saleToDelete).unwrap();
      toast.success('Venta eliminada exitosamente');
      setDeleteConfirmOpen(false);
      setSaleToDelete(null);
    } catch (error) {
      console.error('Error al eliminar la venta:', error);
      toast.error('Error al eliminar la venta');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSaleToDelete(null);
  };

  if (isLoadingSales) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Ventas</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleNewSale}
        >
          Nueva Venta
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Servicio</TableCell>
              <TableCell>Barbero</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Método de Pago</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Notas</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale: Sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  {format(new Date(sale.createdAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                </TableCell>
                <TableCell>
                  {sale.client.firstName} {sale.client.lastName}
                </TableCell>
                <TableCell>{sale.service.name}</TableCell>
                <TableCell>
                  {sale.barber.firstName} {sale.barber.lastName}
                </TableCell>
                <TableCell>${sale.amount}</TableCell>
                <TableCell>{sale.paymentMethod}</TableCell>
                <TableCell>
                  <Alert 
                    severity={
                      sale.status === 'completed' ? 'success' : 
                      sale.status === 'cancelled' ? 'error' : 
                      'warning'
                    }
                    sx={{ py: 0 }}
                  >
                    {sale.status === 'completed' ? 'Completada' :
                     sale.status === 'cancelled' ? 'Cancelada' :
                     'Reembolsada'}
                  </Alert>
                </TableCell>
                <TableCell>{sale.notes}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Editar venta">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(sale)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar venta">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(sale.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openNewSale} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Nueva Venta</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teléfono del cliente"
                value={phoneNumber}
                onChange={handlePhoneChange}
                error={phoneNumber.length > 0 && phoneNumber.length < 10}
                helperText={phoneNumber.length > 0 && phoneNumber.length < 10 ? "El teléfono debe tener 10 dígitos" : ""}
                InputProps={{
                  endAdornment: isSearchingClient && (
                    <CircularProgress size={20} />
                  ),
                }}
              />
            </Grid>

            {phoneNumber.length === 10 && !isSearchingClient && (
              <Grid item xs={12}>
                {foundClient ? (
                  <Alert severity="success">
                    Cliente: {foundClient.firstName} {foundClient.lastName}
                  </Alert>
                ) : (
                  <Alert severity="warning">
                    Cliente no encontrado
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => setShowNewClientForm(true)}
                      sx={{ ml: 2 }}
                    >
                      Registrar Nuevo Cliente
                    </Button>
                  </Alert>
                )}
              </Grid>
            )}

            {showNewClientForm && (
              <>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={newClient.firstName}
                    onChange={(e) =>
                      setNewClient((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    value={newClient.lastName}
                    onChange={(e) =>
                      setNewClient((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) =>
                      setNewClient((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateClient}
                    fullWidth
                  >
                    Registrar Cliente
                  </Button>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Servicio</InputLabel>
                <Select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  label="Servicio"
                >
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name} - ${service.price}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Barbero</InputLabel>
                <Select
                  value={selectedBarber}
                  onChange={(e) => setSelectedBarber(e.target.value)}
                  label="Barbero"
                >
                  {barbers.map((barber) => (
                    <MenuItem key={barber.id} value={barber.id}>
                      {barber.firstName} {barber.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Método de Pago</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'EFECTIVO' | 'DEBITO' | 'CREDITO')}
                  label="Método de Pago"
                >
                  <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                  <MenuItem value="DEBITO">Débito</MenuItem>
                  <MenuItem value="CREDITO">Crédito</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSaleSubmit} variant="contained" color="primary">
            Registrar Venta
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditSale} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Editar Venta</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Alert severity="info">
                Cliente: {saleToEdit?.client.firstName} {saleToEdit?.client.lastName}
                <br />
                Servicio: {saleToEdit?.service.name}
                <br />
                Barbero: {saleToEdit?.barber.firstName} {saleToEdit?.barber.lastName}
                <br />
                Monto: ${saleToEdit?.amount}
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Método de Pago</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'EFECTIVO' | 'DEBITO' | 'CREDITO')}
                  label="Método de Pago"
                >
                  <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                  <MenuItem value="DEBITO">Débito</MenuItem>
                  <MenuItem value="CREDITO">Crédito</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notas"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancelar</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sales; 
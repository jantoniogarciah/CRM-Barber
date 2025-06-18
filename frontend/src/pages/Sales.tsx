import React, { useState } from 'react';
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
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { 
  useGetServicesQuery, 
  useGetClientByPhoneQuery, 
  useCreateSaleMutation, 
  useGetBarbersQuery, 
  useGetSalesQuery,
  useCreateClientMutation 
} from '../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { debounce } from 'lodash';

const Sales: React.FC = () => {
  const [openNewSale, setOpenNewSale] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [notes, setNotes] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const { data: services = [], isLoading: isLoadingServices } = useGetServicesQuery({ showInactive: false });
  const { data: barbers = [], isLoading: isLoadingBarbers } = useGetBarbersQuery({ showInactive: false });
  const { data: client, isFetching: isSearchingClient } = useGetClientByPhoneQuery(phoneNumber, {
    skip: !phoneNumber || phoneNumber.length < 10,
  });
  const [createSale] = useCreateSaleMutation();
  const { data: sales = [], isLoading: isLoadingSales } = useGetSalesQuery();
  const [createClient] = useCreateClientMutation();

  const handleNewSale = () => {
    setOpenNewSale(true);
  };

  const handleClose = () => {
    setOpenNewSale(false);
    setPhoneNumber('');
    setSelectedService('');
    setSelectedBarber('');
    setNotes('');
    setShowNewClientForm(false);
    setNewClient({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhoneNumber(value);
    if (!showNewClientForm) {
      setNewClient(prev => ({ ...prev, phone: value }));
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
      if (!client) {
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
        clientId: client.id,
        serviceId: selectedService,
        barberId: selectedBarber,
        amount: service.price,
        notes: notes || undefined,
      }).unwrap();

      toast.success('Venta registrada exitosamente');
      handleClose();
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      toast.error('Error al registrar la venta');
    }
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
              <TableCell>Estado</TableCell>
              <TableCell>Notas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
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
                     sale.status === 'refunded' ? 'Reembolsada' : 
                     'Desconocido'}
                  </Alert>
                </TableCell>
                <TableCell>{sale.notes || '-'}</TableCell>
              </TableRow>
            ))}
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay ventas registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openNewSale} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Venta</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Teléfono del Cliente"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    fullWidth
                    helperText={phoneNumber && phoneNumber.length < 10 ? 
                      'Ingresa al menos 10 dígitos' : 
                      phoneNumber.length >= 10 && !client && !isSearchingClient ? 
                      'Cliente no encontrado' : ''}
                    error={phoneNumber.length >= 10 && !client && !isSearchingClient}
                  />
                </Box>
              </Grid>

              {phoneNumber.length >= 10 && !client && !isSearchingClient && !showNewClientForm && (
                <Grid item xs={12}>
                  <Alert severity="info" action={
                    <Button color="inherit" size="small" onClick={() => setShowNewClientForm(true)}>
                      Registrar
                    </Button>
                  }>
                    Cliente no encontrado. ¿Deseas registrarlo?
                  </Alert>
                </Grid>
              )}

              {showNewClientForm && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Registrar Nuevo Cliente
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Nombre"
                      value={newClient.firstName}
                      onChange={(e) => setNewClient(prev => ({ ...prev, firstName: e.target.value }))}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Apellido"
                      value={newClient.lastName}
                      onChange={(e) => setNewClient(prev => ({ ...prev, lastName: e.target.value }))}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleCreateClient}
                    >
                      Guardar Cliente
                    </Button>
                  </Grid>
                </>
              )}

              {client && (
                <Grid item xs={12}>
                  <Alert severity="success">
                    Cliente encontrado: {client.firstName} {client.lastName}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Servicio</InputLabel>
                  <Select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    label="Servicio"
                  >
                    {services?.map((service) => (
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
                    {barbers?.map((barber) => (
                      <MenuItem key={barber.id} value={barber.id}>
                        {barber.firstName} {barber.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Notas"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button 
            onClick={handleSaleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!client || !selectedService || !selectedBarber}
          >
            Registrar Venta
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sales; 
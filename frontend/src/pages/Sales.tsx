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
  TablePagination,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Delete as DeleteIcon,
  Edit as EditIcon 
} from '@mui/icons-material';
import { 
  useGetServicesQuery, 
  useGetBarbersQuery, 
  useGetClientByPhoneQuery, 
  useCreateSaleMutation, 
  useUpdateSaleMutation,
  useGetSalesQuery,
  useCreateClientMutation,
  useDeleteSaleMutation,
} from '../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { Sale, Service, Barber, Client } from '../types';

interface SalesResponse {
  sales: Sale[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const Sales: React.FC = () => {
  const [openNewSale, setOpenNewSale] = useState(false);
  const [openEditSale, setOpenEditSale] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'DEBITO' | 'CREDITO'>('EFECTIVO');
  const [notes, setNotes] = useState('');
  const [saleDate, setSaleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { 
    data: services = [], 
    isLoading: isLoadingServices,
    error: servicesError
  } = useGetServicesQuery({ showInactive: false });

  const { 
    data: barbers = [], 
    isLoading: isLoadingBarbers,
    error: barbersError
  } = useGetBarbersQuery({ showInactive: false });

  const { 
    data: client, 
    isFetching: isSearchingClient, 
    error: searchError 
  } = useGetClientByPhoneQuery(phoneNumber, {
    skip: !phoneNumber || phoneNumber.length < 10,
  });

  const [createSale] = useCreateSaleMutation();
  const [updateSale] = useUpdateSaleMutation();
  const { 
    data: salesData, 
    isLoading: isLoadingSales,
    error: salesError,
    refetch: refetchSales
  } = useGetSalesQuery({
    page: page + 1,
    limit: rowsPerPage,
    startDate,
    endDate
  });
  const [createClient] = useCreateClientMutation();
  const [deleteSale] = useDeleteSaleMutation();

  const sales = salesData?.sales || [];
  const totalSales = salesData?.total || 0;

  useEffect(() => {
    if (servicesError) {
      console.error('Error loading services:', servicesError);
      toast.error('Error al cargar los servicios. Por favor, verifica tu conexión.');
    }
  }, [servicesError]);

  useEffect(() => {
    if (barbersError) {
      console.error('Error loading barbers:', barbersError);
      toast.error('Error al cargar los barberos. Por favor, verifica tu conexión.');
    }
  }, [barbersError]);

  useEffect(() => {
    if (searchError) {
      const errorMessage = (searchError as any)?.data?.message || 'Error al buscar el cliente';
      toast.error(errorMessage);
      setFoundClient(null);
    }
  }, [searchError]);

  useEffect(() => {
    if (phoneNumber.length === 10) {
      if (client) {
        setFoundClient(client);
      } else {
        setFoundClient(null);
      }
    } else {
      setFoundClient(null);
    }
  }, [client, phoneNumber]);

  useEffect(() => {
    console.log('Sales Query State:', {
      data: salesData,
      error: salesError,
      isLoading: isLoadingSales
    });

    if (salesError) {
      const errorMessage = (salesError as any)?.data?.message || 'Error al cargar las ventas';
      console.error('Sales Error:', salesError);
      toast.error(errorMessage);
      
      // Si es un error de autenticación, redirigir al login
      if ((salesError as any)?.status === 401) {
        window.location.href = '/login';
      }
    }
  }, [salesData, salesError, isLoadingSales]);

  useEffect(() => {
    console.log('Sales Data:', salesData);
    console.log('Current sales array:', sales);
    console.log('Total sales:', totalSales);
  }, [salesData, sales, totalSales]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
    
    if (value.length !== 10 || value !== phoneNumber) {
      setFoundClient(null);
    }
    
    if (!showNewClientForm) {
      setNewClient(prev => ({ ...prev, phone: value }));
    }
  };

  const handleNewSale = () => {
    resetForm();
    setOpenNewSale(true);
  };

  const handleClose = () => {
    resetForm();
    setOpenNewSale(false);
  };

  const resetForm = () => {
    setPhoneNumber('');
    setSelectedService('');
    setSelectedBarber('');
    setPaymentMethod('EFECTIVO');
    setNotes('');
    setSaleDate(format(new Date(), 'yyyy-MM-dd'));
    setShowNewClientForm(false);
    setFoundClient(null);
    setNewClient({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
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
      setFoundClient(createdClient);
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

      // Crear la fecha de venta manteniendo la fecha seleccionada exactamente
      const [year, month, day] = saleDate.split('-').map(Number);
      const saleDateTime = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

      await createSale({
        clientId: foundClient.id,
        serviceId: selectedService,
        barberId: selectedBarber,
        amount: service.price,
        paymentMethod,
        saleDate: saleDateTime.toISOString(),
        notes: notes || undefined,
      }).unwrap();

      toast.success('Venta registrada exitosamente');
      handleClose();
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      toast.error('Error al registrar la venta');
    }
  };

  const handleEditClick = (sale: Sale) => {
    setSaleToEdit(sale);
    setPaymentMethod(sale.paymentMethod);
    setNotes(sale.notes || '');
    setSaleDate(format(new Date(sale.saleDate || sale.createdAt), 'yyyy-MM-dd'));
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
      // Crear la fecha de venta manteniendo la fecha seleccionada exactamente
      const [year, month, day] = saleDate.split('-').map(Number);
      const saleDateTime = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

      await updateSale({
        id: saleToEdit.id,
        sale: {
          paymentMethod,
          notes: notes || undefined,
          saleDate: saleDateTime.toISOString(),
        },
      }).unwrap();

      toast.success('Venta actualizada exitosamente');
      handleEditClose();
    } catch (error) {
      console.error('Error al actualizar la venta:', error);
      toast.error('Error al actualizar la venta');
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoadingSales) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (salesError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar las ventas. 
          <Button color="inherit" size="small" onClick={() => refetchSales()}>
            Reintentar
          </Button>
        </Alert>
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

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          type="date"
          label="Fecha inicial"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="Fecha final"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button
          variant="outlined"
          onClick={() => {
            setStartDate('');
            setEndDate('');
          }}
        >
          Limpiar filtros
        </Button>
      </Box>

      {sales.length === 0 ? (
        <Alert severity="info">No hay ventas registradas.</Alert>
      ) : (
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
              {sales
                .sort((a, b) => new Date(b.saleDate || b.createdAt).getTime() - new Date(a.saleDate || a.createdAt).getTime())
                .map((sale: Sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {format(new Date(sale.saleDate || sale.createdAt), "d 'de' MMMM 'de' yyyy", { 
                      locale: es 
                    })}
                  </TableCell>
                  <TableCell>
                    {sale.client?.firstName} {sale.client?.lastName}
                  </TableCell>
                  <TableCell>{sale.service?.name}</TableCell>
                  <TableCell>
                    {sale.barber?.firstName} {sale.barber?.lastName}
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
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalSales}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </TableContainer>
      )}

      <Dialog open={openNewSale} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Venta</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teléfono del cliente"
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={showNewClientForm}
              />
            </Grid>

            {phoneNumber.length === 10 && !isSearchingClient && (
              <Grid item xs={12}>
                {foundClient ? (
                  <Alert severity="success">
                    Cliente encontrado: {foundClient.firstName} {foundClient.lastName}
                  </Alert>
                ) : (
                  <Alert 
                    severity="warning"
                    action={
                      <Button 
                        color="inherit" 
                        size="small"
                        onClick={() => setShowNewClientForm(true)}
                      >
                        Registrar
                      </Button>
                    }
                  >
                    Cliente no encontrado
                  </Alert>
                )}
              </Grid>
            )}

            {showNewClientForm && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={newClient.firstName}
                    onChange={(e) => setNewClient(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Apellido"
                    value={newClient.lastName}
                    onChange={(e) => setNewClient(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleCreateClient}
                  >
                    Registrar Cliente
                  </Button>
                </Grid>
              </>
            )}

            {foundClient && (
              <>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Servicio</InputLabel>
                    <Select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      label="Servicio"
                      disabled={isLoadingServices}
                    >
                      {isLoadingServices ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} /> Cargando servicios...
                        </MenuItem>
                      ) : services.length > 0 ? (
                        services.map((service) => (
                          <MenuItem key={service.id} value={service.id}>
                            {service.name} - ${service.price}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No hay servicios disponibles</MenuItem>
                      )}
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
                      disabled={isLoadingBarbers}
                    >
                      {isLoadingBarbers ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} /> Cargando barberos...
                        </MenuItem>
                      ) : barbers.length > 0 ? (
                        barbers.map((barber) => (
                          <MenuItem key={barber.id} value={barber.id}>
                            {barber.firstName} {barber.lastName}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No hay barberos disponibles</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="date"
                    name="saleDate"
                    label="Fecha de Venta"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
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
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button 
            onClick={handleSaleSubmit}
            variant="contained"
            disabled={!foundClient || !selectedService || !selectedBarber}
          >
            Guardar
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
              <TextField
                fullWidth
                type="date"
                name="saleDate"
                label="Fecha de Venta"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
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
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  Typography,
  styled,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
import ServiceForm from './ServiceForm';
import ServiceDetails from './ServiceDetails';
import { useGetServicesQuery, useToggleServiceStatusMutation } from '../../services/api';
import { toast } from 'react-hot-toast';

// Custom styled switch
const StatusSwitch = styled(Switch)(({ theme }) => ({
  width: 58,
  height: 38,
  padding: 8,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb': {
        backgroundColor: theme.palette.success.main,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.success.light,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.grey[400],
    width: 32,
    height: 32,
    borderRadius: 16,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      borderRadius: '50%',
      transition: theme.transitions.create(['background-color'], {
        duration: 200,
      }),
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.grey[300],
    borderRadius: 20,
    border: `1px solid ${theme.palette.grey[400]}`,
    transition: theme.transitions.create(['background-color', 'border-color'], {
      duration: 200,
    }),
    '&.Mui-checked': {
      opacity: 1,
      backgroundColor: theme.palette.success.light,
      borderColor: theme.palette.success.main,
    },
  },
}));

const ServiceList = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedService, setSelectedService] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [showInactive, setShowInactive] = useState(true);
  
  const [toggleStatus] = useToggleServiceStatusMutation();
  const { data: services = [], isLoading, error } = useGetServicesQuery({ 
    showInactive
  });

  const totalCount = services.length || 0;

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/services/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error al cargar las categorías');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(0);
  };

  const handleAddClick = () => {
    setFormMode('add');
    setSelectedService(null);
    setOpenForm(true);
  };

  const handleEditClick = (service) => {
    setFormMode('edit');
    setSelectedService(service);
    setOpenForm(true);
  };

  const handleViewClick = (service) => {
    setSelectedService(service);
    setOpenDetails(true);
  };

  const handleDeleteClick = async (service) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/services/${service.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCategories();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedService(null);
  };

  const handleDetailsClose = () => {
    setOpenDetails(false);
    setSelectedService(null);
  };

  const handleFormSubmit = async () => {
    fetchCategories();
    handleFormClose();
  };

  const handleStatusToggle = async (service) => {
    try {
      await toggleStatus(service.id);
      toast.success(
        service.isActive 
          ? 'Servicio desactivado correctamente' 
          : 'Servicio activado correctamente'
      );
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast.error('Error al actualizar el estado del servicio');
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) {
      return `${remainingMinutes} min`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Servicios
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              color="primary"
            />
          }
          label="Mostrar servicios inactivos"
        />
      </Box>

      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Buscar servicios..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Categoría</InputLabel>
            <Select value={category} onChange={handleCategoryChange} label="Categoría">
              <MenuItem value="">Todas las categorías</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Agregar Servicio
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Duración</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No se encontraron servicios
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell>{service.category?.name || 'Sin categoría'}</TableCell>
                  <TableCell>{service.duration} min</TableCell>
                  <TableCell>${service.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StatusSwitch
                        checked={Boolean(service.isActive)}
                        onChange={() => handleStatusToggle(service)}
                        color="success"
                        size="small"
                        disabled={isLoading}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: service.isActive ? 'success.main' : 'error.main',
                          fontWeight: 500,
                        }}
                      >
                        {service.isActive ? 'Activo' : 'Inactivo'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewClick(service)}
                      title="Ver detalles"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(service)}
                      title="Editar servicio"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(service)}
                      title="Eliminar servicio"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={services.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          labelRowsPerPage="Filas por página:"
        />
      </TableContainer>

      <Dialog open={openForm} onClose={handleFormClose} maxWidth="md" fullWidth>
        <ServiceForm
          service={selectedService}
          mode={formMode}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
          categories={categories}
        />
      </Dialog>

      <Dialog open={openDetails} onClose={handleDetailsClose} maxWidth="lg" fullWidth>
        <ServiceDetails
          service={selectedService}
          onClose={handleDetailsClose}
          onEdit={() => {
            handleDetailsClose();
            handleEditClick(selectedService);
          }}
        />
      </Dialog>
    </Box>
  );
};

export default ServiceList;

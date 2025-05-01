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

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [formMode, setFormMode] = useState('add');

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/services', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search,
          category,
          page: page + 1,
          limit: rowsPerPage,
        },
      });

      setServices(response.data.services);
      setTotalCount(response.data.total);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'An error occurred while fetching services'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/services/categories/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [page, rowsPerPage, search, category]);

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
        fetchServices();
      } catch (error) {
        setError(
          error.response?.data?.message ||
            'An error occurred while deleting the service'
        );
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
    await fetchServices();
    handleFormClose();
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
          {error}
        </Alert>
      )}

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
            placeholder="Search services..."
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
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={handleCategoryChange}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Service
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No services found
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.category || '-'}</TableCell>
                  <TableCell>{formatDuration(service.duration)}</TableCell>
                  <TableCell>${service.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={service.isActive ? 'Active' : 'Inactive'}
                      color={service.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewClick(service)}
                      title="View Details"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(service)}
                      title="Edit Service"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(service)}
                      title="Delete Service"
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
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      <Dialog open={openForm} onClose={handleFormClose} maxWidth="md" fullWidth>
        <ServiceForm
          service={selectedService}
          mode={formMode}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
        />
      </Dialog>

      <Dialog
        open={openDetails}
        onClose={handleDetailsClose}
        maxWidth="lg"
        fullWidth
      >
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

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
import ClientForm from './ClientForm';
import ClientDetails from './ClientDetails';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [formMode, setFormMode] = useState('add');

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search,
          page: page + 1,
          limit: rowsPerPage,
        },
      });

      setClients(response.data.clients);
      setTotalCount(response.data.total);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while fetching clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page, rowsPerPage, search]);

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

  const handleAddClick = () => {
    setFormMode('add');
    setSelectedClient(null);
    setOpenForm(true);
  };

  const handleEditClick = (client) => {
    setFormMode('edit');
    setSelectedClient(client);
    setOpenForm(true);
  };

  const handleViewClick = (client) => {
    setSelectedClient(client);
    setOpenDetails(true);
  };

  const handleDeleteClick = async (client) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/clients/${client.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchClients();
      } catch (error) {
        setError(error.response?.data?.message || 'An error occurred while deleting the client');
      }
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedClient(null);
  };

  const handleDetailsClose = () => {
    setOpenDetails(false);
    setSelectedClient(null);
  };

  const handleFormSubmit = async () => {
    await fetchClients();
    handleFormClose();
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
        <TextField
          placeholder="Search clients..."
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
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Add Client
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Last Visit</TableCell>
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
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No clients found
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    {client.firstName} {client.lastName}
                  </TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.email || '-'}</TableCell>
                  <TableCell>
                    {client.lastVisit ? format(new Date(client.lastVisit), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={client.isActive ? 'Active' : 'Inactive'}
                      color={client.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewClick(client)}
                      title="View Details"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(client)}
                      title="Edit Client"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(client)}
                      title="Delete Client"
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
        <ClientForm
          client={selectedClient}
          mode={formMode}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
        />
      </Dialog>

      <Dialog open={openDetails} onClose={handleDetailsClose} maxWidth="lg" fullWidth>
        <ClientDetails
          client={selectedClient}
          onClose={handleDetailsClose}
          onEdit={() => {
            handleDetailsClose();
            handleEditClick(selectedClient);
          }}
        />
      </Dialog>
    </Box>
  );
};

export default ClientList;

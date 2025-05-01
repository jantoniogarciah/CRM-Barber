import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { RootState } from '../store';
import ClientForm from '../components/ClientForm';
import { Client } from '../services/clientService';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // TODO: Fetch clients from API
    // This will be implemented when we set up the API integration
  }, []);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const handleDelete = async (clientId: number) => {
    // TODO: Implement delete functionality
  };

  const handleFormClose = () => {
    setSelectedClient(null);
    setIsFormOpen(false);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    // TODO: Refresh clients list
  };

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Clients</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsFormOpen(true)}
        >
          Add Client
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{`${client.firstName} ${client.lastName}`}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(client)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(client.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={isFormOpen}
        onClose={handleFormClose}
        maxWidth="sm"
        fullWidth
      >
        <Box p={3}>
          <Typography variant="h5" mb={3}>
            {selectedClient ? 'Edit Client' : 'Add Client'}
          </Typography>
          <ClientForm
            client={selectedClient || undefined}
            isEditing={!!selectedClient}
            onSuccess={handleFormSuccess}
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default Clients;

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
  Snackbar,
  Alert,
} from '@mui/material';
import { useAppSelector } from '../store/hooks';
import {
  useGetClientsQuery,
  useDeleteClientMutation,
  useUpdateClientMutation,
} from '../services/api';
import ClientForm from '../components/ClientForm';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Client } from '../types';

const Clients: React.FC = () => {
  const { data: clients = [], isLoading } = useGetClientsQuery();
  const [deleteClient] = useDeleteClientMutation();
  const [selectedClient, setSelectedClient] = React.useState<Client | undefined>(undefined);
  const [formOpen, setFormOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const { user } = useAppSelector((state) => state.auth);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormOpen(true);
  };

  const handleDelete = async (clientId: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(clientId.toString());
        setSnackbar({ open: true, message: 'Client deleted successfully', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Error deleting client', severity: 'error' });
      }
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Clients
      </Typography>
      <ClientForm
        client={selectedClient}
        isEditing={!!selectedClient}
        onSuccess={() => {
          setFormOpen(false);
          setSelectedClient(undefined);
          setSnackbar({
            open: true,
            message: selectedClient ? 'Client updated successfully' : 'Client created successfully',
            severity: 'success',
          });
        }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Added Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>
                  {client.createdAt ? format(new Date(client.createdAt), 'yyyy-MM-dd HH:mm') : ''}
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity as 'success' | 'error'}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Clients;

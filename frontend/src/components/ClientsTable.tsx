import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Client } from '../types/client';

interface ClientsTableProps {
  clients: Client[];
  onDelete: (id: string) => void;
}

const ClientsTable: React.FC<ClientsTableProps> = ({ clients, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Apellido</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{client.firstName}</TableCell>
              <TableCell>{client.lastName}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phone}</TableCell>
              <TableCell>
                <Chip
                  label={client.isActive ? 'Activo' : 'Inactivo'}
                  color={client.isActive ? 'success' : 'error'}
                />
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => onDelete(client.id)}
                  title="Eliminar cliente"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClientsTable; 
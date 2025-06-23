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
import { Service } from '../types/service';

interface ServicesTableProps {
  services: Service[];
  onDelete: (id: string) => void;
}

const ServicesTable: React.FC<ServicesTableProps> = ({ services, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Duración (min)</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell>{service.name}</TableCell>
              <TableCell>{service.description}</TableCell>
              <TableCell>
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                }).format(service.price)}
              </TableCell>
              <TableCell>{service.duration}</TableCell>
              <TableCell>
                <Chip
                  label={service.isActive ? 'Activo' : 'Inactivo'}
                  color={service.isActive ? 'success' : 'error'}
                />
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => onDelete(service.id)}
                  title="Eliminar servicio"
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

export default ServicesTable; 
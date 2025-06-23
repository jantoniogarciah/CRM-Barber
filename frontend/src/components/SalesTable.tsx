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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sale } from '../types/sale';

interface SalesTableProps {
  sales: Sale[];
  onDelete: (id: string) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({ sales, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Cliente</TableCell>
            <TableCell>Barbero</TableCell>
            <TableCell>Servicio</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Método de Pago</TableCell>
            <TableCell>Total</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>
                {sale.client?.firstName} {sale.client?.lastName}
              </TableCell>
              <TableCell>
                {sale.barber?.firstName} {sale.barber?.lastName}
              </TableCell>
              <TableCell>{sale.service?.name}</TableCell>
              <TableCell>
                {format(new Date(sale.createdAt), 'dd/MM/yyyy', { locale: es })}
              </TableCell>
              <TableCell>
                <Chip
                  label={sale.paymentMethod}
                  color={
                    sale.paymentMethod === 'EFECTIVO'
                      ? 'success'
                      : sale.paymentMethod === 'DEBITO'
                      ? 'info'
                      : 'warning'
                  }
                />
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                }).format(sale.amount)}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => onDelete(sale.id)}
                  title="Eliminar venta"
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

export default SalesTable; 
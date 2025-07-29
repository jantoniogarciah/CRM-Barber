import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Appointment } from '../../types';

interface AppointmentListProps {
  appointments: Appointment[];
  onEditClick: (appointment: Appointment) => void;
  onDeleteClick: (appointment: Appointment) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onEditClick,
  onDeleteClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
  };

  return (
    <TableContainer component={Paper} sx={{ overflow: 'auto', maxWidth: '100%' }}>
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell>Barbero</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Servicio</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Hora</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Notas</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>
                {`${appointment.barber?.firstName} ${appointment.barber?.lastName}`}
              </TableCell>
              <TableCell>
                {`${appointment.client?.firstName} ${appointment.client?.lastName}`}
              </TableCell>
              <TableCell>{appointment.service?.name}</TableCell>
              <TableCell>{formatDate(appointment.date)}</TableCell>
              <TableCell>{appointment.time}</TableCell>
              <TableCell>
                <Chip
                  label={getStatusText(appointment.status)}
                  color={getStatusColor(appointment.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>{appointment.notes}</TableCell>
              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() => onEditClick(appointment)}
                  title="Editar Cita"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDeleteClick(appointment)}
                  title="Eliminar Cita"
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

export default AppointmentList;

import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Dialog,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import ServiceForm from './ServiceForm';
import { useGetServicesLogQuery } from '../services/api';
import { formatPrice } from '../utils/format';

interface ServicesLogProps {
  barberId: string;
}

interface ServiceLog {
  id: string;
  barberId: string;
  serviceId: string;
  clientId: string;
  notes?: string;
  createdAt: string;
  service: {
    id: string;
    name: string;
    price: number;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const ServicesLog: React.FC<ServicesLogProps> = ({ barberId }) => {
  const [openServiceForm, setOpenServiceForm] = useState(false);
  const { data: servicesLog = [], isLoading } = useGetServicesLogQuery(barberId);

  const handleOpenServiceForm = () => {
    setOpenServiceForm(true);
  };

  const handleCloseServiceForm = () => {
    setOpenServiceForm(false);
  };

  const handleServiceSuccess = () => {
    setOpenServiceForm(false);
  };

  if (isLoading) {
    return <Typography>Cargando servicios...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Registro de Servicios</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenServiceForm}
        >
          Nuevo Servicio
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Servicio</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell>Notas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servicesLog.map((service: ServiceLog) => (
              <TableRow key={service.id}>
                <TableCell>{new Date(service.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {service.client.firstName} {service.client.lastName}
                  <IconButton
                    size="small"
                    onClick={() => {/* TODO: Implementar vista de cliente */}}
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </TableCell>
                <TableCell>{service.service.name}</TableCell>
                <TableCell align="right">{formatPrice(service.service.price)}</TableCell>
                <TableCell>{service.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openServiceForm}
        onClose={handleCloseServiceForm}
        maxWidth="md"
        fullWidth
      >
        <ServiceForm
          barberId={barberId}
          onClose={handleCloseServiceForm}
          onSuccess={handleServiceSuccess}
        />
      </Dialog>
    </Box>
  );
};

export default ServicesLog; 
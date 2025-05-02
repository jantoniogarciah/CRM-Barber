import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import { useAppSelector } from '../store/hooks';
import { useGetServicesQuery } from '../services/api';
import ServiceForm from '../components/ServiceForm';
import { Service } from '../types';

const Services: React.FC = () => {
  const { data: services = [], isLoading } = useGetServicesQuery();
  const { user } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>();

  const handleOpen = (service?: Service) => {
    setSelectedService(service);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedService(undefined);
    setOpen(false);
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Services</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add Service
        </Button>
      </Box>
      <ServiceForm open={open} onClose={handleClose} service={selectedService} />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.description}</TableCell>
                <TableCell>{service.duration} minutes</TableCell>
                <TableCell>${service.price}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen(service)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Services;

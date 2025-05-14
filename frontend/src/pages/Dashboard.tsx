import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { useAppSelector } from '../store/hooks';
import { useGetAppointmentsQuery, useGetClientsQuery, useGetServicesQuery } from '../services/api';

const Dashboard: React.FC = () => {
  const { data: appointments = [] } = useGetAppointmentsQuery();
  const { data: clients = [] } = useGetClientsQuery();
  const { data: services = [] } = useGetServicesQuery({});

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Box display="flex" gap={2}>
        <Card>
          <CardContent>
            <Typography variant="h6">Total Appointments</Typography>
            <Typography variant="h4">{appointments.length}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">Total Clients</Typography>
            <Typography variant="h4">{clients.length}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">Total Services</Typography>
            <Typography variant="h4">{services.length}</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;

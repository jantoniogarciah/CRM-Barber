import React from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Grid } from '@mui/material';
import { useGetAppointmentsQuery, useGetClientsQuery, useGetServicesQuery } from '../services/api';
import { PageContainer } from '../components/PageContainer';

const Dashboard: React.FC = () => {
  const {
    data: appointmentsData = { appointments: [], total: 0 },
    isLoading: isLoadingAppointments,
    error: appointmentsError,
  } = useGetAppointmentsQuery();

  const {
    data: clientsData = { clients: [], pagination: { total: 0 } },
    isLoading: isLoadingClients,
    error: clientsError,
  } = useGetClientsQuery({ showInactive: false });

  const {
    data: services = [],
    isLoading: isLoadingServices,
    error: servicesError,
  } = useGetServicesQuery({ showInactive: false });

  const isLoading = isLoadingAppointments || isLoadingClients || isLoadingServices;
  const error = appointmentsError || clientsError || servicesError;

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error al cargar los datos del dashboard. Por favor, intenta nuevamente.
        </Alert>
      </Box>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Dashboard</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Citas
              </Typography>
              <Typography variant="h4">{appointmentsData.total}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Clientes
              </Typography>
              <Typography variant="h4">{clientsData.pagination.total}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Servicios
              </Typography>
              <Typography variant="h4">{services.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Dashboard;

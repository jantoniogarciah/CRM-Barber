import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Link,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useGetDashboardDataQuery } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const { 
    data: salesByDay,
    isLoading: isLoadingSalesByDay,
    error: salesByDayError
  } = useGetDashboardDataQuery('/sales-by-day');

  const {
    data: salesByBarber,
    isLoading: isLoadingSalesByBarber,
    error: salesByBarberError
  } = useGetDashboardDataQuery('/sales-by-barber');

  const {
    data: inactiveClients,
    isLoading: isLoadingInactiveClients,
    error: inactiveClientsError
  } = useGetDashboardDataQuery('/inactive-clients');

  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  // Transformar datos para la gráfica de barras
  const barChartData = salesByDay ? Object.entries(salesByDay).map(([date, amounts]: [string, any]) => ({
    date: format(new Date(date), "d 'de' MMMM", { locale: es }),
    EFECTIVO: amounts.EFECTIVO,
    DEBITO: amounts.DEBITO,
    CREDITO: amounts.CREDITO,
    total: amounts.EFECTIVO + amounts.DEBITO + amounts.CREDITO
  })) : [];

  // Transformar datos para la gráfica de pie
  const pieChartData = salesByBarber || [];

  // Obtener el mes actual para el título
  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: es });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>

      <Grid container spacing={3}>
        {/* Gráfica de Ventas por Día */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ventas Diarias - {currentMonth}
            </Typography>
            {isLoadingSalesByDay ? (
              <CircularProgress />
            ) : salesByDayError ? (
              <Alert severity="error">Error al cargar los datos de ventas</Alert>
            ) : (
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="EFECTIVO" stackId="a" fill="#0088FE" name="Efectivo" />
                    <Bar dataKey="DEBITO" stackId="a" fill="#00C49F" name="Débito" />
                    <Bar dataKey="CREDITO" stackId="a" fill="#FFBB28" name="Crédito" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Gráfica de Distribución por Barbero */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Distribución por Barbero</Typography>
            {isLoadingSalesByBarber ? (
              <CircularProgress />
            ) : salesByBarberError ? (
              <Alert severity="error">Error al cargar los datos de barberos</Alert>
            ) : (
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="total"
                      nameKey="barber"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      fill="#8884d8"
                      label={(entry) => `${entry.barber}: $${entry.total}`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Tabla de Clientes Inactivos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Clientes sin visitas recientes (más de 12 días)</Typography>
            {isLoadingInactiveClients ? (
              <CircularProgress />
            ) : inactiveClientsError ? (
              <Alert severity="error">Error al cargar los datos de clientes inactivos</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Teléfono</TableCell>
                      <TableCell>Última Visita</TableCell>
                      <TableCell>Días sin visita</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inactiveClients?.map((client: any) => (
                      <TableRow key={client.id}>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell>
                          {client.lastVisit
                            ? format(new Date(client.lastVisit), "d 'de' MMMM 'de' yyyy", { locale: es })
                            : 'Sin visitas'}
                        </TableCell>
                        <TableCell>{client.daysSinceLastVisit || 'N/A'}</TableCell>
                        <TableCell>
                          <Tooltip title="Enviar mensaje por WhatsApp">
                            <Link
                              href={`https://wa.me/${formatPhoneForWhatsApp(client.phone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <IconButton size="small" color="success">
                                <WhatsAppIcon />
                              </IconButton>
                            </Link>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

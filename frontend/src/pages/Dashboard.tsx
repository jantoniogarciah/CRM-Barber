import React, { useState } from 'react';
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
  TablePagination,
  TextField,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useGetDashboardDataQuery } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface SaleData {
  originalDate: string;
  date: string;
  EFECTIVO: number;
  DEBITO: number;
  CREDITO: number;
  total: number;
}

interface BarberSaleData {
  name: string;
  value: number;
}

interface ServiceData {
  originalDate: string;
  date: string;
  [key: string]: string | number;
}

const Dashboard = () => {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const { 
    data: salesByDay,
    isLoading: isLoadingSalesByDay,
    error: salesByDayError
  } = useGetDashboardDataQuery(`/sales-by-day?date=${selectedMonth}-01`);

  const {
    data: salesByBarber,
    isLoading: isLoadingSalesByBarber,
    error: salesByBarberError
  } = useGetDashboardDataQuery(`/sales-by-barber?date=${selectedMonth}-01`);

  const {
    data: servicesByDate,
    isLoading: isLoadingServicesByDate,
    error: servicesByDateError
  } = useGetDashboardDataQuery(`/services-by-date?date=${selectedMonth}-01`);

  const {
    data: inactiveClientsData,
    isLoading: isLoadingInactiveClients,
    error: inactiveClientsError
  } = useGetDashboardDataQuery(`/inactive-clients?page=${page}`);

  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  // Transformar datos para la gráfica de barras
  const barChartData = salesByDay ? Object.entries(salesByDay)
    .map(([date, amounts]: [string, any]): SaleData => {
      const [year, month, day] = date.split('-').map(Number);
      return {
        originalDate: date,
        date: format(new Date(year, month - 1, day), "d 'de' MMMM", { locale: es }),
        EFECTIVO: amounts.EFECTIVO || 0,
        DEBITO: amounts.DEBITO || 0,
        CREDITO: amounts.CREDITO || 0,
        total: (amounts.EFECTIVO || 0) + (amounts.DEBITO || 0) + (amounts.CREDITO || 0)
      };
    })
    .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime()) : [];

  // Transformar datos para la gráfica de pie
  const pieChartData = salesByBarber ? salesByBarber.map((barber: BarberSaleData) => ({
    name: barber.name,
    value: barber.value || 0
  })) : [];

  // Transformar datos para la gráfica de servicios
  const serviceChartData = servicesByDate ? Object.entries(servicesByDate)
    .map(([date, services]: [string, any]): ServiceData => {
      const [year, month, day] = date.split('-').map(Number);
      return {
        originalDate: date,
        date: format(new Date(year, month - 1, day), "d 'de' MMMM", { locale: es }),
        ...services
      };
    })
    .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime()) : [];

  // Obtener todos los tipos de servicios únicos
  const serviceTypes = serviceChartData.length > 0
    ? Object.keys(serviceChartData[0]).filter(key => !['originalDate', 'date'].includes(key))
    : [];

  // Obtener el mes actual para el título
  const currentMonth = format(new Date(selectedMonth), "MMMM 'de' yyyy", { locale: es });

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <TextField
          type="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          sx={{ minWidth: 200 }}
          inputProps={{
            max: format(new Date(), 'yyyy-MM')
          }}
        />
      </Box>

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
            ) : barChartData.length === 0 ? (
              <Alert severity="info">No hay datos de ventas para mostrar</Alert>
            ) : (
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
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

        {/* Gráfica de Servicios por Fecha */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Servicios por Fecha - {currentMonth}
            </Typography>
            {isLoadingServicesByDate ? (
              <CircularProgress />
            ) : servicesByDateError ? (
              <Alert severity="error">Error al cargar los datos de servicios</Alert>
            ) : (
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <BarChart data={serviceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    {serviceTypes.map((service, index) => (
                      <Bar 
                        key={service}
                        dataKey={service}
                        stackId="a"
                        fill={COLORS[index % COLORS.length]}
                        name={service}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Gráfica de Distribución por Barbero */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Distribución por Barbero - {currentMonth}</Typography>
            {isLoadingSalesByBarber ? (
              <CircularProgress />
            ) : salesByBarberError ? (
              <Alert severity="error">Error al cargar los datos de barberos</Alert>
            ) : pieChartData.length === 0 ? (
              <Alert severity="info">No hay datos de barberos para mostrar</Alert>
            ) : (
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      fill="#8884d8"
                      label={({ name, value }) => `${name}: $${(value || 0).toLocaleString()}`}
                    >
                      {pieChartData.map((entry: BarberSaleData, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Tabla de Clientes Inactivos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Clientes sin visitas recientes (más de 15 días)</Typography>
            {isLoadingInactiveClients ? (
              <CircularProgress />
            ) : inactiveClientsError ? (
              <Alert severity="error">Error al cargar los datos de clientes inactivos</Alert>
            ) : (
              <>
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
                      {inactiveClientsData?.clients?.map((client: any) => (
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
                <Box sx={{ p: 2 }}>
                  <TablePagination
                    component="div"
                    count={inactiveClientsData?.pagination?.totalClients || 0}
                    page={page - 1}
                    onPageChange={handlePageChange}
                    rowsPerPage={pageSize}
                    rowsPerPageOptions={[5]}
                    labelRowsPerPage="Clientes por página"
                  />
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
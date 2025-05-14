import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    growthRate: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [],
  });
  const [appointmentData, setAppointmentData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, appointmentsRes, revenueRes, appointmentsChartRes] = await Promise.all([
        axios.get('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/appointments?date=today', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/dashboard/revenue', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/dashboard/appointments-chart', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats(statsRes.data);
      setTodayAppointments(appointmentsRes.data.appointments);

      // Set revenue chart data
      setRevenueData({
        labels: revenueRes.data.labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenueRes.data.values,
            borderColor: '#2ECC71',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            tension: 0.4,
          },
        ],
      });

      // Set appointments chart data
      setAppointmentData({
        labels: appointmentsChartRes.data.labels,
        datasets: [
          {
            label: 'Appointments',
            data: appointmentsChartRes.data.values,
            backgroundColor: '#3498DB',
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no-show':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Clients
                  </Typography>
                  <Typography variant="h4">{stats.totalClients}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Today's Appointments
                  </Typography>
                  <Typography variant="h4">{stats.todayAppointments}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <EventIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Monthly Revenue
                  </Typography>
                  <Typography variant="h4">${stats.monthlyRevenue}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <MoneyIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Growth Rate
                  </Typography>
                  <Typography variant="h4">{stats.growthRate}%</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Revenue Overview
            </Typography>
            <Line
              data={revenueData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Appointments by Day
            </Typography>
            <Bar
              data={appointmentData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Today's Appointments */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Today's Appointments</Typography>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>
        <List>
          {todayAppointments.map((appointment) => (
            <ListItem
              key={appointment.id}
              divider
              secondaryAction={
                <Chip
                  label={appointment.status}
                  color={getStatusColor(appointment.status)}
                  size="small"
                />
              }
            >
              <ListItemAvatar>
                <Avatar>{appointment.client.firstName[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${appointment.client.firstName} ${appointment.client.lastName}`}
                secondary={`${appointment.time} - ${appointment.service.name}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Dashboard;

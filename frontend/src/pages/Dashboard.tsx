import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { RootState } from '../store';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const summaryCards = [
    {
      title: 'Total Clients',
      value: '150',
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
    {
      title: "Today's Appointments",
      value: '12',
      icon: <EventIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
    },
    {
      title: 'Monthly Revenue',
      value: '$5,240',
      icon: <MoneyIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    },
    {
      title: 'Growth Rate',
      value: '+15%',
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main' }} />,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h5">{card.value}</Typography>
                  </Box>
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Appointments
            </Typography>
            {/* Add appointment list component here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Overview
            </Typography>
            {/* Add revenue chart component here */}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Client Statistics
            </Typography>
            {/* Add client statistics component here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

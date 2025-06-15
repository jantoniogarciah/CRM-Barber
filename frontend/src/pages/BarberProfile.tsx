import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Container,
  Paper,
  Avatar,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CalendarMonth, ContentCut } from '@mui/icons-material';
import AppointmentList from '../components/appointments/AppointmentList';
import ServicesLog from '../components/ServicesLog';
import { useGetBarberQuery } from '../services/api';
import { useParams } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const BarberProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [tabValue, setTabValue] = useState(0);
  const { data: barber } = useGetBarberQuery(id || '');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!id) {
    return <Typography>Error: No se proporcionó ID del barbero</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 100, height: 100 }}>
              {barber?.firstName?.charAt(0)}
            </Avatar>
          </Grid>
          <Grid item>
            <Typography variant="h4">
              {barber?.firstName} {barber?.lastName}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {barber?.email}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab
            icon={<CalendarMonth />}
            iconPosition="start"
            label="Citas"
          />
          <Tab
            icon={<ContentCut />}
            iconPosition="start"
            label="Servicios"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <AppointmentList barberId={id} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <ServicesLog barberId={id} />
      </TabPanel>
    </Container>
  );
};

export default BarberProfile; 
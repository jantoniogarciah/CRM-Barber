import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { RootState } from '../store';
import { Service } from '../services/serviceService';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // TODO: Fetch services from API
    // This will be implemented when we set up the API integration
  }, []);

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Services</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            /* TODO: Implement new service */
          }}
        >
          Add Service
        </Button>
      </Box>

      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {service.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {service.description}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                  ${service.price}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Duration: {service.duration} minutes
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  onClick={() => {
                    /* TODO: Implement edit */
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    /* TODO: Implement delete */
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Services;

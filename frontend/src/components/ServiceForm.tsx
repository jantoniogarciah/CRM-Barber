import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useCreateServiceMutation, useUpdateServiceMutation } from '../services/api';
import { Service } from '../types';

interface ServiceFormProps {
  open: boolean;
  onClose: () => void;
  service?: Service;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
  price: Yup.number().required('Price is required').min(0, 'Price must be positive'),
  duration: Yup.number().required('Duration is required').min(1, 'Duration must be at least 1 minute'),
});

const ServiceForm: React.FC<ServiceFormProps> = ({ open, onClose, service }) => {
  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();

  const formik = useFormik({
    initialValues: {
      name: service?.name || '',
      description: service?.description || '',
      price: service?.price || 0,
      duration: service?.duration || 30,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (service?.id) {
          await updateService({ id: service.id.toString(), service: values });
        } else {
          await createService(values);
        }
        onClose();
      } catch (error) {
        console.error('Error saving service:', error);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{service ? 'Edit Service' : 'New Service'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
            <TextField
              fullWidth
              id="price"
              name="price"
              label="Price"
              type="number"
              value={formik.values.price}
              onChange={formik.handleChange}
              error={formik.touched.price && Boolean(formik.errors.price)}
              helperText={formik.touched.price && formik.errors.price}
            />
            <TextField
              fullWidth
              id="duration"
              name="duration"
              label="Duration (minutes)"
              type="number"
              value={formik.values.duration}
              onChange={formik.handleChange}
              error={formik.touched.duration && Boolean(formik.errors.duration)}
              helperText={formik.touched.duration && formik.errors.duration}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {service ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ServiceForm; 
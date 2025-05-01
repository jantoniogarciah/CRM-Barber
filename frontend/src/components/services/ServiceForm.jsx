import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import axios from 'axios';

const ServiceForm = ({ service, mode, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    category: '',
  });

  useEffect(() => {
    fetchCategories();
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        duration: service.duration || '',
        price: service.price || '',
        category: service.category || '',
      });
    }
  }, [service]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/services/categories/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Service name is required');
      return false;
    }
    if (!formData.duration || formData.duration < 1) {
      setError('Duration must be at least 1 minute');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      setError('Price must be greater than 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const url =
        mode === 'edit' ? `/api/services/${service.id}` : '/api/services';
      const method = mode === 'edit' ? 'put' : 'post';

      await axios[method](
        url,
        {
          ...formData,
          duration: parseInt(formData.duration, 10),
          price: parseFloat(formData.price),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onSubmit();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'An error occurred while saving the service'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogTitle>
        {mode === 'edit' ? 'Edit Service' : 'Add New Service'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Service Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">minutes</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                  disabled={loading}
                >
                  <MenuItem value="">None</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </>
  );
};

export default ServiceForm;

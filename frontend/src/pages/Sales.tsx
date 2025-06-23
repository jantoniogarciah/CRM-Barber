import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useGetSalesQuery,
  useDeleteSaleMutation,
} from '../services/api';
import { Sale } from '../types';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { toast } from 'react-hot-toast';
import { PageContainer } from '../components/PageContainer';
import SalesTable from '../components/SalesTable';

const Sales: React.FC = () => {
  const [openForm, setOpenForm] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: salesData = { sales: [] },
    isLoading,
    error,
    refetch
  } = useGetSalesQuery({ page: 1, limit: 10 });

  const [deleteSale, { isLoading: isDeleting }] = useDeleteSaleMutation();

  const handleOpenForm = (sale?: Sale) => {
    setSelectedSale(sale || null);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedSale(null);
  };

  const handleDelete = async () => {
    if (!selectedSaleId) return;

    try {
      await deleteSale(selectedSaleId).unwrap();
      toast.success('Venta eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedSaleId(null);
      refetch();
    } catch (error) {
      toast.error('Error al eliminar la venta');
    }
  };

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
          Error al cargar las ventas. Por favor, intenta nuevamente.
        </Alert>
      </Box>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4">Ventas</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
              >
                Nueva Venta
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <SalesTable
        sales={salesData.sales}
        onDelete={(id: string) => {
          setSelectedSaleId(id);
          setIsDeleteDialogOpen(true);
        }}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar venta?"
        content="¿Estás seguro que deseas eliminar esta venta? Esta acción no se puede deshacer."
        isLoading={isDeleting}
      />
    </PageContainer>
  );
};

export default Sales; 
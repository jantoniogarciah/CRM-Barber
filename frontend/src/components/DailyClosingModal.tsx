import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Sale } from '../types';
import DailyClosingReport from './DailyClosingReport';

interface DailyClosingModalProps {
  open: boolean;
  onClose: () => void;
  sales: Sale[];
  date: Date;
}

const DailyClosingModal: React.FC<DailyClosingModalProps> = ({
  open,
  onClose,
  sales,
  date,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        Reporte de Cierre Diario
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ height: 'calc(100% - 20px)' }}>
          <DailyClosingReport sales={sales} date={date} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DailyClosingModal; 
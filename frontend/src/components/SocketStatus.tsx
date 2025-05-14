import React from 'react';
import { Box, CircularProgress, Tooltip, Typography } from '@mui/material';
import { useSocket } from '../contexts/SocketContext';

export const SocketStatus: React.FC = () => {
  const { isConnected, error } = useSocket();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: 1,
        borderRadius: 1,
        backgroundColor: 'background.paper',
        boxShadow: 1,
      }}
    >
      {isConnected ? (
        <Tooltip title="Socket Connected">
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: 'success.main',
            }}
          />
        </Tooltip>
      ) : error ? (
        <Tooltip title={`Connection Error: ${error}`}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: 'error.main',
            }}
          />
        </Tooltip>
      ) : (
        <Tooltip title="Connecting...">
          <CircularProgress size={12} />
        </Tooltip>
      )}
      <Typography variant="caption" color="text.secondary">
        {isConnected ? 'Connected' : error ? 'Error' : 'Connecting...'}
      </Typography>
    </Box>
  );
};

import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { toggleColorMode } = useAppTheme();
  const theme = useTheme();

  return (
    <Tooltip title="Toggle theme">
      <IconButton onClick={toggleColorMode} color="inherit">
        {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;

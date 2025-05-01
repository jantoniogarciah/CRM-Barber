import { useTheme } from '@mui/material/styles';
import { SxProps, Theme } from '@mui/material';

interface ThemeStyles {
  paper: SxProps<Theme>;
  card: SxProps<Theme>;
  button: SxProps<Theme>;
  input: SxProps<Theme>;
  table: SxProps<Theme>;
}

export const useThemeStyles = (): ThemeStyles => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return {
    paper: {
      p: 3,
      borderRadius: 2,
      boxShadow: isDark
        ? '0 4px 6px rgba(0, 0, 0, 0.3)'
        : '0 4px 6px rgba(0, 0, 0, 0.1)',
      backgroundColor: theme.palette.background.paper,
    },
    card: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
      },
    },
    button: {
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      px: 3,
      py: 1,
    },
    input: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        '&:hover fieldset': {
          borderColor: theme.palette.primary.main,
        },
      },
    },
    table: {
      '& .MuiTableCell-root': {
        borderBottom: `1px solid ${
          isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
        }`,
      },
      '& .MuiTableRow-root:hover': {
        backgroundColor: isDark
          ? 'rgba(255, 255, 255, 0.04)'
          : 'rgba(0, 0, 0, 0.04)',
      },
    },
  };
};

export default useThemeStyles;

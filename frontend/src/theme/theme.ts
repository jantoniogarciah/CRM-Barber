import { createTheme, Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
  }
  interface PaletteOptions {
    neutral?: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
  }
}

const getDesignTokens = (mode: 'light' | 'dark') => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#fff',
          },
          secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
            contrastText: '#fff',
          },
          neutral: {
            main: '#64748B',
            light: '#94A3B8',
            dark: '#475569',
            contrastText: '#fff',
          },
        }
      : {
          primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
            contrastText: 'rgba(0, 0, 0, 0.87)',
          },
          secondary: {
            main: '#ce93d8',
            light: '#f3e5f5',
            dark: '#ab47bc',
            contrastText: 'rgba(0, 0, 0, 0.87)',
          },
          neutral: {
            main: '#94A3B8',
            light: '#CBD5E1',
            dark: '#64748B',
            contrastText: 'rgba(0, 0, 0, 0.87)',
          },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          variants: [],
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function createAppTheme(mode: 'light' | 'dark' = 'light'): Theme {
  return createTheme(getDesignTokens(mode));
}

export default createAppTheme;

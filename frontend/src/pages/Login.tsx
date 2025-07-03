import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link,
  useTheme,
} from '@mui/material';
import { useLoginMutation } from '../services/api';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import logo from '../assets/clippercut-logo.png';
import { toast } from 'react-hot-toast';

interface LoginFormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object({
  email: Yup.string().email('Correo electrónico inválido').required('El correo es requerido'),
  password: Yup.string().required('La contraseña es requerida'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = React.useState<string | null>(null);
  const theme = useTheme();

  React.useEffect(() => {
    // Limpiar cualquier token anterior al montar el componente
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        const result = await login(values).unwrap();

        if (!result.token || !result.user) {
          throw new Error('Respuesta de login inválida');
        }

        // Almacenar token y usuario
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        // Actualizar estado de Redux
        dispatch(setCredentials(result));

        // Mostrar mensaje de éxito
        toast.success('¡Bienvenido!');

        // Navegar según el rol del usuario
        const userRole = result.user.role?.toUpperCase();
        if (userRole === 'BARBER') {
          navigate('/appointments', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (err: any) {
        console.error('Login error:', err);
        
        // Limpiar datos de autenticación en caso de error
        localStorage.clear();
        sessionStorage.clear();
        
        // Manejar diferentes tipos de errores
        if (err.status === 'FETCH_ERROR') {
          setError('Error de conexión. Por favor, verifica tu conexión a internet.');
        } else if (err.data?.message) {
          setError(err.data.message);
        } else {
          setError('Error al iniciar sesión. Por favor, intenta nuevamente.');
        }
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <img src={logo} alt="Clipper Cut Logo" style={{ height: 60, marginBottom: 16 }} />
          <Typography component="h1" variant="h5" color="textPrimary">
            Clipper Cut Barber Sports
          </Typography>
          <Typography component="h2" variant="h6" sx={{ mt: 2 }} color="textSecondary">
            Iniciar Sesión
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Correo electrónico"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              margin="normal"
              autoComplete="email"
              autoFocus
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Contraseña"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              margin="normal"
              autoComplete="current-password"
              disabled={isLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;

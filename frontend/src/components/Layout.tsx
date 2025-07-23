import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Event,
  People,
  ContentCut,
  AccountCircle,
  ShoppingCart,
  SupervisorAccount,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectUser, clearCredentials } from '../store/slices/authSlice';
import { useLogoutMutation } from '../services/api';
import logo from '../assets/clippercut-logo.png';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [logout] = useLogoutMutation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear all auth data
      localStorage.clear();
      sessionStorage.clear();
      dispatch(clearCredentials());

      // Navigate to login
      navigate('/login', { replace: true });
    }
  };

  const menuItems = useMemo(() => {
    const items = [];
    const userRole = user?.role?.toUpperCase();

    // Dashboard solo para ADMIN y ADMINBARBER
    if (userRole === 'ADMIN' || userRole === 'ADMINBARBER') {
      items.push({
        text: 'Dashboard',
        icon: <Dashboard sx={{ fontSize: 24, width: 24, height: 24 }} />,
        path: '/',
      });
    }

    // Citas y Ventas para todos los usuarios autenticados
    items.push(
      {
        text: 'Citas',
        icon: <Event sx={{ fontSize: 24, width: 24, height: 24 }} />,
        path: '/appointments',
      },
      {
        text: 'Ventas',
        icon: <ShoppingCart sx={{ fontSize: 24, width: 24, height: 24 }} />,
        path: '/sales',
      }
    );

    // Clientes para ADMIN y ADMINBARBER solamente
    if (userRole === 'ADMIN' || userRole === 'ADMINBARBER') {
      items.push({
        text: 'Clientes',
        icon: <People sx={{ fontSize: 24, width: 24, height: 24 }} />,
        path: '/clients',
      });
    }

    // Servicios y Barberos para ADMIN y ADMINBARBER
    if (userRole === 'ADMIN' || userRole === 'ADMINBARBER') {
      items.push(
        {
          text: 'Servicios',
          icon: <ContentCut sx={{ fontSize: 24, width: 24, height: 24 }} />,
          path: '/services',
        },
        {
          text: 'Barberos',
          icon: <People sx={{ fontSize: 24, width: 24, height: 24 }} />,
          path: '/barbers',
        }
      );
    }

    // Usuarios solo para ADMIN
    if (userRole === 'ADMIN') {
      items.push({
        text: 'Usuarios',
        icon: <SupervisorAccount sx={{ fontSize: 24, width: 24, height: 24 }} />,
        path: '/users',
      });
    }

    return items;
  }, [user?.role]);

  const drawer = useMemo(
    () => (
      <Box sx={{ mt: { xs: '56px', sm: 0 } }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false); // Cerrar el menú al seleccionar una opción
                }}
                selected={location.pathname === item.path}
                sx={{
                  '& .MuiListItemIcon-root': {
                    minWidth: 56,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '& > svg': {
                      margin: '12px',
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    ),
    [menuItems, location.pathname, navigate]
  );

  if (isAuthPage) {
    return <Box>{children}</Box>;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <CssBaseline />
      {user && (
        <>
          <AppBar
            position="fixed"
            color="primary"
            sx={{
              width: '100%',
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
          >
            <Toolbar sx={{ minHeight: { xs: '56px', sm: '64px' } }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Box
                component="img"
                src={logo}
                alt="Clipper Cut Logo"
                sx={{
                  height: { xs: 32, sm: 40 },
                  mr: 2,
                  display: 'block',
                }}
              />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  flexGrow: 1,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                  '& .MuiPaper-root': {
                    mt: 1,
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate('/profile');
                  }}
                >
                  Mi Perfil
                </MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>

          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                backgroundColor: (theme) => theme.palette.background.default,
              },
            }}
          >
            {drawer}
          </Drawer>

          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                height: '100%',
                top: 0,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          ml: { sm: `${drawerWidth}px` },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
          pt: { xs: '56px', sm: '64px' },
          pb: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 2 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

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

  const isAuthPage = location.pathname === '/' || location.pathname === '/signup';

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
      // Primero cerrar el menú
      handleClose();
      
      // Intentar hacer logout en el backend
      await logout().unwrap();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear all auth data
      localStorage.clear();
      sessionStorage.clear();
      dispatch(clearCredentials());

      // Asegurarse de que la URL base sea correcta
      const baseUrl = window.location.origin;
      // Navegar a la página de login usando la URL completa
      window.location.href = `${baseUrl}`;
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
      <Box sx={{ mt: { xs: '112px', sm: 0 } }}> {/* Doubled the mobile top margin */}
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                selected={location.pathname === item.path}
                sx={{
                  py: { xs: 1.5, sm: 1 }, // Increased padding for better touch targets
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
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      maxWidth: '100vw',
      overflow: 'hidden'
    }}>
      <CssBaseline />
      {user && (
        <>
          <AppBar
            position="fixed"
            color="primary"
            sx={{
              width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
              ml: { sm: `${drawerWidth}px` },
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
          >
            <Toolbar sx={{ 
              minHeight: { xs: '64px', sm: '64px' },
              px: { xs: 1, sm: 2 }
            }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  mr: 1,
                  display: { sm: 'none' },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Box
                component="img"
                src={logo}
                alt="Clipper Cut Logo"
                sx={{
                  height: { xs: 40, sm: 40 },
                  mr: 1,
                  display: 'block',
                }}
              />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  flexGrow: 1,
                  fontSize: { xs: '0.9rem', sm: '1.25rem' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
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
                sx={{ ml: 1 }}
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
                    minWidth: 150,
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

          <Box
            component="nav"
            sx={{
              width: { sm: drawerWidth },
              flexShrink: { sm: 0 },
            }}
          >
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
                  boxSizing: 'border-box',
                  width: drawerWidth,
                  mt: 0,
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
                  boxSizing: 'border-box',
                  width: drawerWidth,
                  borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                },
              }}
              open
            >
              {drawer}
            </Drawer>
          </Box>
        </>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          pt: { xs: '64px', sm: '64px' },
          pb: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Box sx={{ 
          width: '100%', 
          maxWidth: '100%',
          overflowX: 'hidden',
          overflowY: 'auto'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

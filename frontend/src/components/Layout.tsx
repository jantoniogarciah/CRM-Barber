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

      // Force a full page reload to clear all state
      window.location.replace('/login');
    }
  };

  const menuItems = useMemo(() => {
    const items = [];
    const userRole = user?.role?.toUpperCase();

    // Dashboard solo para ADMIN y BARBER
    if (userRole === 'ADMIN' || userRole === 'BARBER') {
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

    // Clientes, Servicios y Barberos solo para administradores
    if (userRole === 'ADMIN') {
      items.push(
        {
          text: 'Clientes',
          icon: <People sx={{ fontSize: 24, width: 24, height: 24 }} />,
          path: '/clients',
        },
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

    return items;
  }, [user?.role]);

  const drawer = useMemo(
    () => (
      <div>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Clipper Cut CRM
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
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
      </div>
    ),
    [menuItems, location.pathname, navigate]
  );

  if (isAuthPage) {
    return <Box>{children}</Box>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {user && (
        <>
          <AppBar
            position="fixed"
            color="primary"
            sx={{
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              ml: { sm: `${drawerWidth}px` },
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <img src={logo} alt="Clipper Cut Logo" style={{ height: 40, marginRight: 16 }} />
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
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
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate('/profile');
                  }}
                >
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>
          <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          overflow: 'auto',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 0 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default Layout;

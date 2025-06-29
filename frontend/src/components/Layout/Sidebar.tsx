import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  ContentCut as ContentCutIcon,
  Person as PersonIcon,
  SupervisorAccount as SupervisorAccountIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    roles: ['ADMIN', 'ADMINBARBER'],
  },
  {
    title: 'Citas',
    path: '/appointments',
    icon: <EventIcon />,
    roles: ['ADMIN', 'ADMINBARBER', 'BARBER'],
  },
  {
    title: 'Ventas',
    path: '/sales',
    icon: <ShoppingCartIcon />,
    roles: ['ADMIN', 'ADMINBARBER', 'BARBER'],
  },
  {
    title: 'Clientes',
    path: '/clients',
    icon: <PeopleIcon />,
    roles: ['ADMIN', 'ADMINBARBER', 'BARBER'],
  },
  {
    title: 'Servicios',
    path: '/services',
    icon: <ContentCutIcon />,
    roles: ['ADMIN', 'ADMINBARBER'],
  },
  {
    title: 'Barberos',
    path: '/barbers',
    icon: <PersonIcon />,
    roles: ['ADMIN', 'ADMINBARBER'],
  },
  {
    title: 'Usuarios',
    path: '/users',
    icon: <SupervisorAccountIcon />,
    roles: ['ADMIN'],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useSelector((state: RootState) => {
    console.log('Auth state:', state.auth);
    return state.auth;
  });

  console.log('Sidebar - Current user:', user);
  console.log('Sidebar - User role:', user?.role);
  console.log('Sidebar - Local Storage user:', localStorage.getItem('user'));

  const drawerContent = (
    <Box sx={{ width: 240 }}>
      <List>
        {menuItems
          .filter((item) => {
            const userRole = user?.role?.toUpperCase() || '';
            const hasPermission = item.roles.includes(userRole);
            console.log(`Menu item "${item.title}" - User role: "${userRole}" - Required roles:`, item.roles, '- Has permission:', hasPermission);
            return hasPermission;
          })
          .map((item) => (
            <ListItem
              key={item.path}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={isMobile ? onClose : undefined}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItem>
          ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar; 
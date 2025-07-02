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
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/',
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
  const user = useAppSelector(selectUser);

  console.log('Sidebar - Current user:', user);
  console.log('Sidebar - User role:', user?.role);
  console.log('Sidebar - Local Storage user:', localStorage.getItem('user'));

  const filteredMenuItems = menuItems.filter((item) => {
    const userRole = user?.role?.toUpperCase() || '';
    const hasPermission = item.roles.includes(userRole);
    console.log(`Sidebar - Menu item "${item.title}":`, {
      userRole,
      requiredRoles: item.roles,
      hasPermission,
    });
    return hasPermission;
  });

  console.log('Sidebar - Filtered menu items:', filteredMenuItems);

  const drawerContent = (
    <Box sx={{ width: 240 }}>
      <List>
        {filteredMenuItems.map((item) => (
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
//Prueba

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
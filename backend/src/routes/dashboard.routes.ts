import { Router } from 'express';
import { getSalesByDay, getSalesByBarber, getInactiveClients, getServicesByDate } from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth';

const router: Router = Router();

// Middleware para verificar roles de administrador
const adminAndBarberAdminOnly = (req: any, res: any, next: any) => {
  const userRole = req.user?.role;
  if (userRole !== 'ADMIN' && userRole !== 'ADMINBARBER') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  next();
};

// Proteger todas las rutas
router.use(protect);
router.use(adminAndBarberAdminOnly);

// Rutas del dashboard
router.get('/sales-by-day', getSalesByDay);
router.get('/sales-by-barber', getSalesByBarber);
router.get('/inactive-clients', getInactiveClients);
router.get('/services-by-date', getServicesByDate);

export default router; 
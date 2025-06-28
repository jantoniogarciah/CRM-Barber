import { Router } from 'express';
import { getSalesByDay, getSalesByBarber, getInactiveClients, getServicesByDate } from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth';

const router: Router = Router();

// Proteger todas las rutas
router.use(protect);

// Rutas del dashboard
router.get('/sales-by-day', getSalesByDay);
router.get('/sales-by-barber', getSalesByBarber);
router.get('/inactive-clients', getInactiveClients);
router.get('/services-by-date', getServicesByDate);

export default router; 
import { Router } from 'express';
import { getServicesLog, createServiceLog } from '../controllers/servicesLog.controller';
import { protect } from '../middleware/auth';

const router: Router = Router();

// Proteger todas las rutas
router.use(protect);

// Obtener registro de servicios de un barbero
router.get('/:barberId', getServicesLog);

// Crear nuevo registro de servicio
router.post('/', createServiceLog);

export default router; 
import { Router } from 'express';
import { getServicesLog, createServiceLog } from '../controllers/servicesLog.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Proteger todas las rutas con autenticación
router.use(authenticateToken);

// Obtener registro de servicios de un barbero
router.get('/:barberId', getServicesLog);

// Crear nuevo registro de servicio
router.post('/', createServiceLog);

export default router; 
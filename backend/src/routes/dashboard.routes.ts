import express from 'express';
import { getSalesByDay, getSalesByBarber, getInactiveClients } from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

// Rutas del dashboard
router.get('/sales-by-day', getSalesByDay);
router.get('/sales-by-barber', getSalesByBarber);
router.get('/inactive-clients', getInactiveClients);

export default router; 
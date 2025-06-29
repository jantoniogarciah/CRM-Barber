import { Router } from 'express';
import { authRouter } from './auth.routes';
import usersRoutes from './users.routes';

const router: Router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRoutes);

export default router; 
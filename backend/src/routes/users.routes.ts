import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/users.controller';
import { adminOnly } from '../middlewares/adminOnly.middleware';

const router: Router = Router();

// Todas las rutas protegidas por el middleware adminOnly
router.use(adminOnly);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router; 
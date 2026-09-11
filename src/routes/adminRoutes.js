import { Router } from 'express';

import {
  getAllUsers,
  approveAdmin,
  toggleUserStatus,
} from '../controllers/adminController.js';

import { protect } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/adminMiddleware.js';

const router = Router();

// Aplica autenticação e verificação de admin para todas as rotas deste arquivo
router.use(protect, isAdmin);

router.get('/users', getAllUsers);
router.patch('/users/:userId/approve-admin', approveAdmin);
router.patch('/users/:userId/toggle-status', toggleUserStatus);

export default router;
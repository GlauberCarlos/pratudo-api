import { Router } from 'express';
import { register, login, updateProfile, deleteAccount } from '../controllers/authController.js';
import { protect } from "../middlewares/authMiddleware.js"

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);

export default router;
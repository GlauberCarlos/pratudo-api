import { Router } from 'express';
import { register, login, updateProfile, deleteAccount, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from "../middlewares/authMiddleware.js"

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);

export default router;
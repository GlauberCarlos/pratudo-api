import { Router } from 'express';
import { getMealPlan, saveMealPlan, sendWeeklyMenuEmail } from '../controllers/mealPlanController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/send-email', sendWeeklyMenuEmail);
router.get('/', getMealPlan);
router.put('/', saveMealPlan);

export default router;
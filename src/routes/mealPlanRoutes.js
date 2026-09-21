import { Router } from 'express';
import { getMealPlan, saveMealPlan } from '../controllers/mealPlanController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', getMealPlan);
router.put('/', saveMealPlan);

export default router;
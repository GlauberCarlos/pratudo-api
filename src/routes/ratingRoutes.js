import { Router } from 'express';
import { submitRating, getAllRatings } from '../controllers/ratingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', getAllRatings);
router.post('/', protect, submitRating);

export default router;
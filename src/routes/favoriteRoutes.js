import { Router } from 'express';

const router = Router();

import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/favoriteController.js';

import { protect } from '../middlewares/authMiddleware.js';

router.get('/favorites', protect, getFavorites);
router.post('/favorites/:recipeId', protect, addFavorite);
router.delete('/favorites/:recipeId', protect, removeFavorite);

export default router;


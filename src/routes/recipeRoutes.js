//recipeRoutes
import { Router } from 'express';
import {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getMyRecipes,
} from '../controllers/recipeController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Rotas Públicas
router.get('/', getAllRecipes);
// Rotas Protegidas (Exigem Login)
router.get('/user/me', protect, getMyRecipes); 
router.get('/:id', getRecipeById);
router.post('/', protect, createRecipe);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

export default router;
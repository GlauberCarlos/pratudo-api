import { Router } from 'express';
import {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  deleteRecipe,
} from '../controllers/recipeController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Rotas Públicas
router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);

// Rotas Protegidas (Exigem Login)
router.post('/', protect, createRecipe);
router.delete('/:id', protect, deleteRecipe);

export default router;
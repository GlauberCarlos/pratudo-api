//recipeRoutes
import { Router } from 'express';
import {getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, getMyRecipes} from '../controllers/recipeController.js';
import { upload, uploadToCloudinary } from '../middlewares/uploadMiddleware.js'

import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Rotas Públicas
router.get('/', getAllRecipes);

// Rotas Protegidas
router.get('/my-recipes', protect, getMyRecipes); 

// Rotas com Parâmetro 
router.get('/:id', getRecipeById);
router.post('/', protect, upload.single('img'), uploadToCloudinary, createRecipe);
router.put('/:id', protect, upload.single('img'), uploadToCloudinary, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

export default router;
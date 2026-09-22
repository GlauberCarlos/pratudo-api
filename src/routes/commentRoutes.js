import { Router } from 'express';
import {getCommentsByRecipe, createComment, updateComment, deleteComment, getMyComments} from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/my-comments', protect, getMyComments);
router.get('/recipe/:recipeId', getCommentsByRecipe);
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

export default router;
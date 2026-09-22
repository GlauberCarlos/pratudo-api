// recipe model
import mongoose from 'mongoose';
import Comment from './Comment.js';
import Rating from './Rating.js';
import User from './User.js';

const recipeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'O título é obrigatório'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        category: {
            type: String,
            required: [true, 'A categoria é obrigatória'],
            trim: true,
        },
        prepTime: {
            type: String,
            required: [true, 'O tempo de preparo é obrigatório'],
        },
        servings: {
            type: String,
            required: [true, 'O rendimento é obrigatório'],
        },
        img: {
            type: String,
            default: '',
        },
        ingredients: {
            type: [String],
            required: [true, 'Adicione pelo menos um ingrediente'],
        },
        instructions: {
            type: [String],
            required: [true, 'Adicione pelo menos um passo no modo de preparo'],
        },
        restrictions: {
            type: [String],
        },
        isPublic: {
            type: Boolean,
        },
        isVegetarian: {
            type: Boolean,
        },
        isVegan: {
            type: Boolean,
        },
        isLactoseFree: {
            type: Boolean,
        },
        isGlutenFree: {
            type: Boolean,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

recipeSchema.pre('findOneAndDelete', async function (next) {
  try {
    const recipeToDelete = await this.model.findOne(this.getQuery());

    if (recipeToDelete) {
      const recipeId = recipeToDelete._id;

      await Comment.deleteMany({ recipe: recipeId });
      await Rating.deleteMany({ recipe: recipeId });
      await User.updateMany(
        { favorites: recipeId },
        { $pull: { favorites: recipeId } }
      );
    }

  } catch (error) {
    console.error('Erro no hook pre-delete da Recipe:', error);
    next(error);
  }
});

export default mongoose.model('Recipe', recipeSchema);
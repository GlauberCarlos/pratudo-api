import mongoose from 'mongoose';
import Recipe from './Recipe.js';
import Comment from './Comment.js';
import Rating from './Rating.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'O nome é obrigatório'],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
      default: true
    },
    email: {
      type: String,
      required: [true, 'O e-mail é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'A senha é obrigatória'],
      select: false, // Evita que a senha seja retornada em buscas por padrão
    },
    birthDate: {
      type: Date,
      required: [true, 'Data de nascimento obrigatória'],
      default: null
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'admin_pending'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
  },
  {
    timestamps: true, // Cria automaticamente os campos createdAt e updatedAt
  }
);

userSchema.pre('findOneAndDelete', async function (next) {
  try {
    const userToQuery = await this.model.findOne(this.getQuery());

    if (userToQuery) {
      const userId = userToQuery._id;

      const userRecipes = await Recipe.find({ author: userId }).select('_id');
      const userRecipeIds = userRecipes.map((r) => r._id);


      if (userRecipeIds.length > 0) {
        await Comment.deleteMany({ recipe: { $in: userRecipeIds } });
        await Rating.deleteMany({ recipe: { $in: userRecipeIds } });
      }

      await Comment.deleteMany({ user: userId });
      await Rating.deleteMany({ user: userId });

      await Recipe.deleteMany({ author: userId });
    }

  } catch (error) {
    console.error('Erro no hook pre-delete do User:', error);
    next(error);
  }
});

export default mongoose.model('User', userSchema);
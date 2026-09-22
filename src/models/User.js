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
    // 1. Obtém o utilizador que está prestes a ser apagado
    const userToQuery = await this.model.findOne(this.getQuery());

    if (userToQuery) {
      const userId = userToQuery._id;

      // 2. Procura todas as receitas que pertencem a este utilizador
      const userRecipes = await Recipe.find({ author: userId }).select('_id');
      const userRecipeIds = userRecipes.map((r) => r._id);

      // 3. Limpeza total em cascata:
      
      // A. Apaga TODOS os comentários e avaliações nas RECEITAS do utilizador (mesmo de outros membros)
      if (userRecipeIds.length > 0) {
        await Comment.deleteMany({ recipe: { $in: userRecipeIds } });
        await Rating.deleteMany({ recipe: { $in: userRecipeIds } });
      }

      // B. Apaga todos os COMENTÁRIOS e AVALIAÇÕES que este utilizador fez em outras receitas
      await Comment.deleteMany({ user: userId });
      await Rating.deleteMany({ user: userId });

      // C. Apaga todas as RECEITAS criadas por este utilizador
      await Recipe.deleteMany({ author: userId });

      // D. Opcional: Remove este utilizador dos arrays de favoritos dos outros utilizadores
      await this.model.updateMany(
        { favorites: userId },
        { $pull: { favorites: userId } }
      );
    }

  } catch (error) {
    console.error('Erro no hook pre-delete do User:', error);
    next(error);
  }
});

export default mongoose.model('User', userSchema);
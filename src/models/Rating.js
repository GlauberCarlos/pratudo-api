import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

ratingSchema.index({ recipe: 1, user: 1 }, { unique: true }); // Impede que o mesmo utilizador avalie a mesma receita

export default mongoose.model('Rating', ratingSchema);
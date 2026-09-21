import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
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
    text: {
      type: String,
      required: [true, 'O texto do comentário é obrigatório'],
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Comment', commentSchema);
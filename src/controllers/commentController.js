import Comment from '../models/Comment.js';

export const getCommentsByRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const comments = await Comment.find({ recipe: recipeId })
      .populate('user', 'name lastName email')
      .sort({ createdAt: -1 });

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar comentários.', error: error.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { recipeId, text } = req.body;
    const userId = req.user.id || req.user._id;

    if (!recipeId || !text || !text.trim()) {
      return res.status(400).json({ message: 'Receita e texto são obrigatórios.' });
    }

    const newComment = await Comment.create({
      recipe: recipeId,
      user: userId,
      text: text.trim(),
    });

    const populatedComment = await Comment.findById(newComment._id).populate(
      'user',
      'name lastName email'
    );

    return res.status(201).json(populatedComment);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao criar comentário.', error: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id || req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'O texto do comentário não pode estar vazio.' });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado.' });
    }

    if (comment.user.toString() !== String(userId)) {
      return res.status(403).json({ message: 'Ação não permitida. Apenas o autor pode editar.' });
    }

    comment.text = text.trim();
    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'name lastName email'
    );

    return res.status(200).json(populatedComment);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao editar comentário.', error: error.message });
  }
};
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado.' });
    }

    if (comment.user.toString() !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Ação não permitida.' });
    }

    await comment.deleteOne();
    return res.status(200).json({ message: 'Comentário removido com sucesso.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao remover comentário.', error: error.message });
  }
};
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).populate({
      path: 'favorites',
      populate: { path: 'author', select: 'name email' },
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    return res.status(200).json(user.favorites || []);
  } catch (error) {
    console.error('Erro ao obter favoritos:', error);
    return res.status(500).json({ message: 'Erro interno ao procurar favoritos.' });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { recipeId } = req.params;

    const recipeExists = await Recipe.findById(recipeId);
    if (!recipeExists) {
      return res.status(404).json({ message: 'Receita não encontrada.' });
    }

    // Adiciona a receita ao array 'favorites' se ainda não existir ($addToSet previne duplicados)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: recipeId } },
      { new: true }
    );

    return res.status(200).json({
      message: 'Receita adicionada aos favoritos com sucesso.',
      favorites: updatedUser.favorites,
    });
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    return res.status(500).json({ message: 'Erro interno ao adicionar favorito.' });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { recipeId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: recipeId } },
      { new: true }
    );

    return res.status(200).json({
      message: 'Receita removida dos favoritos com sucesso.',
      favorites: updatedUser.favorites,
    });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    return res.status(500).json({ message: 'Erro interno ao remover favorito.' });
  }
};


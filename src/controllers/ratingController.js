import Rating from '../models/Rating.js';

export const submitRating = async (req, res) => {
  try {
    const { recipeId, stars } = req.body;
    const userId = req.user.id || req.user._id;

    if (!recipeId || !stars) {
      return res.status(400).json({ message: 'Receita e número de estrelas são obrigatórios.' });
    }

    const rating = await Rating.findOneAndUpdate(
      { recipe: recipeId, user: userId },
      { stars: Number(stars) },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({ message: 'Avaliação registrada com sucesso.', rating });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao registrar avaliação.', error: error.message });
  }
};

export const getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find();
    return res.status(200).json(ratings);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar avaliações.', error: error.message });
  }
};
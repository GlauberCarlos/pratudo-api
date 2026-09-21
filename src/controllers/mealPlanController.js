import MealPlan from '../models/MealPlan.js';

export const getMealPlan = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let mealPlan = await MealPlan.findOne({ user: userId });

    if (!mealPlan) {
      mealPlan = await MealPlan.create({ user: userId, plan: {} });
    }

    return res.status(200).json(mealPlan.plan || {});
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao procurar planeamento semanal.', error: error.message });
  }
};

export const saveMealPlan = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { plan } = req.body;

    const updatedMealPlan = await MealPlan.findOneAndUpdate(
      { user: userId },
      { plan },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'Planeamento semanal guardado com sucesso.',
      plan: updatedMealPlan.plan,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao guardar planeamento semanal.', error: error.message });
  }
};
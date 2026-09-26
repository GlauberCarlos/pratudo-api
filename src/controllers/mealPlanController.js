import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
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

export const sendWeeklyMenuEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body;

    if (!plan || Object.keys(plan).length === 0) {
      return res.status(400).json({ message: 'O seu planeamento semanal está vazio.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    const recipeIds = Object.values(plan).filter(Boolean);
    const recipes = await Recipe.find({ _id: { $in: recipeIds } });

    const dayLabels = {
      monday: 'Segunda-feira',
      tuesday: 'Terça-feira',
      wednesday: 'Quarta-feira',
      thursday: 'Quinta-feira',
      friday: 'Sexta-feira',
      saturday: 'Sábado',
      sunday: 'Domingo',
    };

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    let menuListHtml = '';

    Object.keys(dayLabels).forEach((dayKey) => {
      const recipeId = plan[dayKey];
      const recipe = recipes.find((r) => String(r._id) === String(recipeId));

      if (recipe) {
        menuListHtml += `
          <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 12px; border-radius: 8px; border-left: 5px solid #4CAF50;">
            <h3 style="margin: 0 0 5px 0; color: #333;">${dayLabels[dayKey]}: <span style="color: #2e7d32;">${recipe.title}</span></h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">⏱️ <strong>Tempo de preparo:</strong> ${recipe.prepTime || recipe.prepareTime || 'N/A'}</p>
            ${recipe.description ? `<p style="margin: 0 0 10px 0; color: #555; font-size: 13px;">${recipe.description}</p>` : ''}
            <a href="${frontendUrl}/recipe/${recipe._id}" target="_blank" style="display: inline-block; padding: 6px 12px; background-color: #4CAF50; color: var(--branco); text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: bold;">Ver Receita Completa</a>
          </div>
        `;
      } else {
        menuListHtml += `
          <div style="background-color: #f1f1f1; padding: 10px 15px; margin-bottom: 12px; border-radius: 8px; color: #888; font-style: italic;">
            ${dayLabels[dayKey]}: Nenhuma receita selecionada.
          </div>
        `;
      }
    });

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2e7d32; text-align: center;">📅 Seu Cardápio Semanal Pratudo</h2>
        <p style="font-size: 15px; color: #444;">Olá, <strong>${user.name}</strong>!</p>
        <p style="font-size: 14px; color: #555;">Aqui está o resumo do seu planeamento de refeições para esta semana:</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        
        ${menuListHtml}

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        
        <p style="text-align: center; font-size: 12px; color: #999;">
          Enviado com carinho por Pratudo • Seu assistente de receitas.
        </p>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Pratudo Cardápio" <${process.env.EMAIL_FROM || 'cardapio@pratudo.com'}>`,
      to: user.email,
      subject: '📅 Seu Cardápio Semanal - Pratudo',
      html: emailTemplate,
    });

    return res.status(200).json({ message: 'Cardápio enviado para o seu e-mail com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao enviar cardápio por e-mail.', error: error.message });
  }
};
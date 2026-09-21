//recipeController
import Recipe from '../models/Recipe.js';

export const getAllRecipes = async (req, res) => {
  try {
    const { search, category, isVegan, isVegetarian, isGlutenFree, isLactoseFree } = req.query;

    let query = { isPublic: true };

    if (search) {
      const searchRegex = new RegExp(search, 'i'); // 'i' para ignorar maiúsculas/minúsculas
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { ingredients: searchRegex },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (isVegan === 'true') query.isVegan = true;
    if (isVegetarian === 'true') query.isVegetarian = true;
    if (isGlutenFree === 'true') query.isGlutenFree = true;
    if (isLactoseFree === 'true') query.isLactoseFree = true;

    const recipes = await Recipe.find(query).populate('author', 'name lastName email');

    return res.status(200).json(recipes);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar receitas', error: error.message });
  }
};

export const getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('author', 'name lastName email');
        if (!recipe) {
            return res.status(404).json({ message: 'Receita não encontrada.' });
        }
        return res.status(200).json(recipe);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar receita', error: error.message });
    }
};

export const createRecipe = async (req, res) => {
    try {
        const
            {
                title,
                description,
                category,
                prepTime,
                servings,
                img,
                ingredients,
                instructions,
                restrictions,
                isPublic,
                isVegetarian,
                isVegan,
                isLactoseFree,
                isGlutenFree,
            } = req.body;

        const newRecipe = await Recipe.create({
            title,
            description,
            category,
            prepTime,
            servings,
            img,
            ingredients,
            instructions,
            restrictions,
            isPublic,
            isVegetarian,
            isVegan,
            isLactoseFree,
            isGlutenFree,
            author: req.user.id, // Veio do token no authMiddleware
        });

        return res.status(201).json({
            message: 'Receita criada',
            recipe: newRecipe,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar receita', error: error.message });
    }
};

export const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Receita não encontrada.' });
        }

        if (recipe.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Ação não permitida.' });
        }

        await recipe.deleteOne();
        return res.status(200).json({ message: 'Receita removida' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao deletar receita', error: error.message });
    }
};

export const getMyRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({ author: req.user.id }).populate('author', 'name lastName email');
        return res.status(200).json(recipes);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar suas receitas', error: error.message });
    }
};

export const updateRecipe = async (req, res) => {
    try {
        const id = req.params.id;
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({ message: 'Receita não encontrada.' });
        }

        if (recipe.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Ação não permitida.' });
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true } // validators serve para obedecer as regras do schema
        );

        return res.status(200).json({
            message: 'Receita atualizada com sucesso!',
            recipe: updatedRecipe,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar receita', error: error.message });
    }
};
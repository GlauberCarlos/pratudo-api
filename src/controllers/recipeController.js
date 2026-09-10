import Recipe from '../models/Recipe.js';

// 1. Listar todas as receitas (público)
export const getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find().populate('author', 'name lastName email');
        return res.status(200).json(recipes);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar receitas', error: error.message });
    }
};

// 2. Buscar receita por ID (público)
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

// 3. Criar nova receita (protegido - usuário logado)
export const createRecipe = async (req, res) => {
    try {
        const { title, description, category, prepTime, servings, img, ingredients, instructions, restrictions, isPublic, isVegetarian, isVegan, isLactoseFree, isGlutenFree, } = req.body;

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
            message: 'Receita criada com sucesso!',
            recipe: newRecipe,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao criar receita', error: error.message });
    }
};

// 4. Deletar receita (protegido)
export const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Receita não encontrada.' });
        }

        // Permite deletar se for o autor ou se for admin
        if (recipe.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Ação não permitida. Você não é o autor desta receita.' });
        }

        await recipe.deleteOne();
        return res.status(200).json({ message: 'Receita removida com sucesso!' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao deletar receita', error: error.message });
    }
};
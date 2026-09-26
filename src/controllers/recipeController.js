//recipeController
import Recipe from '../models/Recipe.js';

export const getAllRecipes = async (req, res) => {
    try {
        const { search, category, isVegan, isVegetarian, isGlutenFree, isLactoseFree } = req.query;

        let query = { isPublic: true };

        if (search) {
            const searchRegex = new RegExp(search, 'i');
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
        const {
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

        // Helper para converter strings JSON enviadas pelo FormData em Arrays
        const parseArray = (data) => {
            if (!data) return [];
            if (typeof data === 'string') {
                try {
                    return JSON.parse(data);
                } catch {
                    return data.split(',').map((item) => item.trim()).filter(Boolean);
                }
            }
            return Array.isArray(data) ? data : [];
        };

        // Helper para converter booleans do FormData ("true"/"false" -> true/false)
        const parseBoolean = (value) => {
            if (typeof value === 'boolean') return value;
            return value === 'true';
        };

        const newRecipe = await Recipe.create({
            title,
            description,
            category,
            prepTime,
            servings,
            img: img || '',
            ingredients: parseArray(ingredients),
            instructions: parseArray(instructions),
            restrictions: parseArray(restrictions),
            isPublic: parseBoolean(isPublic),
            isVegetarian: parseBoolean(isVegetarian),
            isVegan: parseBoolean(isVegan),
            isLactoseFree: parseBoolean(isLactoseFree),
            isGlutenFree: parseBoolean(isGlutenFree),
            author: req.user.id || req.user._id,
        });

        return res.status(201).json({
            message: 'Receita criada com sucesso!',
            recipe: newRecipe,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao criar receita',
            error: error.message
        });
    }
};

export const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Receita não encontrada.' });
        }

        const isOwner = String(recipe.author || recipe.userId) === String(req.user.id || req.user._id);
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Não tem permissão para eliminar esta receita.' });
        }

        await Recipe.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Receita removida' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao deletar receita', error: error.message });
    }
};

// 5. Buscar receitas do próprio utilizador (com suporte a filtros)
export const getMyRecipes = async (req, res) => {
    try {
        const { search, category, isVegan, isVegetarian, isGlutenFree, isLactoseFree } = req.query;
        const userId = req.user.id || req.user._id;

        let query = { author: userId };

        if (search) {
            const searchRegex = new RegExp(search, 'i');
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

        const userId = req.user.id || req.user._id;

        if (recipe.author.toString() !== String(userId) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Ação não permitida.' });
        }

        // Copia o corpo da requisição para podermos manipular
        const updateData = { ...req.body };

        // Função utilitária para converter strings JSON enviadas via FormData em Arrays reais
        const parseArrayIfNeeded = (field) => {
            if (typeof field === 'string') {
                try {
                    const parsed = JSON.parse(field);
                    return Array.isArray(parsed) ? parsed : [field];
                } catch (e) {
                    return field.split(',').map((item) => item.trim()).filter(Boolean);
                }
            }
            return field;
        };

        // Função utilitária para converter strings de FormData para Booleans
        const parseBooleanIfNeeded = (field) => {
            if (typeof field === 'string') {
                return field === 'true';
            }
            return Boolean(field);
        };

        // Tratamento dos campos de Array
        if (updateData.ingredients !== undefined) {
            updateData.ingredients = parseArrayIfNeeded(updateData.ingredients);
        }
        if (updateData.instructions !== undefined) {
            updateData.instructions = parseArrayIfNeeded(updateData.instructions);
        }
        if (updateData.restrictions !== undefined) {
            updateData.restrictions = parseArrayIfNeeded(updateData.restrictions);
        }

        // Tratamento dos campos Booleans (caso venham como string "true"/"false" do FormData)
        if (updateData.isPublic !== undefined) updateData.isPublic = parseBooleanIfNeeded(updateData.isPublic);
        if (updateData.isVegetarian !== undefined) updateData.isVegetarian = parseBooleanIfNeeded(updateData.isVegetarian);
        if (updateData.isVegan !== undefined) updateData.isVegan = parseBooleanIfNeeded(updateData.isVegan);
        if (updateData.isLactoseFree !== undefined) updateData.isLactoseFree = parseBooleanIfNeeded(updateData.isLactoseFree);
        if (updateData.isGlutenFree !== undefined) updateData.isGlutenFree = parseBooleanIfNeeded(updateData.isGlutenFree);

        // Se houver um ficheiro carregado pelo Multer Cloudinary, atualiza a imagem
        if (req.file && req.file.path) {
            updateData.img = req.file.path;
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            message: 'Receita atualizada com sucesso!',
            recipe: updatedRecipe,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar receita', error: error.message });
    }
};
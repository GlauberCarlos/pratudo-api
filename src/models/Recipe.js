// recipe model
import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'O título é obrigatório'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        category: {
            type: String,
            required: [true, 'A categoria é obrigatória'],
            trim: true,
        },
        prepTime: {
            type: String,
            required: [true, 'O tempo de preparo é obrigatório'],
        },
        servings: {
            type: String,
            required: [true, 'O rendimento é obrigatório'],
        },
        img: {
            type: String,
            default: '',
        },
        ingredients: {
            type: [String],
            required: [true, 'Adicione pelo menos um ingrediente'],
        },
        instructions: {
            type: [String],
            required: [true, 'Adicione pelo menos um passo no modo de preparo'],
        },
        restrictions: {
            type: [String],
        },
        isPublic: {
            type: Boolean,
        },
        isVegetarian: {
            type: Boolean,
        },
        isVegan: {
            type: Boolean,
        },
        isLactoseFree: {
            type: Boolean,
        },
        isGlutenFree: {
            type: Boolean,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Recipe', recipeSchema);
import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        plan: {
            monday: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Recipe',
                default: null
            },
            tuesday: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Recipe',
                default: null
            },
            wednesday: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Recipe',
                default: null
            },
            thursday: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Recipe',
                default: null
            },
            friday: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Recipe',
                default: null
            },
            saturday: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Recipe',
                default: null
            },
            sunday: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Recipe',
                default: null
            },
        },
    },
    { timestamps: true }
);

export default mongoose.model('MealPlan', mealPlanSchema);
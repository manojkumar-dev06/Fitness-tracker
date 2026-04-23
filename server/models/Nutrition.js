const { Schema, model } = require('mongoose');

const nutritionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  meals: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    time: {
      type: Date,
      default: Date.now
    },
    calories: {
      type: Number,
      min: 0
    },
    protein: {
      type: Number,
      min: 0
    },
    carbs: {
      type: Number,
      min: 0
    },
    fat: {
      type: Number,
      min: 0
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  waterIntake: {
    amount: {
      type: Number,
      min: 0,
      default: 0
    },
    unit: {
      type: String,
      enum: ['ml', 'oz', 'cups'],
      default: 'ml'
    },
    goal: {
      type: Number,
      min: 0,
      default: 2000 // Default goal in ml
    }
  },
  dailyGoals: {
    calories: {
      type: Number,
      min: 0,
      default: 2000
    },
    protein: {
      type: Number,
      min: 0,
      default: 150 // in grams
    },
    carbs: {
      type: Number,
      min: 0,
      default: 250 // in grams
    },
    fat: {
      type: Number,
      min: 0,
      default: 70 // in grams
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Virtual for total nutrition for the day
nutritionSchema.virtual('totalNutrition').get(function() {
  return this.meals.reduce((totals, meal) => ({
    calories: (totals.calories || 0) + (meal.calories || 0),
    protein: (totals.protein || 0) + (meal.protein || 0),
    carbs: (totals.carbs || 0) + (meal.carbs || 0),
    fat: (totals.fat || 0) + (meal.fat || 0)
  }), {});
});

// Add index for faster queries
nutritionSchema.index({ userId: 1, date: 1 });

const Nutrition = model('Nutrition', nutritionSchema);

module.exports = Nutrition;

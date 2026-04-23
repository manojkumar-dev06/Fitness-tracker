const Nutrition = require('../models/Nutrition');

const nutritionController = {
  // Get today's nutrition log
  async getTodaysLog({ user }, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let log = await Nutrition.findOne({
        userId: user._id,
        date: { $gte: today }
      });

      if (!log) {
        log = await Nutrition.create({
          userId: user._id,
          date: today,
          meals: [],
          waterIntake: { amount: 0, unit: 'ml', goal: 2000 },
          dailyGoals: { calories: 2000, protein: 150, carbs: 250, fat: 70 }
        });
      }
      res.json(log);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // Add a meal
  async addMeal({ user, body }, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const meal = {
        name: body.name,
        time: body.time || new Date(),
        calories: body.calories || 0,
        protein: body.protein || 0,
        carbs: body.carbs || 0,
        fat: body.fat || 0,
        category: body.category || 'other',
        notes: body.notes || ''
      };

      const log = await Nutrition.findOneAndUpdate(
        { userId: user._id, date: { $gte: today } },
        { $push: { meals: meal } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      res.json({ message: 'Meal added', log });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // Update water intake
  async updateWaterIntake({ user, body }, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const log = await Nutrition.findOneAndUpdate(
        { userId: user._id, date: { $gte: today } },
        { $set: { waterIntake: body } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      res.json({ message: 'Water intake updated', log });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // Update a meal
  async updateMeal({ user, body, params }, res) {
    try {
      const { mealId } = params;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updateFields = {};
      const mealFields = ['name', 'calories', 'protein', 'carbs', 'fat', 'notes', 'category'];
      
      // Only include fields that are provided in the request
      mealFields.forEach(field => {
        if (body[field] !== undefined) {
          updateFields[`meals.$.${field}`] = body[field];
        }
      });

      const log = await Nutrition.findOneAndUpdate(
        { 
          userId: user._id, 
          date: { $gte: today },
          'meals._id': mealId
        },
        { $set: updateFields },
        { new: true }
      );

      if (!log) {
        return res.status(404).json({ message: 'Meal not found' });
      }

      res.json({ message: 'Meal updated', log });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // Delete a meal
  async deleteMeal({ user, params }, res) {
    try {
      const { mealId } = params;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const log = await Nutrition.findOneAndUpdate(
        { 
          userId: user._id, 
          date: { $gte: today } 
        },
        { $pull: { meals: { _id: mealId } } },
        { new: true }
      );

      if (!log) {
        return res.status(404).json({ message: 'Meal not found' });
      }

      res.json({ message: 'Meal deleted', log });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
};

module.exports = nutritionController;

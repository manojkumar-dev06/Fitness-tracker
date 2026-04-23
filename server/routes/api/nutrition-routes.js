const router = require('express').Router();
const { authMiddleware } = require('../../utils/auth');
const {
  getTodaysLog,
  addMeal,
  updateWaterIntake,
  updateMeal,
  deleteMeal
} = require('../../controllers/nutrition-controller');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/nutrition/today - Get today's nutrition log
router.get('/today', getTodaysLog);

// POST /api/nutrition/meals - Add a meal
router.post('/meals', addMeal);

// PUT /api/nutrition/water - Update water intake
router.put('/water', updateWaterIntake);

// PUT /api/nutrition/meals/:mealId - Update a meal
router.put('/meals/:mealId', updateMeal);

// DELETE /api/nutrition/meals/:mealId - Delete a meal
router.delete('/meals/:mealId', deleteMeal);

module.exports = router;

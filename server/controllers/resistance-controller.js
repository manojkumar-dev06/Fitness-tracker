const { Resistance, User } = require("../models");

module.exports = {
  // create Resistance
  createResistance({ body }, res) {
    // Validate required fields
    if (!body.name || !body.sets || !body.reps || !body.date || !body.userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // For non-bodyweight exercises, weight is required
    if (body.muscleGroup !== 'bodyweight' && (!body.weight || parseFloat(body.weight) <= 0)) {
      return res.status(400).json({ message: "Weight is required for non-bodyweight exercises" });
    }

    // Set default values for optional fields
    const resistanceData = {
      name: body.name,
      category: body.category || 'strength',
      muscleGroup: body.muscleGroup || 'other',
      weight: parseFloat(body.weight),
      sets: parseInt(body.sets),
      reps: parseInt(body.reps),
      restPeriod: body.restPeriod ? parseInt(body.restPeriod) : 60,
      notes: body.notes || '',
      date: body.date,
      userId: body.userId,
      calories: body.calories || calculateCalories(body) // Calculate calories if not provided
    };

    // Function to calculate estimated calories for resistance exercises
    function calculateCalories(exercise) {
      const avgWeight = parseFloat(exercise.weight) || 0; // kg
      const avgReps = parseInt(exercise.reps) || 0; // average reps per set
      const sets = parseInt(exercise.sets) || 0; // number of sets
      const restPeriod = parseInt(exercise.restPeriod) || 60; // seconds
      const isBodyweight = exercise.muscleGroup === 'bodyweight';
      
      // Calculate total workout time (including rest)
      const setTime = sets * 3; // Assume 3 seconds per rep average
      const restTime = sets * restPeriod;
      const totalWorkoutMinutes = (setTime + restTime) / 60;
      
      // More accurate formula based on MET values and body weight
      // Resistance training MET: ~6.0 (moderate intensity)
      // Bodyweight exercises MET: ~7.0 (higher intensity)
      // Calories = MET × weight(kg) × time(hours)
      // Assuming average body weight of 70kg for calculation
      const bodyWeightKg = 70;
      const metValue = isBodyweight ? 7.0 : 6.0; // Higher MET for bodyweight
      const workoutHours = totalWorkoutMinutes / 60;
      
      // Base calories from resistance training
      const baseCalories = metValue * bodyWeightKg * workoutHours;
      
      // Additional calories based on actual work done (weight × reps × sets)
      // For bodyweight, use body weight as the resistance
      const effectiveWeight = isBodyweight ? bodyWeightKg * 0.65 : avgWeight; // 65% of body weight for push-ups
      const workCalories = (effectiveWeight * avgReps * sets) * 0.035; // More realistic factor
      
      const totalCalories = Math.round(baseCalories + workCalories);
      
      // Ensure minimum calories for the effort
      return Math.max(totalCalories, sets * (isBodyweight ? 8 : 5)); // Higher minimum for bodyweight
    }

    Resistance.create(resistanceData)
      .then((dbResistanceData) => {
        return User.findOneAndUpdate(
          { _id: body.userId },
          { $push: { resistance: dbResistanceData._id } },
          { new: true }
        )
      })
      .then((dbUserData) => {
        if (!dbUserData) {
          return res.status(404).json({ message: "Resistance created but no user with this id!" });
        }
        res.json({ 
          message: "Resistance successfully created!",
          resistance: dbResistanceData
        });
      })
      .catch((err) => {
        console.error('Error creating resistance:', err);
        res.status(500).json({ 
          message: "Error creating resistance",
          error: err.message 
        });
      });
  },

  // get one Resistance by id
  getResistanceById({ params }, res) {
    Resistance.findOne({ _id: params.id })
      .then((dbResistanceData) => {
        if (!dbResistanceData) {
          return res.status(404).json({ message: "No resistance data found with this id!" });
        }
        res.json(dbResistanceData);
      })
      .catch((err) => res.status(500).json(err));
  },

  // update resistance data
  updateResistance({ params, body }, res) {
    console.log('Updating resistance exercise:', { id: params.id, body });
    
    Resistance.findOneAndUpdate(
      { _id: params.id },
      { $set: body },
      { new: true, runValidators: true }
    )
      .then(dbResistanceData => {
        if (!dbResistanceData) {
          console.log('No resistance data found with id:', params.id);
          return res.status(404).json({ message: 'No resistance data found with this id!' });
        }
        
        console.log('Successfully updated resistance exercise:', dbResistanceData);
        
        // Return the updated resistance data in a consistent format
        res.json({
          _id: dbResistanceData._id,
          name: dbResistanceData.name,
          type: 'resistance',
          date: dbResistanceData.date,
          duration: dbResistanceData.duration,
          weight: dbResistanceData.weight,
          reps: dbResistanceData.reps,
          sets: dbResistanceData.sets,
          completed: dbResistanceData.completed,
          // Include any other fields you need
        });
      })
      .catch(err => {
        console.error('Error updating resistance:', err);
        res.status(500).json({ 
          message: 'Error updating resistance',
          error: err.message 
        });
      });
  },

  // delete resistance data
  deleteResistance({ params }, res) {
    Resistance.findOneAndDelete({ _id: params.id })
      .then((dbResistanceData) => {
        if (!dbResistanceData) {
          res.status(404).json({ message: "No resistance data found with this id!" });
          return;
        }
        // remove resistance on user data
        return User.findOneAndUpdate(
          { resistance: params.id },
          { $pull: { resistance: params.id } },
          { new: true }
        )
      })
      .then((dbUserData) => {
        if (!dbUserData) {
          return res.status(404).json({ message: "Resistance deleted but no user with this id!" });
        }
        res.json({ message: "Resistance successfully deleted!" });
      })
      .catch((err) => res.status(500).json(err));
  },
};

const { Cardio, User } = require("../models");

const createCardio = ({ body }, res) => {
  // Validate required fields
  if (!body.name || !body.distance || !body.duration || !body.date || !body.userId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Set default values for optional fields
  const cardioData = {
    name: body.name,
    category: body.category || 'steady_state',
    distance: parseFloat(body.distance),
    duration: parseInt(body.duration),
    intensity: body.intensity ? parseInt(body.intensity) : 5,
    caloriesBurned: body.caloriesBurned ? parseFloat(body.caloriesBurned) : null,
    avgHeartRate: body.avgHeartRate ? parseInt(body.avgHeartRate) : null,
    elevationGain: body.elevationGain ? parseFloat(body.elevationGain) : 0,
    notes: body.notes || '',
    date: body.date,
    userId: body.userId
  };

  Cardio.create(cardioData)
    .then((dbCardioData) => {
      return User.findOneAndUpdate(
        { _id: body.userId },
        { $push: { cardio: dbCardioData._id } },
        { new: true }
      )
    })
    .then((dbUserData) => {
      if (!dbUserData) {
        return res.status(404).json({ message: "Cardio created but no user with this id!" });
      }
      res.json({ 
        message: "Cardio successfully created!",
        cardio: dbCardioData
      });
    })
    .catch((err) => {
      console.error('Error creating cardio:', err);
      res.status(500).json({ 
        message: "Error creating cardio",
        error: err.message 
      });
    });
};

const getCardioById = ({ params }, res) => {
  Cardio.findOne({ _id: params.id })
    .then((dbCardioData) => {
      if (!dbCardioData) {
        return res.status(404).json({ message: "No cardio data found with this id!" });
      }
      // Ensure completed field exists
      if (dbCardioData.completed === undefined) {
        dbCardioData.completed = false;
      }
      res.json(dbCardioData);
    })
    .catch((err) => res.status(500).json(err));
};

const updateCardio = ({ params, body }, res) => {
  Cardio.findOneAndUpdate(
    { _id: params.id },
    { $set: body },
    { new: true, runValidators: true }
  )
    .then((dbCardioData) => {
      if (!dbCardioData) {
        return res.status(404).json({ message: "No cardio data found with this id!" });
      }
      res.json(dbCardioData);
    })
    .catch((err) => {
      console.error('Error updating cardio:', err);
      res.status(500).json({ 
        message: "Error updating cardio",
        error: err.message 
      });
    });
};

const deleteCardio = ({ params }, res) => {
  Cardio.findOneAndDelete({ _id: params.id })
    .then((dbCardioData) => {
      if (!dbCardioData) {
        res.status(404).json({ message: "No cardio data found with this id!" })
      }
      // remove cardio on user data
      return User.findOneAndUpdate(
        { cardio: params.id },
        { $pull: { cardio: params.id } },
        { new: true }
      )
    })
    .then((dbUserData) => {
      if (!dbUserData) {
        return res.status(404).json({ message: "Cardio deleted but no user with this id!" });
      }
      res.json({ message: "Cardio successfully deleted!" });
    })
    .catch((err) => res.status(500).json(err));
};

module.exports = {
  createCardio,
  getCardioById,
  updateCardio,
  deleteCardio,
};

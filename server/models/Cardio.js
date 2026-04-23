const { Schema, model } = require("mongoose");

const CardioSchema = new Schema(
  {
    type: {
      type: String,
      default: "cardio",
      required: true
    },
    completed: {
      type: Boolean,
      default: false,
      required: true
    },
    name: {
      type: String,
      required: true,
      maxlength: 30,
      enum: ['Running', 'Cycling', 'Swimming', 'Rowing', 'Elliptical', 'Stair Climber', 'Jump Rope', 'Other'],
      default: 'Running'
    },
    category: {
      type: String,
      required: true,
      enum: ['steady_state', 'hiit', 'intervals', 'fartlek', 'recovery'],
      default: 'steady_state'
    },
    distance: {
      type: Number,
      required: true,
      min: 0,
      max: 1000, // km or miles
      set: v => Math.round(v * 100) / 100 // Round to 2 decimal places
    },
    duration: {
      type: Number, // in minutes
      required: true,
      min: 1,
      max: 1440 // 24 hours in minutes
    },
    intensity: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    caloriesBurned: {
      type: Number,
      min: 0
    },
    avgHeartRate: {
      type: Number,
      min: 40,
      max: 220
    },
    elevationGain: {
      type: Number,
      min: 0
    },
    notes: {
      type: String,
      maxlength: 500
    },
    date: {
      type: Date,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  }
);

const Cardio = model("Cardio", CardioSchema);

module.exports = Cardio;

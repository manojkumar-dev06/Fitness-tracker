const { Schema, model } = require("mongoose");

const ResistanceSchema = new Schema(
  {
    type: {
      type: String,
      default: "resistance",
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
      maxlength: 30
    },
    category: {
      type: String,
      required: true,
      enum: ['strength', 'hypertrophy', 'power', 'endurance', 'warmup'],
      default: 'strength'
    },
    muscleGroup: {
      type: String,
      required: true,
      enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'full body', 'bodyweight', 'other'],
      default: 'other'
    },
    weight: {
      type: Number,
      required: function() { return this.muscleGroup !== 'bodyweight'; },
      default: 0
    },
    sets: {
      type: Number,
      required: true,
      min: 1,
      max: 20
    },
    reps: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    restPeriod: {
      type: Number,
      default: 60, // in seconds
      min: 0,
      max: 600
    },
    calories: {
      type: Number,
      min: 0,
      default: 0
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

const Resistance = model("Resistance", ResistanceSchema);

module.exports = Resistance;

const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sleep: {
    type: Number,
    required: true,
    default: 0,
  },
  water: {
    type: Number,
    required: true,
    default: 0,
  },
  meals: {
    type: [
      new mongoose.Schema(
        {
          meal: { type: String, default: "" },
          calorie: { type: Number, default: null },
        },
        { _id: false }
      ),
    ],
    default: [],
    required: true,
  },
  workout: {
    type: [
      new mongoose.Schema(
        {
          workout: { type: String, default: "" },
          time: { type: Number, default: null },
          calorieBurnt: { type: Number, default: null },
        },
        { _id: false }
      ),
    ],
    default: [],
    required: true,
  },
  date: {
    type: Date,
    default: () => new Date(),
  },
});

module.exports = mongoose.model("Habit", habitSchema);

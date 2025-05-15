const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const Habit = require("../models/habit");
const router = express.Router();
dotenv.config();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const { protect } = require("../middleware/auth");

router.get("/suggestion", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const latestHabit = await Habit.findOne({ user: userId });
    console.log(latestHabit);

    if (!latestHabit) {
      return res.status(404).json({ message: "No habit data found." });
    }
    const prompt = `
      A user has the following health data:
      - Sleep: ${latestHabit.sleep} hours
      - Water Intake: ${latestHabit.water} liters
      - Meals: ${latestHabit.meals
        .map((meal) => `${meal.meal} (${meal.calorie} calorieIntaken)`)
        .join(", ")}
      - Workouts: ${latestHabit.workout
        .map(
          (w) =>
            `${w.workout} (${w.time} mins) (${w.calorieBurnt} calorieBurnt)`
        )
        .join(", ")}

      Based on this, provide:
      1. A predicted health score (1 to 100)
      2. Suggestions to improve sleep, diet, and workout
      3. Personalized health routine tips
    `;

    console.log(prompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    console.log(response.text);

    return res.status(200).json({ suggestion: response.text });
  } catch (error) {
    console.log(error);

    return res.status(404).json({ error: error });
  }
});

module.exports = router;

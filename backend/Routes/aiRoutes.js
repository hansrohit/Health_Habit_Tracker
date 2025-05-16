const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const Habit = require("../models/habit");
const User = require("../models/user");
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
    const user = await User.findById(userId);
    const latestHabit = await Habit.findOne({ user: userId });
    console.log("user details: ", user);

    console.log(latestHabit);

    if (!latestHabit) {
      return res.status(404).json({ message: "No habit data found." });
    }
    const prompt = `
      User personal info:
      - name: ${user.name}
      - age: ${user.age}
      - height: ${user.height}
      - weight: ${user.weight}
      - goals: ${user.goals}

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
      -> Suggestions to improve sleep, diet, and workout from the given habit data like sleep for mention the time more hours, eat spinach for stomach ulcer, drink proteins shake for stamina, Do pull ups of hand stand for increasing the height, do squats for abs etc something like that related to that person the suggestion should be given not in general.
      -> Personalized health routine tips for the given user goal based on the habits given. (Use the persons age, height, weight factors for personalized suggestions and also to acheive the goal that is mentioned.)

      Things to be considered while providing the response:
      1) use less amount of emoji for better readibility don't use more emoji. Given the content in a format for word documentation.
      2) Use para wise for better design and readability. for every habits heading(Sleep,water intake,meals,workout).
      3) Just gimme the suggestion other than that don't state or mention anything like "here's your answer or somthing like providing something like that". Just gimme the answer for what i asked for suggestion. just the suggestion alone.
      4) Don't give the suggestion so big, give it briefly and also the main content should be conveyed to the user!
      5) if any habit like sleep or water intake or meals or workout is missing, don't state or mention that, just gimme the general suggestion for that briefly.
      6) Also user <br> for new line.
      7) use formal emoji for points not (* or **).
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

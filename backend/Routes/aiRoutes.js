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
    const latestHabit = await Habit.findOne({ user: userId }).sort({
      date: -1,
    });
    console.log("user details: ", user);

    console.log(latestHabit);

    if (!latestHabit) {
      return res.status(404).json({ message: "No habit data found." });
    }
    const sleep = latestHabit.sleep ? latestHabit.sleep : 0;
    const water = latestHabit.water ? latestHabit.water : 0;
    const meals =
      latestHabit.meals.length > 0
        ? latestHabit.meals
        : [{ meal: "empty", calorie: 0 }];
    const workout =
      latestHabit.workout.length > 0
        ? latestHabit.workout
        : [{ workout: "empty", time: 0, calorieBurnt: 0 }];
    const prompt = `
      User personal info:
      - name: ${user.name}
      - age: ${user.age}
      - height: ${user.height}
      - weight: ${user.weight}
      - goals: ${user.goals}

      A user has the following health data:
      - Sleep: ${sleep} hours
      - Water Intake: ${water} liters
      - Meals: ${meals
        .map((meal) => `${meal.meal} (${meal.calorie} calorieIntaken)`)
        .join(", ")}
      - Workouts: ${workout
        .map(
          (w) =>
            `${w.workout} (${w.time} mins) (${w.calorieBurnt} calorieBurnt)`
        )
        .join(", ")}

      Based on this, provide:
      -> Suggestions to improve sleep, diet, and workout from the given habit data's suggestion should be given not in general.
      -> Personalized health routine tips for the given user goal based on the habits given. (Use the persons age, height, weight factors for personalized suggestions and also to acheive the goal that is mentioned.)

      Things to be considered while providing the response:
      1) use required emoji for better readibility(like sleep, water, meals, workout...limited emoji's) don't use more emoji. Given the content in a format for word documentation.
      2) Use para wise for better design and readability. for every habits heading(Sleep,water intake,meals,workout).
      3) Just gimme the suggestion other than that don't state or mention anything like "here's your answer or somthing like providing something like that". Just gimme the answer for what i asked for suggestion. just the suggestion alone.
      4) Give the suggestion in detail for better understanding. 
      5) if any habit like sleep or water intake or meals or workout is missing, don't state or mention that, just gimme the general suggestion for that briefly.
      6) Don't mention the user name anywhere. 
      7) Don't use any symbols like #,*, etc...
      8) Heading that i've mentioned should be in Bold letters
      9) Everytime you give an response, give the response freashly don't mention as said earlier or mentioned earlier...
      10) Here are some suggestions based on the provided health data anything like or related to that don't mention.
      11) I want you to directly say to the user, without mentioning them as a user, just give the suggestion. Don't mention anything like stating or talking to the third person. Instead use some alternatives like Here's your personalized suggestion. And do casually say since you're some age/weight/height you need to improve or avoid these activities like that say in the response casually talking to them directly...
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

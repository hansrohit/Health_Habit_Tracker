const express = require("express");
const router = express.Router();
const moment = require("moment");
const User = require("../models/user");
const habit = require("../models/habit");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/token");
const { generateAccessToken, protect } = require("../middleware/auth");

const generateRefreshToken = async (user) => {
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

  const token = new Token({
    userId: user.id,
    refreshToken: refreshToken,
  });

  await token.save();

  return refreshToken;
};

router.post("/register", async (req, res) => {
  const {
    name,
    email,
    password,
    age,
    weight,
    height,
    goals,
    reminderEnabled,
    reminderTime,
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const newUser = new User({
      name,
      email,
      password,
      age,
      weight,
      height,
      goals,
      reminderTime: reminderTime || null,
      reminderEnabled: reminderEnabled || false,
    });
    await newUser.save();

    const payload = { id: newUser._id, email: newUser.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
        weight: newUser.weight,
        height: newUser.height,
        goals: newUser.goals,
        reminderTime: newUser.reminderTime,
        reminderEnabled: newUser.reminderEnabled,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    await Token.deleteMany({ userId: user._id });

    const payload = { id: user._id, email: user.email };
    const accessToken = generateAccessToken(payload);

    const refreshToken = await generateRefreshToken(payload);

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.put("/update-profile/:id", async (req, res) => {
  const {
    name,
    email,
    // password,
    age,
    weight,
    height,
    goals,
    remainderTime,
    remainderEnabled,
  } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // if (email && email !== user.email) {
    //   const emailExists = await User.findOne({ email });
    //   if (emailExists) {
    //     return res.status(400).json({ message: "Email already in use" });
    //   }
    //   user.email = email;
    // }

    if (name) user.name = name;
    if (age) user.age = age;
    if (weight) user.weight = weight;
    if (height) user.height = height;
    if (goals) user.goals = goals;
    if (remainderTime !== undefined) user.reminderTime = remainderTime;
    if (remainderEnabled !== undefined) user.reminderEnabled = remainderEnabled;

    // if (password) {
    //   user.password = password;
    // }

    await user.save();

    res.status(200).json({
      message: "User details updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        goals: user.goals,
        reminderTime: user.reminderTime,
        reminderEnabled: user.reminderEnabled,
        currentStreak: user.currentStreak,
        maxStreak: user.maxStreak,
        lastHabitDate: user.lastHabitDate,
        score: user.score,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.get("/profile", protect, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        goals: user.goals,
        currentStreak: user.currentStreak,
        maxStreak: user.maxStreak,
        remainderTime: user.reminderTime,
        remainderEnabled: user.reminderEnabled,
        lastHabitDate: user.lastHabitDate,
        score: user.score,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.get("/reminder-status/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    if (!user || !user.reminderEnabled || !user.reminderTime) {
      return res.json({ showReminder: false });
    }

    const [hour, minute] = user.reminderTime.split(":");
    const reminderMoment = moment().set({
      hour: parseInt(hour),
      minute: parseInt(minute),
      second: 0,
    });

    const now = moment();
    if (now.isBefore(reminderMoment)) {
      return res.json({ showReminder: false });
    }

    const hasHabitToday = await habit.findOne({
      user: userId,
      date: {
        $gte: moment().startOf("day").toDate(),
        $lte: moment().endOf("day").toDate(),
      },
    });

    return res.json({ showReminder: !hasHabitToday });
  } catch (err) {
    console.error("Reminder status error:", err);
    return res
      .status(500)
      .json({ showReminder: false, error: "Internal Server Error" });
  }
});

router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: "refresh token is required" });

  try {
    const deleted = await Token.findOneAndDelete({ refreshToken });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Token not found or already deleted" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error during logout" });
  }
});

router.put("/score", protect, async (req, res) => {
  const ans = moment().startOf("day");
  console.log(ans);

  try {
    const userId = req.user.id;
    const today = moment().startOf("day");
    const tomorrow = moment().endOf("day");
    const user = await User.findById(userId);
    const response = await habit.findOne({
      user: userId,
      date: { $gte: today, $lte: tomorrow },
    });
    if (!response || response === undefined) {
      const score = 0;
      user.score = score;
      await user.save();
      return res.status(200).json({ message: "habit not found", user: user });
    }

    const sleep = response.sleep;
    const water = response.water;
    const meals = response.meals;
    const workout = response.workout;

    let sleepScore = 0;
    if (sleep >= 7 && sleep <= 9) sleepScore = 25;
    else if ((sleep >= 6 && sleep < 7) || (sleep > 9 && sleep <= 11))
      sleepScore = 20;
    else if ((sleep >= 5 && sleep < 6) || (sleep > 11 && sleep <= 13))
      sleepScore = 15;
    else if ((sleep >= 4 && sleep < 5) || (sleep >= 14 && sleep < 15))
      sleepScore = 9;
    else if (sleep == 0) sleepScore = 0;
    else sleepScore = 5;

    let waterScore = 0;

    if (water == 0) waterScore = 0;
    else if (water >= 3 && water <= 3.7) waterScore = 25;
    else if ((water >= 2.5 && water < 3) || (water >= 3.7 && water <= 4.5))
      waterScore = 22;
    else if (water >= 2 && water < 2.5) waterScore = 18;
    else if (water >= 1.5 && water < 2) waterScore = 14;
    else if (water >= 1 && water < 1.5) waterScore = 9;
    else waterScore = 5;

    let mealScore = 0;
    let mealSum = 0;
    const mealLen = mealScore.length;
    if (mealLen > 0) {
      mealSum = meals.reduce((sum, meal) => sum + meal.calorie, 0);

      if (mealSum >= 1800 && mealSum <= 2200) {
        mealScore = 25;
      } else if (mealSum < 1800) {
        mealScore = (mealSum / 1800) * 25;
      } else if (mealSum > 2200) {
        mealScore = (2200 / mealSum) * 25;
      }
    }

    let workoutScore = 0;
    let workTime = 0;
    let workCalorie = 0;
    const workoutLen = workout.length;
    if (workoutLen > 0) {
      workTime = workout.reduce((sum, workout) => sum + workout.time, 0);
      workCalorie = workout.reduce(
        (sum, workout) => sum + workout.calorieBurnt,
        0
      );

      const timeScore = (workTime / 45) * 100;
      const calorieScore = (workCalorie / 250) * 100;

      workoutScore = timeScore * 0.5 + calorieScore * 0.5;
      if (workoutScore > 100) workoutScore = 100;

      workoutScore = workoutScore * 0.25;
    }
    const totalScore = sleepScore + waterScore + mealScore + workoutScore;
    user.score = Math.round(totalScore);
    await user.save();
    return res
      .status(200)
      .json({ message: "score data successfully fetched", user: user });
  } catch (error) {
    console.log("score backend error: ", error);
    res.status(500).json({ message: "error in the score base", error: error });
  }
});

module.exports = router;

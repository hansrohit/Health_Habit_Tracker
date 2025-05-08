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
    return res.Status(400).json({ message: "refresh token is required" });

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

module.exports = router;

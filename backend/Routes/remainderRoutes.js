const express = require("express");
const router = express.Router();
const moment = require("moment");
const User = require("../models/user");
const Habit = require("../models/habit");

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

    const hasHabitToday = await Habit.findOne({
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

module.exports = router;

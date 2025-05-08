const cron = require("node-cron");
const moment = require("moment");
const User = require("./models/user");
const Habit = require("./models/habit");

console.log("cron running here");

cron.schedule("*/10 * * * *", async () => {
  const users = await User.find({ reminderEnabled: true });

  for (const user of users) {
    const { _id, reminderTime, email } = user;

    const now = moment();
    const [reminderHour, reminderMinute] = reminderTime.split(":");
    const reminderMoment = moment().set({
      hour: parseInt(reminderHour),
      minute: parseInt(reminderMinute),
      second: 0,
    });

    if (now.isBefore(reminderMoment)) continue;

    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const hasHabitToday = await Habit.findOne({
      user: _id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!hasHabitToday) {
      console.log(`Send reminder to ${email} - habit not updated yet.`);
    }
  }
});

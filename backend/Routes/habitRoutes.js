const express = require("express");
const router = express.Router();
const moment = require("moment");
const Habit = require("../models/habit");
const User = require("../models/user");
const { protect } = require("../middleware/auth");

router.put("/update-habit/:userId", async (req, res) => {
  const { sleep, waterIntake, meals, workouts } = req.body;
  const userId = req.params.userId;

  try {
    const todayDate = moment().startOf("day");
    console.log(`today date: ${todayDate}`);

    let habit = await Habit.findOne({
      user: userId,
      date: { $gte: todayDate },
    });
    console.log(`habit if exists: ${habit}`);

    const user = await User.findById(userId);
    console.log("my name is: ", user);

    const filterValidEntries = (arr, fields) => {
      return (Array.isArray(arr) ? arr : []).filter((item) =>
        fields.every((field) => item[field] !== null && item[field] !== "")
      );
    };

    const validMeals = filterValidEntries(meals, ["meal", "calorie"]);
    const validWorkouts = filterValidEntries(workouts, [
      "workout",
      "time",
      "calorieBurnt",
    ]);

    const allFieldsCleared =
      (sleep === null || sleep === "") &&
      (waterIntake === null || waterIntake === "") &&
      validMeals.length === 0 &&
      validWorkouts.length === 0;

    if (habit) {
      console.log("yes daddy");

      const updatedHabit = {
        sleep:
          sleep !== undefined && sleep !== null && sleep !== ""
            ? sleep
            : habit.sleep,
        water:
          waterIntake !== undefined &&
          waterIntake !== null &&
          waterIntake !== ""
            ? waterIntake
            : habit.water,
        meals:
          meals !== undefined && meals !== null && validMeals.length !== 0
            ? validMeals
            : habit.meals,
        workout:
          workouts !== undefined &&
          workouts !== null &&
          validWorkouts.length !== 0
            ? validWorkouts
            : habit.workout,
      };

      if (allFieldsCleared) {
        console.log("called");

        if (user.maxStreak > 0 && user.maxStreak === user.currentStreak) {
          const last = moment(user.lastHabitDate);
          if (last.isSame(moment(todayDate), "day")) {
            user.maxStreak = user.maxStreak - 1;
          }
        }
        user.currentStreak = Math.max(0, user.currentStreak - 1);
      }

      habit = await Habit.findByIdAndUpdate(habit._id, updatedHabit, {
        new: true,
      });

      if (allFieldsCleared) {
        try {
          console.log("haaaabbbbbiitititititiit: ", habit._id);
          await Habit.findByIdAndDelete(habit._id);
        } catch (error) {
          console.log("error in habit deletion: ", error);
        }
        try {
          const latestUserDate = await Habit.findOne({ user: userId })
            .sort({ date: -1 })
            .limit(1);
          user.lastHabitDate =
            latestUserDate !== null
              ? moment(latestUserDate.date).toDate()
              : null;
          // const formattt = moment(latestUserDate.date).toDate();
          // user.name = "hans rohit";
          await user.save();
          // console.log(`latest user details: ${latestUserDate.date}`);

          console.log(`db latestDate: ${latestUserDate}`);
          // console.log(`formated date: ${formattt}`);
        } catch (error) {
          console.log(`error in profile delete update: ${error}`);
        }
        return res.status(200).json({
          message: "Habit data cleared for today. Streak decreased.",
          habit,
          user,
        });
      }

      await user.save();

      return res.status(200).json({
        message: "Habit data updated successfully",
        habit,
        user,
      });
    } else {
      const newHabit = new Habit({
        user: userId,
        sleep: sleep ? sleep : 0,
        water: waterIntake ? waterIntake : 0,
        meals: validMeals,
        workout: validWorkouts,
      });

      const bbc = new Date(user.lastHabitDate).toISOString();
      const llb = moment.utc(bbc);
      console.log(`apple: ${bbc}`);
      console.log(`halwab: ${llb}`);
      await newHabit.save();
      console.log(`asdhfdh: ${user.lastHabitDate}`);

      const lastHabitDate = user.lastHabitDate
        ? moment(user.lastHabitDate)
        : null;

      console.log(
        "Last Habit Date: ",
        user.lastHabitDate ? moment(user.lastHabitDate).format() : "None"
      );
      const ttttttttt = moment(todayDate).subtract(1, "days");
      console.log(`lllllaaaasssstttt date: ${lastHabitDate}`);
      console.log(`todayy moment: ${ttttttttt}`);
      const prevCheck = llb.isBefore(
        moment(todayDate).subtract(1, "days"),
        "day"
      );
      console.log(`prevCheck: ${prevCheck}`);

      if (!lastHabitDate || llb.isBefore(todayDate, "day")) {
        user.currentStreak = 1;
      } else if (llb.isSame(todayDate, "day")) {
        user.currentStreak += 1;
      } else {
        console.log("Streak remains the same: ", user.currentStreak);
      }

      if (user.currentStreak > user.maxStreak) {
        user.maxStreak = user.currentStreak;
      }

      user.lastHabitDate = moment().toDate();
      await user.save();

      return res.status(200).json({
        message: "Habit data added successfully and streak updated",
        habit: newHabit,
        user: {
          currentStreak: user.currentStreak,
          maxStreak: user.maxStreak,
          lastHabitDate: user.lastHabitDate,
        },
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
});

const filterValidEntries = (arr, fields) => {
  return (Array.isArray(arr) ? arr : []).filter((item) =>
    fields.every((field) => item[field] !== null && item[field] !== "")
  );
};

router.get("/today/:userId", protect, async (req, res) => {
  const userId = req.params.userId;
  const todayDate = moment().startOf("day");

  try {
    const habit = await Habit.findOne({
      user: userId,
      date: { $gte: todayDate },
    });

    if (!habit) {
      return res.status(404).json({ message: "No habit data for today" });
    }

    habit.meals = filterValidEntries(habit.meals, ["meal", "calorie"]);
    habit.workout = filterValidEntries(habit.workout, [
      "workout",
      "time",
      "calorieBurnt",
    ]);

    res.status(200).json({ habit });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.get("/history/:userId", protect, async (req, res) => {
  const userId = req.params.userId;

  try {
    const habits = await Habit.find({ user: userId }).sort({ date: -1 });

    const cleanedHabits = habits.map((habit) => {
      habit.meals = filterValidEntries(habit.meals, ["meal", "calorie"]);
      habit.workout = filterValidEntries(habit.workout, [
        "workout",
        "time",
        "calorieBurnt",
      ]);
      return habit;
    });

    res.status(200).json({ habits: cleanedHabits });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.get("/weekly/:userId", async (req, res) => {
  const userId = req.params.userId;

  const startOfWeek = moment()
    .startOf("week")
    // .add(1, "days")
    .startOf("day")
    .toDate();
  const endOfWeek = moment().endOf("day").toDate();

  try {
    const habits = await Habit.find({
      user: userId,
      date: { $gte: startOfWeek, $lte: endOfWeek },
    });

    if (habits.length === 0) {
      return res
        .status(200)
        .json({ habits: { meals: 0, workout: 0, sleep: 0, water: 0 } });
    }

    const cleanedHabits = habits.map((habit) => {
      habit.meals = filterValidEntries(habit.meals, ["meal", "calorie"]);
      habit.workout = filterValidEntries(habit.workout, [
        "workout",
        "time",
        "calorieBurnt",
      ]);
      return habit;
    });

    res.status(200).json({ habits: cleanedHabits });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.put("/updateStreak/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    const lastHabitDate = user.lastHabitDate;
    const todayDate = moment().startOf("day");
    const bbc = lastHabitDate
      ? new Date(user.lastHabitDate).toISOString()
      : null;
    const llb = lastHabitDate ? moment.utc(bbc) : null;
    console.log(`apple: ${bbc}`);
    console.log(`halwab: ${llb}`);
    if (!lastHabitDate) {
      user.currentStreak = 0;
    } else {
      if (llb.isBefore(todayDate, "day")) {
        user.currentStreak = 0;
      }
    }
    await user.save();
    return res
      .status(200)
      .json({ message: "user streak updated successfully", user: user });
  } catch (error) {
    console.log("streaking fetch and update error: ", error);

    res.status(404).json({ message: "streak fetching and update error" });
  }
});

module.exports = router;

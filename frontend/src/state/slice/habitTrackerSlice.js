import { createSlice } from "@reduxjs/toolkit";

const habitDataFromStorage = localStorage.getItem("habitData")
  ? JSON.parse(localStorage.getItem("habitData"))
  : {
      sleep: "",
      waterIntake: "",
      meals: [],
      workouts: [],
    };

const habitTrackerSlice = createSlice({
  name: "habitTracker",
  initialState: habitDataFromStorage,
  reducers: {
    updateHabitData: (state, action) => {
      const { meals, workouts, sleep, waterIntake } = action.payload;

      if (sleep) {
        state.sleep = sleep;
      }

      if (waterIntake) {
        state.waterIntake = waterIntake;
      }

      if (meals.length > 0) {
        state.meals = [...meals];
      }

      if (workouts.length > 0) {
        state.workouts = [...workouts];
      }
      localStorage.setItem("habitData", JSON.stringify(state));
    },
    clearHabitData: (state) => {
      state.sleep = "";
      state.waterIntake = "";
      state.meals = [];
      state.workouts = [];

      localStorage.removeItem("habitData");
    },
  },
});

export const { updateHabitData, clearHabitData } = habitTrackerSlice.actions;
export const habitTrackerReducer = habitTrackerSlice.reducer;

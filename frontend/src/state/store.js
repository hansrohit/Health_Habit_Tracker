import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "../state/slice/authSlice";
import { profileReducer } from "../state/slice/profileSlice";
import { habitTrackerReducer } from "../state/slice/habitTrackerSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    habitTracker: habitTrackerReducer,
  },
});

export default store;

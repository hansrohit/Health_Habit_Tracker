import { createSlice } from "@reduxjs/toolkit";
import { clearProfile } from "./profileSlice";

let userInfo = null;
const userInfoFromStorage = localStorage.getItem("userInfo");
if (userInfoFromStorage && userInfoFromStorage !== "undefined") {
  try {
    userInfo = JSON.parse(userInfoFromStorage);
  } catch (error) {
    console.error("Error parsing userInfo from localStorage:", error);
    localStorage.removeItem("userInfo");
  }
}

const userToken = localStorage.getItem("userToken") || null;
const refreshToken = localStorage.getItem("refreshToken") || null;

const initialState = {
  userInfo: userInfo,
  userToken: userToken,
  refreshToken: refreshToken,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.userInfo = action.payload.user;
      state.userToken = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem("userInfo", JSON.stringify(action.payload.user));
      localStorage.setItem("userToken", action.payload.token);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
      localStorage.setItem("userProfile", JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state, action) => {
      state.userInfo = null;
      state.userToken = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("lastStreakUpdate");

      if (action.payload && action.payload.dispatch) {
        action.payload.dispatch(clearProfile());
      }
    },
    updateProfile: (state, action) => {
      state.userInfo.user = { ...state.userInfo.user, ...action.payload };
      localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
      // const user=action.payload;
      // localStorage.setItem("userProfile", JSON.stringify(action.payload));
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } =
  authSlice.actions;

export const authReducer = authSlice.reducer;

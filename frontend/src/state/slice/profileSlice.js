import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProfile,
  updateUserProfile as updateProfileApi,
} from "../../services/api";

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.userToken;
      if (!token) throw new Error("No token found");
      const profile = await getProfile(token);
      return profile;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch profile");
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async (updatedData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.userToken;
      if (!token) throw new Error("No token found");
      const updatedProfile = await updateProfileApi(updatedData, token);
      return updatedProfile;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update profile");
    }
  }
);
const userProfileFromStorage = localStorage.getItem("userProfile");
const profileSlice = createSlice({
  name: "profile",
  initialState: {
    user: userProfileFromStorage ? JSON.parse(userProfileFromStorage) : null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProfile: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        console.log(state.user);
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfile } = profileSlice.actions;

export const profileReducer = profileSlice.reducer;

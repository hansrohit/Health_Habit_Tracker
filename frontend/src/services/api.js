import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/api/users/register`, userData);
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/api/users/login`, {
    email,
    password,
  });
  return response.data;
};

export const getProfile = async (accessToken) => {
  try {
    const response = await axios.get(`${API_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch profile";
  }
};

export const getSuggestion = async (accessToken) => {
  try {
    const response = await axios.get(`${API_URL}/api/ai/suggestion`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log("suggestion error caught in the frontend: ", error);
  }
};

export const getUserProfile = async () => {
  const accessToken = localStorage.getItem("accessToken");

  const res = await axios.get(`${API_URL}/api/users/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res.data;
};

export const updateUserProfile = async (formData, user) => {
  const res = await axios.put(
    `${API_URL}/api/users/update-profile/${user}`,
    formData
  );

  return res.data;
};

export const logoutUser = async (refreshToken) => {
  await axios.post(`${API_URL}/api/users/logout`, { refreshToken });
};

export const checkReminderStatus = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/reminder/reminder-status/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error checking reminder status:", error);
    return { showReminder: false };
  }
};

export const habitInput = async (formData, user) => {
  const response = await axios.put(
    `${API_URL}/api/habits/update-habit/${user}`,
    formData
  );
  return response.data;
};

export const getWeeklyHabits = async (user) => {
  try {
    const response = await axios.get(`${API_URL}/api/habits/weekly/${user}`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updateDailyStreak = async (user) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/habits/updateStreak/${user}`
    );
    return response;
  } catch (error) {
    console.log("update streak error in api: ", error);
  }
};

export const getScore = async (accessToken) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/users/score`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("api score error: ", error);
  }
};

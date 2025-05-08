import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@chakra-ui/react";
import { checkReminderStatus } from "./services/api";
import { fetchUserProfile } from "./state/slice/profileSlice";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import HabitTrackerPage from "./pages/HabitTrackerPage";
import ProtectedRoute from "./protectedRoute";
import DashBoard from "./pages/DashBoard";
import WebLayout from "./layout/WebLayout";

export default function App() {
  const { userInfo } = useSelector((state) => state.auth);
  const toast = useToast();

  useEffect(() => {
    if (!userInfo?.user?.id) return;
    const checkReminder = async () => {
      let showReminder = false;
      if (userInfo.user) {
        console.log("remainder checkkkkk: ", userInfo.user.id);

        const reminderData = await checkReminderStatus(userInfo.user.id);
        console.log("reminderData response: ", reminderData);

        showReminder = reminderData.showReminder;
        console.log(showReminder);
      }
      if (showReminder) {
        toast({
          title: "Reminder",
          description: "Don't forget to enter your habits today!",
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top-right",
          containerStyle: {
            marginTop: "66px",
          },
        });
      }
    };

    checkReminder();

    const validInterval = setInterval(checkReminder, 10 * 60 * 1000);
    return () => clearInterval(validInterval);
  }, [userInfo?.user?.id, toast]);

  return (
    <Router>
      <Routes>
        <Route element={<WebLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracker"
            element={
              <ProtectedRoute>
                <HabitTrackerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashBoard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

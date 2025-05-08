import { useEffect, React } from "react";
import { Box, Flex, Text, Button, HStack, Icon, Badge } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiUser, FiLogIn } from "react-icons/fi";
import { FaFireAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { updateDailyStreak } from "../services/api";
import { updateProfile } from "../state/slice/authSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth); // get from global state
  // console.log("hellllloooooo");
  // console.log(userInfo.user.id);
  useEffect(() => {
    const streakUpdate = async () => {
      console.log("byeee");

      try {
        const user = userInfo.user.id;
        const lastStreakUpdate = localStorage.getItem("lastStreakUpdate");
        const todayDate = new Date().toISOString().split("T")[0];
        console.log("lastStreakUpdate: ", lastStreakUpdate);
        console.log("todayDate: ", todayDate);

        // if (!lastStreakUpdate) return;
        if (lastStreakUpdate === todayDate) return;
        const res = await updateDailyStreak(user);
        console.log("nav response: ", res);
        console.log("nav response1: ", res.data.message);

        if (res.data.message === "user streak updated successfully") {
          const user = {
            id: res.data.user._id,
            name: res.data.user.name,
            email: res.data.user.email,
            age: res.data.user.age,
            weight: res.data.user.weight,
            height: res.data.user.height,
            goals: res.data.user.goals,
            currentStreak: res.data.user.currentStreak,
            maxStreak: res.data.user.maxStreak,
            remainderTime: res.data.user.reminderTime,
            remainderEnabled: res.data.user.reminderEnabled,
            lastHabitDate: res.data.user.lastHabitDate,
          };
          console.log(user);

          dispatch(updateProfile(user));
          localStorage.setItem("lastStreakUpdate", todayDate);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (userInfo) {
      console.log("hans rohit");

      streakUpdate();
    }
  }, [userInfo]);
  let streak = 0;
  if (userInfo !== null && userInfo) {
    if (
      userInfo.user !== null &&
      userInfo.user !== undefined &&
      userInfo.user !== ""
    ) {
      if (userInfo.user.currentStreak) {
        streak = userInfo.user.currentStreak;
      }
    }
  }

  const navLinkStyle = (path) => ({
    fontWeight: "medium",
    fontSize: "md",
    color: location.pathname === path ? "#4169E1" : "gray.700",
    borderBottom: location.pathname === path ? "2px solid #4169E1" : "none",
    _hover: {
      color: "#4169E1",
      textDecoration: "none",
      borderBottom: "2px solid #4169E1",
    },
    transition: "all 0.3s",
  });

  return (
    <Box
      position="sticky"
      top="0"
      width="100%"
      bg="rgba(240, 240, 240, 0.8)"
      backdropFilter="saturate(180%) blur(10px)"
      zIndex="100"
      boxShadow="sm"
      px={6}
      py={3}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontSize="2xl" fontWeight="bold" color="#4169E1">
          HealthTracker
        </Text>

        <HStack spacing={6}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <Text {...navLinkStyle("/")}>Home</Text>
          </Link>

          {userInfo ? (
            <>
              <Link to="/dashboard" style={{ textDecoration: "none" }}>
                <Text {...navLinkStyle("/dashboard")}>Dashboard</Text>
              </Link>

              <Link to="/profile" style={{ textDecoration: "none" }}>
                <Text {...navLinkStyle("/profile")}>Profile</Text>
              </Link>

              <Flex alignItems="center">
                <Icon
                  as={FaFireAlt}
                  color={streak > 0 ? "orange.400" : "gray.400"}
                  boxSize={5}
                  mr={1}
                />
                <Badge
                  fontSize="sm"
                  colorScheme={streak > 0 ? "orange" : "gray"}
                  variant="subtle"
                  borderRadius="full"
                >
                  {streak}
                </Badge>
              </Flex>
            </>
          ) : (
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Text {...navLinkStyle("/login")}>Login</Text>
            </Link>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;

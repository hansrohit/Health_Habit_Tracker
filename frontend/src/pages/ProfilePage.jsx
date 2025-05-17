import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  VStack,
  Text,
  useToast,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { FaFire, FaHeartbeat, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, updateUserProfile } from "../services/api";
import { logout, updateProfile } from "../state/slice/authSlice";
import { clearProfile, fetchUserProfile } from "../state/slice/profileSlice";
import { clearHabitData } from "../state/slice/habitTrackerSlice";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.profile);
  const toast = useToast();
  const navigate = useNavigate();

  let userId = null;
  if (user) {
    if (user.user) {
      userId = user.user.id;
    }
  }

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    age: "",
    goals: "",
    weight: "",
    height: "",
    remainderEnabled: false,
    remainderTime: "",
  });

  const [initialFormData, setInitialFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  let maxStreak = 0;
  if (user) {
    maxStreak = user.user.maxStreak;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isEmailValid = (email) => {
    return email.includes("@gmail.com");
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.age &&
      formData.weight &&
      formData.height &&
      (!formData.remainderEnabled || formData.remainderTime)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailValid(formData.email)) {
      return alert("Please enter a valid Gmail address.");
    }

    if (!formData.remainderEnabled) {
      formData.remainderTime = "";
    }

    if (formData.remainderEnabled && !formData.remainderTime) {
      return alert("Please enter a valid reminder time.");
    }
    try {
      const res = await updateUserProfile(formData, userId);
      const user1 = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        age: res.user.age,
        weight: res.user.weight,
        height: res.user.height,
        goals: res.user.goals,
        currentStreak: res.user.currentStreak,
        maxStreak: res.user.maxStreak,
        remainderTime: res.user.reminderTime,
        remainderEnabled: res.user.reminderEnabled,
        lastHabitDate: res.user.lastHabitDate,
      };
      dispatch(updateProfile(user1));
      dispatch(fetchUserProfile());
      localStorage.setItem("userProfile", JSON.stringify({ user: user1 }));
      toast({
        title: "Profile updated successfully",
        status: "success",
        isClosable: true,
        position: "top-left",
        duration: 3000,
      });
      setIsEditing(false);
    } catch (error) {
      console.log("update error in frontend: ", error);
      toast({
        title: "Profile update failed",
        status: "error",
        isClosable: true,
        position: "top-left",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (user) {
      const newFormData = {
        id: user.user.id || "",
        name: user.user.name || "",
        email: user.user.email || "",
        age: user.user.age || "",
        goals: user.user.goals || "",
        weight: user.user.weight || "",
        height: user.user.height || "",
        remainderEnabled: user.user.remainderEnabled || false,
        remainderTime: user.user.remainderTime || "",
      };
      setFormData(newFormData);
      setInitialFormData(newFormData);
    }
  }, [
    user?.user?.id,
    user?.user?.name,
    user?.user?.email,
    user?.user?.age,
    user?.user?.goals,
    user?.user?.weight,
    user?.user?.height,
    user?.user?.remainderEnabled,
    user?.user?.remainderTime,
  ]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await logoutUser(refreshToken);
      }

      localStorage.removeItem("userToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userProfile");

      dispatch(logout());
      dispatch(clearProfile());
      dispatch(clearHabitData());
      navigate("/login");
    } catch (error) {
      console.error("Logout error", error);
      toast({
        title: "Logout Failed",
        description: "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setIsEditing(false);
  };

  return (
    <>
      <Box width="97%" mx="auto" height="auto" textAlign="right" mt="2">
        <Button
          colorScheme="red"
          onClick={handleLogout}
          leftIcon={<FaSignOutAlt />}
        >
          Sign Out
        </Button>
      </Box>
      <Box>
        <Flex justify="space-between">
          <Box
            maxW="500px"
            mx="auto"
            mt={4}
            p={6}
            borderWidth={1}
            borderRadius="lg"
            bg="whitesmoke"
            w="45%"
          >
            <Text fontSize="2xl" mb={4} fontWeight="bold">
              Profile
            </Text>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  name="name"
                  focusBorderColor="gray.600"
                  borderColor="gray.600"
                  value={formData.name}
                  isReadOnly={!isEditing}
                  onChange={handleChange}
                  color="black"
                  bg="transparent"
                  _placeholder={{ color: "black" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  focusBorderColor="gray.600"
                  borderColor="gray.600"
                  value={formData.email}
                  isReadOnly
                  onChange={handleChange}
                  color="black"
                  bg="transparent"
                  _placeholder={{ color: "black" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Age</FormLabel>
                <Input
                  type="number"
                  name="age"
                  focusBorderColor="gray.600"
                  borderColor="gray.600"
                  value={formData.age}
                  isReadOnly={!isEditing}
                  onChange={handleChange}
                  color="black"
                  bg="transparent"
                  _placeholder={{ color: "black" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Goals</FormLabel>
                <Input
                  type="text"
                  name="goals"
                  value={formData.goals}
                  color="black"
                  bg="transparent"
                  focusBorderColor="gray.600"
                  borderColor="gray.600"
                  isReadOnly={!isEditing}
                  onChange={handleChange}
                  _placeholder={{ color: "black" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Weight (kg)</FormLabel>
                <Input
                  type="number"
                  name="weight"
                  focusBorderColor="gray.600"
                  borderColor="gray.600"
                  value={formData.weight}
                  isReadOnly={!isEditing}
                  onChange={handleChange}
                  color="black"
                  bg="transparent"
                  _placeholder={{ color: "black" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Height (cm)</FormLabel>
                <Input
                  type="number"
                  name="height"
                  focusBorderColor="gray.600"
                  borderColor="gray.600"
                  value={formData.height}
                  isReadOnly={!isEditing}
                  onChange={handleChange}
                  color="black"
                  bg="transparent"
                  _placeholder={{ color: "black" }}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Enable Reminder</FormLabel>
                <Switch
                  name="remainderEnabled"
                  isChecked={formData.remainderEnabled}
                  isDisabled={!isEditing}
                  onChange={() =>
                    setFormData((prev) => ({
                      ...prev,
                      remainderEnabled: !prev.remainderEnabled,
                      remainderTime: "",
                    }))
                  }
                  colorScheme="gray"
                  sx={{
                    ".chakra-switch__thumb": {
                      backgroundColor: "rgb(54, 80, 157)",
                    },
                    ".chakra-switch__track": {
                      backgroundColor: "transparent",
                      border: "2px solid rgb(54, 80, 157)",
                    },
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Reminder Time</FormLabel>
                <Input
                  type="time"
                  name="remainderTime"
                  value={formData.remainderTime || ""}
                  isReadOnly={!isEditing}
                  disabled={!formData.remainderEnabled}
                  onChange={handleChange}
                  focusBorderColor="gray.600"
                  borderColor="gray.600"
                  color="black"
                  bg="transparent"
                  _placeholder={{ color: "gray.600" }}
                />
              </FormControl>

              <Flex mt={4} width="full" gap={2}>
                <Button
                  color="white"
                  bg={isEditing ? "green" : "blue.600"}
                  width="full"
                  onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
                  isDisabled={isEditing && !isFormValid()}
                  transition="bg 300ms"
                  _hover={{ bg: isEditing ? "green.700" : "blue.700" }}
                >
                  {isEditing ? "Submit" : "Edit"}
                </Button>
                {isEditing && (
                  <Button
                    color="red.600"
                    bg="transparent"
                    border="1px solid"
                    borderColor="red.600"
                    width="120px"
                    onClick={handleCancel}
                    transition="bg 300ms"
                    _hover={{ bg: "red.50" }}
                  >
                    Cancel
                  </Button>
                )}
              </Flex>
            </VStack>
          </Box>
          <Box w="25%" h="650px">
            <Flex
              direction="column"
              justify="space-around"
              alignItems="end"
              gap={10}
            >
              <Box
                p={6}
                w="270px"
                h="270px"
                rounded="2xl"
                boxShadow="md"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                mt={8}
                mr={4}
                bg="#E7E0E2"
              >
                <Icon
                  as={FaHeartbeat}
                  boxSize="32"
                  color="red.600"
                  mb={2}
                  transition="color 0.3s"
                  _hover={{ color: "red.500" }}
                />
                <Text
                  fontWeight="bold"
                  fontSize="lg"
                  fontFamily="heading"
                  fontStyle="italic"
                  color="gray.500"
                >
                  HEALTH SCORE
                </Text>
                <Text mt={2} fontSize="lg" color="red.600" fontWeight="bold">
                  11
                </Text>
              </Box>
              <Box
                p={6}
                w="270px"
                h="270px"
                rounded="2xl"
                boxShadow="md"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                mr={4}
                bg="#E7E0E2"
              >
                <Icon
                  as={FaFire}
                  boxSize="32"
                  color="orange.400"
                  mb={2}
                  transition="color 0.3s"
                  _hover={{ color: "yellow.600" }}
                />
                <Text
                  fontWeight="bold"
                  fontFamily="heading"
                  fontStyle="italic"
                  fontSize="lg"
                  color="gray.500"
                >
                  MAX STREAK
                </Text>
                <Text mt={2} fontSize="lg" color="orange.400" fontWeight="bold">
                  {maxStreak}
                </Text>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default ProfilePage;

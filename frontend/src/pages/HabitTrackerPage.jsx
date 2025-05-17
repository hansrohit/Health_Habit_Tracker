import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { getScore, habitInput } from "../services/api";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  updateHabitData,
  clearHabitData,
} from "../state/slice/habitTrackerSlice";
import { fetchUserProfile } from "../state/slice/profileSlice";
import { updateProfile } from "../state/slice/authSlice";
const TrackerPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { userToken } = useSelector((state) => state.auth);

  let user = null;
  if (userInfo) {
    user = userInfo.user.id;
  }
  // console.log(user);

  const [sleep, setSleep] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [meals, setMeals] = useState([{ meal: "", calorie: "" }]);
  const [workouts, setWorkouts] = useState([
    { workout: "", time: "", calorieBurnt: "" },
  ]);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const toast = useToast();

  useEffect(() => {
    validateForm();
  }, [sleep, waterIntake, meals, workouts]);

  const validateForm = () => {
    const isMealInvalid = meals.some(
      (meal) => (meal.meal && !meal.calorie) || (!meal.meal && meal.calorie)
    );
    const isWorkoutInvalid = workouts.some(
      (workout) =>
        (workout.workout && (!workout.time || !workout.calorieBurnt)) ||
        (!workout.workout && (workout.time || workout.calorieBurnt))
    );
    if (isMealInvalid || isWorkoutInvalid) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
  };

  const handleMealChange = (index, field, value) => {
    const updatedMeals = [...meals];
    updatedMeals[index][field] = value;
    setMeals(updatedMeals);
  };

  const handleWorkoutChange = (index, field, value) => {
    const updatedWorkouts = [...workouts];
    updatedWorkouts[index][field] = value;
    setWorkouts(updatedWorkouts);
  };

  const addMeal = () => {
    setMeals([...meals, { meal: "", calorie: "" }]);
  };

  const deleteMeal = (index) => {
    const updatedMeals = meals.filter((_, i) => i !== index);
    setMeals(updatedMeals);
  };

  const addWorkout = () => {
    setWorkouts([...workouts, { workout: "", time: "", calorieBurnt: "" }]);
  };

  const deleteWorkout = (index) => {
    const updatedWorkouts = workouts.filter((_, i) => i !== index);
    setWorkouts(updatedWorkouts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      sleep,
      waterIntake,
      meals: meals.filter((m) => m.meal && m.calorie),
      workouts: workouts.filter((w) => w.workout && w.time && w.calorieBurnt),
    };
    console.log("formDate 2.O", formData);
    try {
      const response = await habitInput(formData, user);
      const updatedDataToSlice = {
        currentStreak: response.user.currentStreak,
        maxStreak: response.user.maxStreak,
        lastHabitDate: response.user.lastHabitDate,
      };
      console.log(response);
      const scoreRes = await getScore(userToken);
      console.log("score response data: ", scoreRes);

      if (
        response.message === "Habit data cleared for today. Streak decreased."
      ) {
        dispatch(clearHabitData());
        // dispatch(updateProfile(updatedDataToSlice));
        // dispatch(fetchUserProfile());
      } else if (
        response.message === "Habit data updated successfully" ||
        response.message === "Habit data added successfully and streak updated"
      ) {
        dispatch(updateHabitData(formData));
      }
      dispatch(fetchUserProfile());
      dispatch(updateProfile(updatedDataToSlice));
      toast({
        title: response.message,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
        containerStyle: {
          marginBottom: "30px",
          marginRight: "30px",
        },
        icon: "✅",
      });
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={10}
      px={4}
    >
      <Box
        bg="#F5F5F5"
        p={8}
        borderRadius="lg"
        boxShadow="xl"
        maxW="2xl"
        width="full"
      >
        <VStack spacing={6} width="full">
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Track Your Daily Habit
          </Text>

          {/* Sleep */}
          <FormControl>
            <HStack spacing={4} align="center">
              <FormLabel mb="0" color="gray.700" minW="140px">
                Sleep (hrs):
              </FormLabel>
              <Input
                type="number"
                placeholder="Enter hours"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                width="220px"
                size="md"
                focusBorderColor="gray.600"
                borderColor="gray.600"
                borderRadius="md"
                color="black"
                bg="white"
                _hover={{ borderColor: "gray.600" }}
                _placeholder={{ color: "gray.500" }}
              />
            </HStack>
          </FormControl>

          {/* Water Intake */}
          <FormControl>
            <HStack spacing={4} align="center">
              <FormLabel mb="0" color="gray.700" minW="140px">
                Water Intake (L):
              </FormLabel>
              <Input
                type="number"
                placeholder="Enter in liters"
                value={waterIntake}
                onChange={(e) => setWaterIntake(e.target.value)}
                width="220px"
                size="md"
                focusBorderColor="gray.600"
                borderColor="gray.600"
                borderRadius="md"
                color="black"
                bg="white"
                _hover={{ borderColor: "gray.600" }}
                _placeholder={{ color: "gray.500" }}
              />
            </HStack>
          </FormControl>

          {/* Meals */}
          <Box width="full">
            <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={2}>
              Meals
            </Text>
            {meals.map((meal, index) => (
              <FormControl key={index} mb={4}>
                <HStack spacing={3} align="center">
                  <FormLabel mb="0" color="gray.700" minW="70px">
                    Meal {index + 1} :
                  </FormLabel>
                  <Input
                    placeholder="Meal Name"
                    value={meal.meal}
                    onChange={(e) =>
                      handleMealChange(index, "meal", e.target.value)
                    }
                    size="md"
                    width="180px"
                    focusBorderColor="gray.600"
                    borderColor="gray.600"
                    borderRadius="md"
                    color="black"
                    bg="white"
                    _hover={{ borderColor: "gray.600" }}
                    _placeholder={{ color: "gray.500" }}
                  />
                  <Input
                    type="number"
                    placeholder="Calories"
                    value={meal.calorie}
                    onChange={(e) =>
                      handleMealChange(index, "calorie", e.target.value)
                    }
                    size="md"
                    width="150px"
                    focusBorderColor="gray.600"
                    borderColor="gray.600"
                    borderRadius="md"
                    color="black"
                    bg="white"
                    _hover={{ borderColor: "gray.600" }}
                    _placeholder={{ color: "gray.500" }}
                  />
                  {index > 0 && (
                    <Button
                      size="sm"
                      width="70px"
                      bg="red.500"
                      color="white"
                      onClick={() => deleteMeal(index)}
                      _hover={{ bg: "red.600" }}
                      borderRadius="md"
                    >
                      Delete
                    </Button>
                  )}
                </HStack>
              </FormControl>
            ))}
            <Button
              mt={2}
              onClick={addMeal}
              bg="#4169E1"
              color="white"
              _hover={{ bg: "#0056b3" }}
              size="sm"
              borderRadius="md"
            >
              Add Meal
            </Button>
          </Box>

          {/* Workouts */}
          <Box width="full">
            <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={2}>
              Workouts
            </Text>
            {workouts.map((workout, index) => (
              <Box key={index} mb={4}>
                <Text fontWeight="medium" mb={1}>
                  Workout {index + 1}
                </Text>
                <HStack spacing={3}>
                  <Input
                    placeholder="Workout Name"
                    value={workout.workout}
                    onChange={(e) =>
                      handleWorkoutChange(index, "workout", e.target.value)
                    }
                    size="md"
                    width="180px"
                    focusBorderColor="gray.600"
                    borderColor="gray.600"
                    borderRadius="md"
                    color="black"
                    bg="white"
                    _hover={{ borderColor: "gray.600" }}
                    _placeholder={{ color: "gray.500" }}
                  />
                  <Input
                    type="number"
                    placeholder="Time (min)"
                    value={workout.time}
                    onChange={(e) =>
                      handleWorkoutChange(index, "time", e.target.value)
                    }
                    size="md"
                    width="120px"
                    focusBorderColor="gray.600"
                    borderColor="gray.600"
                    borderRadius="md"
                    color="black"
                    bg="white"
                    _hover={{ borderColor: "gray.600" }}
                    _placeholder={{ color: "gray.500" }}
                  />
                  <Input
                    type="number"
                    placeholder="Calories Burnt"
                    value={workout.calorieBurnt}
                    onChange={(e) =>
                      handleWorkoutChange(index, "calorieBurnt", e.target.value)
                    }
                    size="md"
                    width="150px"
                    focusBorderColor="gray.600"
                    borderColor="gray.600"
                    borderRadius="md"
                    color="black"
                    bg="white"
                    _hover={{ borderColor: "gray.600" }}
                    _placeholder={{ color: "gray.500" }}
                  />
                  {index > 0 && (
                    <Button
                      size="sm"
                      width="70px"
                      bg="red.500"
                      color="white"
                      onClick={() => deleteWorkout(index)}
                      _hover={{ bg: "red.600" }}
                      borderRadius="md"
                    >
                      Delete
                    </Button>
                  )}
                </HStack>
              </Box>
            ))}
            <Button
              mt={2}
              onClick={addWorkout}
              bg="#4169E1"
              color="white"
              _hover={{ bg: "#0056b3" }}
              size="sm"
              borderRadius="md"
            >
              Add Workout
            </Button>
          </Box>

          <Button
            width="full"
            bg="#4169E1"
            color="white"
            _hover={{ bg: "#0056b3" }}
            onClick={handleSubmit}
            borderRadius="md"
            isDisabled={isSubmitDisabled}
          >
            Submit
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default TrackerPage;

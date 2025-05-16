import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import { FaBed, FaTint, FaDumbbell, FaUtensils } from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { getWeeklyHabits, getSuggestion } from "../services/api";
import { useState } from "react";

const todayHabit = (sleepVal, waterVal, workCal, mealCal) => {
  const todayData = [
    { icon: FaBed, label: "Sleep", value: sleepVal + " hrs" },
    { icon: FaTint, label: "Water", value: waterVal + " L" },
    { icon: FaDumbbell, label: "Workout", value: workCal + " cal" },
    { icon: FaUtensils, label: "Meals", value: mealCal + " cal" },
  ];
  return todayData;
};

const generateWeeklyChart = (data) => {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayDayIndex = new Date().getDay();
  const chartData = weekdays
    .slice(0, todayDayIndex + 1)
    .map((day) => ({ name: day, sleep: 0, water: 0, meals: 0, workout: 0 }));

  if (data === undefined || data === null || data.length === 0)
    return chartData;
  data.forEach((entry) => {
    const entryDate = new Date(entry.date);
    const dayIndex = entryDate.getDay();

    if (dayIndex > todayDayIndex) return chartData;

    const dayName = weekdays[dayIndex];
    const chartEntry = chartData.find((d) => d.name === dayName);
    if (!chartEntry) return chartData;

    chartEntry.sleep = entry.sleep || 0;
    chartEntry.water = entry.water || 0;

    chartEntry.meals = Array.isArray(entry.meals)
      ? entry.meals.reduce((sum, m) => sum + (m.calorie || 0), 0)
      : 0;

    chartEntry.workout = Array.isArray(entry.workout)
      ? entry.workout.reduce((sum, w) => sum + (w.calorieBurnt || 0), 0)
      : 0;
  });

  return chartData;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { userToken } = useSelector((state) => state.auth);
  const { sleep } = useSelector((state) => state.habitTracker);
  const { waterIntake } = useSelector((state) => state.habitTracker);
  const { meals } = useSelector((state) => state.habitTracker);
  const { workouts } = useSelector((state) => state.habitTracker);
  const [weeklyData, setWeeklyData] = useState([]);
  const [suggestion, setSuggestions] = useState("");
  const handleSuggestion = async () => {
    console.log(userToken);

    const response = await getSuggestion(userToken);
    console.log("response: ", response);

    setSuggestions(response.suggestion);
  };
  let sleepVal = sleep !== "" ? sleep : 0;
  let waterVal = waterIntake !== "" ? waterIntake : 0;
  let mealCal = 0;
  if (meals.length > 0) {
    for (let index = 0; index < meals.length; index++) {
      mealCal += Number(meals[index].calorie);
    }
  }
  let workCal = 0;
  if (workouts.length > 0) {
    for (let index = 0; index < workouts.length; index++) {
      workCal += Number(workouts[index].calorieBurnt);
    }
  }
  const today = todayHabit(sleepVal, waterVal, workCal, mealCal);

  let userId = null;
  if (userInfo) {
    if (
      userInfo.user !== null &&
      userInfo.user !== undefined &&
      userInfo.user !== ""
    ) {
      if (userInfo.user.id) {
        userId = userInfo.user.id;
      }
    }
  }

  useEffect(() => {
    const weeklyDetails = async () => {
      try {
        const weeklyRes = await getWeeklyHabits(userId);
        console.log(weeklyRes);
        console.log("hiii: ", weeklyRes.data.habits);
        if (!weeklyRes.data.habits || !Array.isArray(weeklyRes.data.habits)) {
          setWeeklyData([{ meals: 0, sleep: 0, water: 0, workout: 0 }]); // set empty chart data if no habits
          return;
        }
        const newData = generateWeeklyChart(weeklyRes.data.habits);

        setWeeklyData(newData);
        console.log(weeklyData);
      } catch (err) {
        console.log("err in useEffect: ", err);
        setWeeklyData([{ meals: 0, sleep: 0, water: 0, workout: 0 }]); // fallback for error
      }
    };
    weeklyDetails();
  }, [sleepVal, waterVal, mealCal, workCal]);
  return (
    <Box p={5} bg="blue.50" minH="100vh">
      <Flex
        justify="space-between"
        align="center"
        bg="white"
        p={4}
        rounded="xl"
        mb={8}
        boxShadow="md"
      >
        <Heading size="md" color="blue.700">
          Post your Habits here
        </Heading>
        <Button colorScheme="blue" onClick={() => navigate("/tracker")}>
          Post
        </Button>
      </Flex>

      <VStack align="start" spacing={4} mb={10}>
        <Heading size="lg" color="blue.700">
          Today
        </Heading>
        <Flex justify="space-between" gap="85px" wrap="wrap" ml="16">
          {today.map((item, index) => (
            <Box
              key={index}
              bg="white"
              p={6}
              w="200px"
              h="200px"
              rounded="2xl"
              boxShadow="md"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={item.icon} boxSize={12} color="blue.400" mb={3} />
              <Text fontWeight="bold" fontSize="lg" color="blue.700">
                {item.label}
              </Text>
              <Text mt={2} fontSize="md" color="gray.600">
                {item.value}
              </Text>
            </Box>
          ))}
        </Flex>
      </VStack>

      <VStack align="start" spacing={4}>
        <Heading size="lg" color="blue.700" mb={4}>
          Weekly Charts
        </Heading>

        <Flex wrap="wrap" gap={8} justify="center">
          <Box
            bg="white"
            p={6}
            rounded="2xl"
            boxShadow="md"
            w="350px"
            h="300px"
          >
            <Text fontWeight="bold" color="blue.700" mb={4}>
              Sleep (hrs)
            </Text>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sleep"
                  stroke="#3182ce"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <Box
            bg="white"
            p={6}
            rounded="2xl"
            boxShadow="md"
            w="350px"
            h="300px"
          >
            <Text fontWeight="bold" color="blue.700" mb={4}>
              Water Intake (L)
            </Text>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="water" fill="#3182ce" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box
            bg="white"
            p={6}
            rounded="2xl"
            boxShadow="md"
            w="350px"
            h="300px"
          >
            <Text fontWeight="bold" color="blue.700" mb={4}>
              Meals (Calorie Intake)
            </Text>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="meals" fill="#63b3ed" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box
            bg="white"
            p={6}
            rounded="2xl"
            boxShadow="md"
            w="350px"
            h="300px"
          >
            <Text fontWeight="bold" color="blue.700" mb={4}>
              Workout (Calories Burnt)
            </Text>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="workout" fill="#4299e1" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Flex>
      </VStack>
      <Flex
        mt={6}
        bg="white"
        shadow="md"
        minHeight={suggestion ? "385px" : "73px"}
        borderRadius="2xl"
        justify={suggestion ? "start" : "center"}
        alignItems="start"
        direction="column"
        pr={10}
        pl={10}
        pt={suggestion ? 5 : 0}
        gap={4}
      >
        <Flex
          justify="space-between"
          alignItems="center"
          direction="row"
          // bg="red"
          w="full"
          h="auto"
          // pl={"8"}
          borderRadius="xl"
        >
          <Text
            color="blue.700"
            fontFamily="heading"
            fontSize={18}
            fontWeight="bold"
          >
            Get Your AI health Suggestion for free!
          </Text>
          <Button
            color="whitesmoke"
            bg="blue.500"
            // border="1px solid"
            // borderColor="green"
            _hover={{ bg: "blue.600", color: "white" }}
            fontFamily="heading"
            fontWeight="bold"
            onClick={handleSuggestion}
          >
            Get Suggestion
          </Button>
        </Flex>
        {suggestion && (
          <Flex
            w="full"
            minH="280px"
            bg="whitesmoke"
            borderRadius="xl"
            justify="center"
          >
            <Box w="95%" mt={1} h="270px" overflowY="auto" pr={3}>
              {/* <Text textAlign="justify" whiteSpace="pre-line">
                {suggestion}
              </Text> */}
              <ReactMarkdown
                components={{
                  p: (props) => (
                    <Text
                      textAlign="justify"
                      whiteSpace="pre-line"
                      {...props}
                    />
                  ),
                  strong: (props) => (
                    <Text as="span" fontWeight="bold" {...props} />
                  ),
                }}
              >
                {suggestion}
              </ReactMarkdown>
            </Box>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default Dashboard;

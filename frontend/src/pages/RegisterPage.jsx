import React, { useState } from "react";
import { registerUser } from "../services/api";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Switch,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    weight: "",
    height: "",
    goals: "",
    reminderTime: "",
    reminderEnabled: false,
  });

  const isEmailValid = (email) => {
    return email.includes("@gmail.com");
  };

  // const convertTo24HourFormat = (time) => {
  //   const [hours, minutes] = time.split(":");
  //   const date = new Date();
  //   date.setHours(hours, minutes);
  //   return date.toTimeString().slice(0, 5);
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    console.log(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    if (!isEmailValid(formData.email)) {
      return alert("Please enter a valid Gmail address.");
    }

    if (!formData.reminderEnabled) {
      formData.reminderTime = "";
    }

    if (formData.reminderEnabled && !formData.reminderTime) {
      return alert("Please enter a valid reminder time.");
    }

    // if (formData.reminderTime) {
    //   console.log(formData.reminderTime);

    //   formData.reminderTime = convertTo24HourFormat(formData.reminderTime);
    //   console.log(formData.reminderTime);
    // }

    try {
      await registerUser(formData);

      toast({
        title: "Registration Successful!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });

      navigate("/login");
    } catch (error) {
      console.error(error);

      toast({
        title: error.response?.data?.message || "Registration Failed",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }

    console.log(formData);
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.password &&
      formData.age &&
      formData.weight &&
      formData.height &&
      (!formData.reminderEnabled || formData.reminderTime)
    );
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={10}
    >
      <Box
        bg="#F5F5F5"
        p={8}
        borderRadius="lg"
        boxShadow="xl"
        maxW="md"
        width="full"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <VStack spacing={4} width="full">
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Create Your Account
          </Text>

          <FormControl isRequired>
            <FormLabel color="gray.700">Name</FormLabel>
            <Input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              focusBorderColor="gray.600"
              borderColor="gray.600"
              color="black"
              bg="transparent"
              _placeholder={{ color: "gray.600" }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="gray.700">Email</FormLabel>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              focusBorderColor="gray.600"
              borderColor="gray.600"
              color="black"
              bg="transparent"
              _placeholder={{ color: "gray.600" }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="gray.700">Password</FormLabel>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              focusBorderColor="gray.600"
              borderColor="gray.600"
              color="black"
              bg="transparent"
              _placeholder={{ color: "gray.600" }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="gray.700">Age</FormLabel>
            <Input
              type="number"
              name="age"
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleChange}
              focusBorderColor="gray.600"
              borderColor="gray.600"
              color="black"
              bg="transparent"
              _placeholder={{ color: "gray.600" }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="gray.700">Weight</FormLabel>
            <Input
              type="number"
              name="weight"
              placeholder="Enter your weight"
              value={formData.weight}
              onChange={handleChange}
              focusBorderColor="gray.600"
              borderColor="gray.600"
              color="black"
              bg="transparent"
              _placeholder={{ color: "gray.600" }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="gray.700">Height</FormLabel>
            <Input
              type="number"
              name="height"
              placeholder="Enter your height"
              value={formData.height}
              onChange={handleChange}
              focusBorderColor="gray.600"
              borderColor="gray.600"
              color="black"
              bg="transparent"
              _placeholder={{ color: "gray.600" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel color="gray.700">Goals</FormLabel>
            <Input
              type="text"
              name="goals"
              placeholder="Enter your health goals"
              value={formData.goals}
              onChange={handleChange}
              focusBorderColor="gray.600"
              borderColor="gray.600"
              color="black"
              bg="transparent"
              _placeholder={{ color: "gray.600" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel color="gray.700">Reminder Time</FormLabel>
            <Input
              type="time"
              name="reminderTime"
              value={formData.reminderTime || ""}
              onChange={handleChange}
              disabled={!formData.reminderEnabled}
              focusBorderColor="gray.600"
              borderColor="gray.600"
              color="black"
              bg="transparent"
              _placeholder={{ color: "gray.600" }}
            />
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel color="gray.700" mb="0">
              Enable Reminders
            </FormLabel>
            <Switch
              name="reminderEnabled"
              isChecked={formData.reminderEnabled}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  reminderEnabled: !prev.reminderEnabled,
                  reminderTime: "",
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

          <Button
            bg="	#4169E1"
            color="white"
            _hover={{ bg: "#0056b3" }}
            width="full"
            onClick={handleSubmit}
            isDisabled={!isFormValid()}
          >
            Sign Up
          </Button>

          <Text color="gray.700">
            Already have an account?{" "}
            <Button
              variant="link"
              onClick={() => navigate("/login")}
              color="#4169E1"
              fontWeight="bold"
            >
              Login here
            </Button>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default RegisterPage;

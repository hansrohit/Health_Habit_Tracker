import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../state/slice/authSlice";
import { loginUser, getProfile } from "../services/api";
import { fetchUserProfile } from "../state/slice/profileSlice";
const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const isEmailValid = (email) => {
    return email.includes("@gmail.com");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailValid(formData.email)) {
      return alert("Please enter a valid Gmail address.");
    }

    dispatch(loginStart());

    try {
      const response = await loginUser(formData.email, formData.password);
      console.log(response);
      const profile = await getProfile(response.accessToken);
      console.log(profile);

      dispatch(
        loginSuccess({
          user: profile,
          token: response.accessToken,
          refreshToken: response.refreshToken,
        })
      );

      dispatch(fetchUserProfile());
      toast({
        title: "Logged in successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });

      navigate("/");
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.message || "Login failed"));

      toast({
        title: "Login failed!",
        description: error.response?.data?.message || "Invalid credentials",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const isFormValid = () => {
    return formData.email && formData.password;
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
            Login to Your Account
          </Text>

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

          <Button
            bg="#4169E1"
            color="white"
            _hover={{ bg: "#0056b3" }}
            width="full"
            onClick={handleSubmit}
            isDisabled={!isFormValid()}
          >
            Login
          </Button>

          <Text color="gray.700">
            Don't have an account?{" "}
            <Button
              variant="link"
              onClick={() => navigate("/register")}
              color="#4169E1"
              fontWeight="bold"
            >
              Register here
            </Button>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default LoginPage;

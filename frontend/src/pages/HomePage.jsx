import img1 from "../assets/img/img1.webp";
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Link,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const HomePage = () => {
  return (
    <Box bg="gray.50" minH="100vh" pt="1">
      <Box
        textAlign="center"
        w="auto"
        h="100vh"
        mb="10"
        px="4"
        bg="blue.200"
        py="16"
      >
        <Image
          src={img1}
          alt="Health Tracker Hero"
          borderRadius="xl"
          mx="auto"
          maxH="400px"
          objectFit="cover"
        />
        <Heading mt="6" fontSize="2xl" color="blue.600">
          Eat. Sleep. Work. Track your Health
        </Heading>
      </Box>

      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacing="8"
        px={{ base: 6, md: 16 }}
        mb="16"
      >
        <Box
          p="6"
          bg="white"
          rounded="xl"
          shadow="md"
          _hover={{ shadow: "lg" }}
        >
          <Heading fontSize="xl" mb="2" color="blue.500">
            Profile
          </Heading>
          <Text>Create, manage, and update your profile.</Text>
        </Box>

        <Box
          p="6"
          bg="white"
          rounded="xl"
          shadow="md"
          _hover={{ shadow: "lg" }}
        >
          <Heading fontSize="xl" mb="2" color="blue.500">
            <RouterLink to="/tracker">Dashboard</RouterLink>
          </Heading>
          <Text>view your progress daily and weekly logs.</Text>
        </Box>

        <Box
          p="6"
          bg="white"
          rounded="xl"
          shadow="md"
          _hover={{ shadow: "lg" }}
        >
          <Heading fontSize="xl" mb="2" color="blue.500">
            <RouterLink to="/tracker">Track</RouterLink>
          </Heading>
          <Text>Streak rewarded for consistency.</Text>
        </Box>

        <Box
          p="6"
          bg="white"
          rounded="xl"
          shadow="md"
          _hover={{ shadow: "lg" }}
        >
          <Heading fontSize="xl" mb="2" color="blue.500">
            Reminders & Suggestions
          </Heading>
          <Text>Get notified if needed + AI predictions.</Text>
        </Box>
      </SimpleGrid>

      <Flex
        justify="space-between"
        align="center"
        bg="gray.100"
        p="4"
        fontSize="sm"
        color="gray.600"
      >
        <Text>© 2025 HealthTracker. All rights reserved.</Text>
        <Flex gap="4">
          <Link as={RouterLink} to="/" _hover={{ textDecoration: "underline" }}>
            Privacy Policy
          </Link>
          <Link as={RouterLink} to="/" _hover={{ textDecoration: "underline" }}>
            Terms
          </Link>
          <Link as={RouterLink} to="/" _hover={{ textDecoration: "underline" }}>
            Contact
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};

export default HomePage;

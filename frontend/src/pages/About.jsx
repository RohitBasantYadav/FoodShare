import {
  Container,
  Box,
  Heading,
  Text,
  SimpleGrid,
  Image,
  Flex,
  Icon,
  Divider,
  Button,
  Link,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { FaHandsHelping, FaUtensils, FaUsers, FaHeart, FaLeaf, FaCheckCircle } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const About = () => {
  return (
    <Container maxW="container.xl" py={8}>
      {/* Hero Section */}
      <Box textAlign="center" mb={12}>
        <Heading
          as="h1"
          size="2xl"
          mb={4}
          bgGradient="linear(to-r, green.400, green.600)"
          bgClip="text"
        >
          About FoodShare
        </Heading>
        <Text fontSize="xl" maxW="3xl" mx="auto" color="gray.600">
          A community-driven platform connecting those with excess food to those in need,
          reducing waste and fighting hunger together.
        </Text>
      </Box>

      {/* Mission Section */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} mb={16}>
        <Box>
          <Heading as="h2" size="xl" mb={4} color="green.600">
            Our Mission
          </Heading>
          <Text fontSize="lg" mb={4}>
            FoodShare was created with a simple yet powerful mission: to reduce food waste
            while addressing food insecurity in our communities.
          </Text>
          <Text fontSize="lg" mb={4}>
            Every day, tons of perfectly good food goes to waste while many people struggle
            to put meals on the table. We believe technology can help bridge this gap by
            connecting those who have excess food with those who need it most.
          </Text>
          <Text fontSize="lg">
            Through our platform, we empower individuals, restaurants, grocery stores, and
            other businesses to donate their surplus food directly to community members in need.
          </Text>
        </Box>
        <Flex justifyContent="center" alignItems="center">
          <Image
            src="https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80"
            alt="People sharing food"
            borderRadius="lg"
            objectFit="cover"
            maxH="400px"
            shadow="lg"
          />
        </Flex>
      </SimpleGrid>

      {/* How It Works Section */}
      <Box mb={16}>
        <Heading as="h2" size="xl" mb={6} textAlign="center" color="green.600">
          How FoodShare Works
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          <Box textAlign="center" p={5}>
            <Icon as={FaUtensils} w={12} h={12} color="green.500" mb={4} />
            <Heading as="h3" size="md" mb={3}>
              Post Donations or Requests
            </Heading>
            <Text>
              Share what food you have to give or what you need. Include details like quantity,
              expiration date, and pickup location.
            </Text>
          </Box>
          <Box textAlign="center" p={5}>
            <Icon as={FaUsers} w={12} h={12} color="green.500" mb={4} />
            <Heading as="h3" size="md" mb={3}>
              Connect Locally
            </Heading>
            <Text>
              Find food donations or requests in your area using our interactive map.
              Message directly with other users to coordinate.
            </Text>
          </Box>
          <Box textAlign="center" p={5}>
            <Icon as={FaHandsHelping} w={12} h={12} color="green.500" mb={4} />
            <Heading as="h3" size="md" mb={3}>
              Make the Exchange
            </Heading>
            <Text>
              Meet safely to exchange food items. After completion, leave feedback to
              build trust in our community.
            </Text>
          </Box>
        </SimpleGrid>
      </Box>

      <Divider mb={16} />

      {/* Impact Section */}
      <Box mb={16}>
        <Heading as="h2" size="xl" mb={6} textAlign="center" color="green.600">
          Our Impact
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Box>
            <List spacing={4}>
              <ListItem display="flex">
                <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                <Text fontSize="lg">
                  <strong>Reducing Food Waste:</strong> Redirecting perfectly good food from
                  landfills to people's plates.
                </Text>
              </ListItem>
              <ListItem display="flex">
                <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                <Text fontSize="lg">
                  <strong>Fighting Hunger:</strong> Providing immediate access to food for
                  those experiencing food insecurity.
                </Text>
              </ListItem>
              <ListItem display="flex">
                <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                <Text fontSize="lg">
                  <strong>Building Community:</strong> Creating meaningful connections between
                  neighbors through the act of sharing.
                </Text>
              </ListItem>
              <ListItem display="flex">
                <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                <Text fontSize="lg">
                  <strong>Environmental Benefits:</strong> Reducing greenhouse gas emissions
                  associated with food waste in landfills.
                </Text>
              </ListItem>
            </List>
          </Box>
          <Flex justifyContent="center" alignItems="center">
            <Image
              src="https://images.unsplash.com/photo-1488521787991-ed7bbafc3ceb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Community impact"
              borderRadius="lg"
              objectFit="cover"
              maxH="400px"
              shadow="lg"
            />
          </Flex>
        </SimpleGrid>
      </Box>

      {/* Join Us Section */}
      <Box textAlign="center" mb={12} p={8} bg="green.50" borderRadius="lg">
        <Icon as={FaHeart} w={12} h={12} color="green.500" mb={4} />
        <Heading as="h2" size="xl" mb={4} color="green.600">
          Join Our Community
        </Heading>
        <Text fontSize="lg" mb={6} maxW="3xl" mx="auto">
          Whether you have food to share or are in need, FoodShare welcomes you.
          Together, we can build a more sustainable and caring world.
        </Text>
        <Flex justifyContent="center" gap={4} flexWrap="wrap">
          <Button
            as={RouterLink}
            to="/register"
            colorScheme="green"
            size="lg"
            leftIcon={<FaUsers />}
          >
            Sign Up
          </Button>
          <Button
            as={RouterLink}
            to="/"
            colorScheme="green"
            variant="outline"
            size="lg"
            leftIcon={<FaLeaf />}
          >
            Explore Shares
          </Button>
        </Flex>
      </Box>

      {/* Contact Info */}
      <Box textAlign="center">
        <Heading as="h3" size="md" mb={3} color="green.600">
          Questions or Suggestions?
        </Heading>
        <Text mb={2}>
          Contact us at{' '}
          <Link href="mailto:contact@foodshare.org" color="green.500">
            contact@foodshare.org
          </Link>
        </Text>
        <Text fontSize="sm" color="gray.500">
          © {new Date().getFullYear()} FoodShare. All rights reserved.
        </Text>
      </Box>
    </Container>
  );
};

export default About; 
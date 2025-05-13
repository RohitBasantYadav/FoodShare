import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Grid,
  GridItem,
  Heading,
  Input,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from '@chakra-ui/react';
import { getStarRating } from '../utils/helpers';
import { updateProfile } from '../features/auth/authSlice';
import { getUserStats, getUserRatings } from '../features/users/userSlice';
import LoadingSpinner from '../components/layout/LoadingSpinner';

// Validation schema for profile form
const ProfileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  phone: Yup.string(),
  bio: Yup.string().max(200, 'Bio cannot exceed 200 characters'),
});

const Profile = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  const { userStats, ratings, isLoading: userLoading } = useSelector((state) => state.users);
  const [tabIndex, setTabIndex] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    dispatch(getUserStats());
    if (user?._id) {
      dispatch(getUserRatings({ userId: user._id }));
    }
  }, [dispatch, user]);

  // Generate avatar URL based on user's name
  useEffect(() => {
    if (user?.name) {
      // Format name for URL: replace spaces with + and remove special characters
      const formattedName = user.name
        .trim()
        .replace(/\s+/g, '+')
        .replace(/[^\w\s+]/g, '');
      
      setAvatarUrl(`https://avatar.iran.liara.run/username?username=${formattedName}`);
    } else {
      setAvatarUrl(null);
    }
  }, [user]);

  // Handle avatar load error
  const handleAvatarError = () => {
    setAvatarUrl(user?.profilePicture || null);
  };

  const handleProfileUpdate = async (values) => {
    await dispatch(updateProfile(values));
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  if (authLoading || userLoading || !user) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          My Profile
        </Heading>
        <Text color="gray.600">Manage your account and view your activity</Text>
      </Box>

      <Tabs 
        colorScheme="green" 
        index={tabIndex} 
        onChange={setTabIndex}
        variant="enclosed"
      >
        <TabList>
          <Tab fontWeight="semibold">Profile Info</Tab>
          <Tab fontWeight="semibold">My Stats</Tab>
          <Tab fontWeight="semibold">My Ratings</Tab>
        </TabList>

        <TabPanels>
          {/* Profile Info Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
              <GridItem colSpan={{ base: 1, md: 1 }}>
                <Flex direction="column" align="center" p={6} bg="white" boxShadow="sm" borderRadius="md">
                  <Avatar 
                    size="2xl" 
                    name={user.name} 
                    src={avatarUrl} 
                    mb={4} 
                    onError={handleAvatarError}
                  />
                  <Text fontWeight="bold" fontSize="xl">{user.name}</Text>
                  <Text color="gray.500" mb={2}>{user.email}</Text>
                  <Text>Joined {new Date(user.createdAt).toLocaleDateString()}</Text>
                  <Text mt={2} fontSize="lg">
                    Rating: {getStarRating(user.averageRating)} ({user.totalRatings})
                  </Text>
                </Flex>
              </GridItem>

              <GridItem colSpan={{ base: 1, md: 3 }}>
                <Box bg="white" p={6} boxShadow="sm" borderRadius="md">
                  <Heading as="h3" size="md" mb={6}>
                    Edit Profile Information
                  </Heading>

                  <Formik
                    initialValues={{
                      name: user.name || '',
                      phone: user.phone || '',
                      bio: user.bio || '',
                      // We could add location here as well
                    }}
                    validationSchema={ProfileSchema}
                    onSubmit={handleProfileUpdate}
                  >
                    {({ isSubmitting, errors, touched }) => (
                      <Form>
                        <Stack spacing={4}>
                          <Field name="name">
                            {({ field }) => (
                              <FormControl isInvalid={errors.name && touched.name}>
                                <FormLabel htmlFor="name">Full Name</FormLabel>
                                <Input
                                  {...field}
                                  id="name"
                                  placeholder="Enter your full name"
                                />
                                <FormErrorMessage>{errors.name}</FormErrorMessage>
                              </FormControl>
                            )}
                          </Field>

                          <Field name="phone">
                            {({ field }) => (
                              <FormControl isInvalid={errors.phone && touched.phone}>
                                <FormLabel htmlFor="phone">Phone</FormLabel>
                                <Input
                                  {...field}
                                  id="phone"
                                  placeholder="Enter your phone number"
                                />
                                <FormErrorMessage>{errors.phone}</FormErrorMessage>
                              </FormControl>
                            )}
                          </Field>

                          <Field name="bio">
                            {({ field }) => (
                              <FormControl isInvalid={errors.bio && touched.bio}>
                                <FormLabel htmlFor="bio">Bio</FormLabel>
                                <Input
                                  {...field}
                                  id="bio"
                                  placeholder="Tell something about yourself"
                                  as="textarea"
                                  rows={3}
                                />
                                <FormErrorMessage>{errors.bio}</FormErrorMessage>
                              </FormControl>
                            )}
                          </Field>

                          <Button
                            mt={4}
                            colorScheme="green"
                            isLoading={isSubmitting}
                            type="submit"
                          >
                            Save Changes
                          </Button>
                        </Stack>
                      </Form>
                    )}
                  </Formik>
                </Box>
              </GridItem>
            </Grid>
          </TabPanel>

          {/* Stats Tab */}
          <TabPanel>
            <Box bg="white" p={6} borderRadius="md" boxShadow="sm">
              <Heading as="h3" size="md" mb={6}>
                Activity Statistics
              </Heading>
              
              {userStats ? (
                <>
                  <StatGroup mb={6}>
                    <Stat>
                      <StatLabel>Donations Made</StatLabel>
                      <StatNumber>{userStats.donationsMade}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Donations Received</StatLabel>
                      <StatNumber>{userStats.donationsReceived}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Requests Made</StatLabel>
                      <StatNumber>{userStats.requestsMade}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Requests Fulfilled</StatLabel>
                      <StatNumber>{userStats.requestsFulfilled}</StatNumber>
                    </Stat>
                  </StatGroup>
                  
                  <Box>
                    <Heading as="h4" size="sm" mb={3}>
                      Recent Activity
                    </Heading>
                    {/* Here you would map through and display recent activities */}
                    <Text color="gray.500">Activity data would be displayed here</Text>
                  </Box>
                </>
              ) : (
                <Text>No statistics available</Text>
              )}
            </Box>
          </TabPanel>

          {/* Ratings Tab */}
          <TabPanel>
            <Box bg="white" p={6} borderRadius="md" boxShadow="sm">
              <Heading as="h3" size="md" mb={6}>
                My Ratings
              </Heading>
              
              {ratings && ratings.length > 0 ? (
                <Stack spacing={4}>
                  {/* Here you would map through and display ratings */}
                  <Text>Rating items would be displayed here</Text>
                </Stack>
              ) : (
                <Text color="gray.500">You have no ratings yet</Text>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default Profile; 
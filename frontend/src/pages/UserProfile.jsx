import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Avatar,
  Badge,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Button,
  Link,
  Stack,
} from '@chakra-ui/react';
import { getUserProfile, getUserRatings } from '../features/users/userSlice';
import { getPosts } from '../features/posts/postSlice';
import { getStarRating, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import { Link as RouterLink } from 'react-router-dom';

const UserProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { profile, ratings, isLoading } = useSelector((state) => state.users);
  const { posts } = useSelector((state) => state.posts);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(null);
  const [ratingAvatars, setRatingAvatars] = useState({});

  useEffect(() => {
    if (id) {
      dispatch(getUserProfile(id));
      dispatch(getUserRatings({ userId: id }));
      dispatch(getPosts({ user: id }));
    }
  }, [dispatch, id]);

  // Generate avatar URL for profile
  useEffect(() => {
    if (profile?.name) {
      const formattedName = profile.name
        .trim()
        .replace(/\s+/g, '+')
        .replace(/[^\w\s+]/g, '');
      
      setProfileAvatarUrl(`https://avatar.iran.liara.run/username?username=${formattedName}`);
    }
  }, [profile]);

  // Generate avatar URLs for ratings
  useEffect(() => {
    if (ratings && ratings.length > 0) {
      const avatarUrls = {};
      
      ratings.forEach(rating => {
        if (rating.giver?.name) {
          const formattedName = rating.giver.name
            .trim()
            .replace(/\s+/g, '+')
            .replace(/[^\w\s+]/g, '');
          
          avatarUrls[rating.giver._id] = `https://avatar.iran.liara.run/username?username=${formattedName}`;
        }
      });
      
      setRatingAvatars(avatarUrls);
    }
  }, [ratings]);

  // Handle avatar load error
  const handleAvatarError = () => {
    setProfileAvatarUrl(profile?.profilePicture || null);
  };

  // Handle rating avatar load error
  const handleRatingAvatarError = (userId) => {
    setRatingAvatars(prev => ({
      ...prev,
      [userId]: null
    }));
  };

  if (isLoading || !profile) {
    return <LoadingSpinner message="Loading user profile..." />;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
        <GridItem colSpan={{ base: 1, md: 1 }}>
          <Box p={6} bg="white" boxShadow="sm" borderRadius="md">
            <Flex direction="column" align="center">
              <Avatar 
                size="2xl" 
                name={profile.name} 
                src={profileAvatarUrl} 
                mb={4} 
                onError={handleAvatarError}
              />
              <Text fontWeight="bold" fontSize="xl">{profile.name}</Text>
              <Text color="gray.500" fontSize="sm" mb={3}>
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </Text>
              
              <Flex align="center" mb={3}>
                <Text fontWeight="bold" mr={2}>
                  {getStarRating(profile.averageRating)}
                </Text>
                <Text color="gray.500">({profile.totalRatings} ratings)</Text>
              </Flex>
              
              <Stack spacing={2} mb={4} w="100%">
                <Flex justify="space-between">
                  <Text>Donations Made:</Text>
                  <Text fontWeight="bold">{profile.donationsMade || 0}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text>Donations Received:</Text>
                  <Text fontWeight="bold">{profile.donationsReceived || 0}</Text>
                </Flex>
              </Stack>
              
              {profile.bio && (
                <Box mt={4} w="100%">
                  <Text fontWeight="bold" mb={1}>Bio:</Text>
                  <Text>{profile.bio}</Text>
                </Box>
              )}
            </Flex>
          </Box>
        </GridItem>

        <GridItem colSpan={{ base: 1, md: 3 }}>
          <Tabs colorScheme="green" variant="enclosed">
            <TabList>
              <Tab fontWeight="semibold">Posts</Tab>
              <Tab fontWeight="semibold">Ratings</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Box bg="white" p={6} borderRadius="md" boxShadow="sm">
                  <Heading as="h3" size="md" mb={6}>
                    {profile.name}'s Posts
                  </Heading>
                  
                  {posts && posts.length > 0 ? (
                    <Stack spacing={4}>
                      {posts.map(post => (
                        <Box 
                          key={post._id} 
                          p={4} 
                          borderWidth="1px" 
                          borderRadius="md"
                          _hover={{ shadow: 'md' }}
                        >
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Heading as="h4" size="sm">
                                <Link 
                                  as={RouterLink} 
                                  to={`/posts/${post._id}`}
                                  color="brand.600"
                                >
                                  {post.title}
                                </Link>
                              </Heading>
                              <Text color="gray.500" fontSize="sm">
                                {formatDate(post.createdAt)}
                              </Text>
                            </Box>
                            <Badge 
                              colorScheme={post.type === 'Donate' ? 'green' : 'orange'}
                            >
                              {post.type}
                            </Badge>
                          </Flex>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Text color="gray.500">No posts available</Text>
                  )}
                </Box>
              </TabPanel>

              <TabPanel>
                <Box bg="white" p={6} borderRadius="md" boxShadow="sm">
                  <Heading as="h3" size="md" mb={6}>
                    Ratings for {profile.name}
                  </Heading>
                  
                  {ratings && ratings.length > 0 ? (
                    <Stack spacing={4}>
                      {ratings.map(rating => (
                        <Box 
                          key={rating._id} 
                          p={4} 
                          borderWidth="1px" 
                          borderRadius="md"
                        >
                          <Flex justify="space-between" mb={2}>
                            <Flex align="center">
                              <Avatar 
                                size="sm" 
                                name={rating.giver?.name} 
                                src={ratingAvatars[rating.giver._id] || rating.giver?.profilePicture}
                                mr={2}
                                onError={() => handleRatingAvatarError(rating.giver._id)}
                              />
                              <Text fontWeight="bold">{rating.giver?.name}</Text>
                            </Flex>
                            <Text fontWeight="bold" color="orange.400">
                              {rating.score} ★
                            </Text>
                          </Flex>
                          
                          {rating.comment && (
                            <Text mt={1}>{rating.comment}</Text>
                          )}
                          
                          <Text fontSize="sm" color="gray.500" mt={2}>
                            {formatDate(rating.createdAt)}
                          </Text>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Text color="gray.500">No ratings available</Text>
                  )}
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default UserProfile; 
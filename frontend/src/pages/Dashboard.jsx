import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Heading, 
  Box, 
  Flex, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  Text, 
  Alert, 
  AlertIcon, 
  Button,
  Grid,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FaPlus, FaHistory, FaStar, FaExclamationTriangle } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { getUserStats, getUserHistory } from '../features/users/userSlice';
import LoadingSpinner from '../components/layout/LoadingSpinner';

// This is a simple dashboard placeholder. In a complete app, we would have components for
// displaying stats, history, and other user-specific data.

const Dashboard = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { userStats, userHistory, historyPagination, isLoading, error } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadAttempted(true);
        await Promise.all([
          dispatch(getUserStats()).unwrap(),
          dispatch(getUserHistory()).unwrap()
        ]);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        
        // Show toast for error
        toast({
          title: 'Error loading dashboard',
          description: 'Could not load your dashboard data. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    fetchDashboardData();
  }, [dispatch, retryCount, toast]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'green';
      case 'Claimed':
        return 'yellow';
      case 'PickedUp':
        return 'blue';
      case 'Completed':
        return 'purple';
      case 'Expired':
        return 'red';
      case 'Cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  // If loading and not yet attempted to load, show spinner
  if (isLoading && !loadAttempted) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  // If there was an error or missing data after loading attempt
  if ((error || !userStats) && loadAttempted) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading as="h1" size="xl" mb={2}>
            Welcome, {user?.name || 'User'}
          </Heading>
          <Heading as="h2" size="md" fontWeight="normal" color="gray.600">
            Your FoodShare Dashboard
          </Heading>
        </Box>
        
        <Alert status="error" mb={6}>
          <AlertIcon />
          <Box flex="1">
            <Text fontWeight="bold">Error loading dashboard data</Text>
            <Text fontSize="sm">{error || "Couldn't retrieve your dashboard information. The server might be unavailable."}</Text>
          </Box>
        </Alert>
        
        {/* Fallback content to show even when the API fails */}
        <Box mb={8} p={6} bg="white" shadow="md" borderRadius="lg">
          <Flex direction="column" align="center" textAlign="center">
            <Icon as={FaExclamationTriangle} boxSize={12} color="orange.500" mb={4} />
            <Heading size="md" mb={2}>We're having trouble loading your data</Heading>
            <Text mb={6}>In the meantime, you can still create new posts or browse existing ones.</Text>
            
            <Flex gap={4} wrap="wrap" justify="center">
              <Button
                as={RouterLink}
                to="/posts/create"
                colorScheme="green"
                leftIcon={<FaPlus />}
              >
                Create a Post
              </Button>
              <Button
                as={RouterLink}
                to="/"
                variant="outline"
                colorScheme="blue"
              >
                Browse Posts
              </Button>
              <Button 
                colorScheme="orange"
                onClick={handleRetry}
                ml={2}
              >
                Retry Loading
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Container>
    );
  }

  // Create fallback data if userStats is not available
  const stats = userStats || {
    donationsMade: 0,
    donationsReceived: 0,
    requestsMade: 0,
    requestsFulfilled: 0,
    averageRating: 0,
    totalRatings: 0,
    recentPosts: [],
    recentClaims: []
  };

  // Filter history items based on the active tab
  const getFilteredHistory = () => {
    if (!userHistory || !Array.isArray(userHistory)) return [];
    
    if (activeTab === 1) {
      // My Posts tab - show only posts created by the user
      return userHistory.filter(item => item.user._id === user?._id);
    } else if (activeTab === 2) {
      // My Claims tab - show only posts claimed by the user
      return userHistory.filter(item => item.claimedBy && item.claimedBy._id === user?._id);
    }
    
    return userHistory;
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          Welcome, {user?.name || 'User'}
        </Heading>
        <Heading as="h2" size="md" fontWeight="normal" color="gray.600">
          Your FoodShare Dashboard
        </Heading>
      </Box>

      <Tabs colorScheme="green" variant="enclosed" onChange={handleTabChange}>
        <TabList>
          <Tab fontWeight="semibold">Overview</Tab>
          <Tab fontWeight="semibold">My Posts</Tab>
          <Tab fontWeight="semibold">My Claims</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box>
              <Heading as="h3" size="lg" mb={4}>
                Your Stats
              </Heading>
              <Grid 
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
                gap={4} 
                mb={8}
              >
                <Box p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md" bg="white">
                  <Stat>
                    <StatLabel fontSize="lg">Donations Made</StatLabel>
                    <StatNumber fontSize="3xl" color="brand.500">{stats.donationsMade || 0}</StatNumber>
                  </Stat>
                </Box>
                <Box p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md" bg="white">
                  <Stat>
                    <StatLabel fontSize="lg">Donations Received</StatLabel>
                    <StatNumber fontSize="3xl" color="brand.500">{stats.donationsReceived || 0}</StatNumber>
                  </Stat>
                </Box>
                <Box p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md" bg="white">
                  <Stat>
                    <StatLabel fontSize="lg">Requests Made</StatLabel>
                    <StatNumber fontSize="3xl" color="brand.500">{stats.requestsMade || 0}</StatNumber>
                  </Stat>
                </Box>
                <Box p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md" bg="white">
                  <Stat>
                    <StatLabel fontSize="lg">Requests Fulfilled</StatLabel>
                    <StatNumber fontSize="3xl" color="brand.500">{stats.requestsFulfilled || 0}</StatNumber>
                  </Stat>
                </Box>
              </Grid>
              
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                {/* Recent Activity */}
                <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="white">
                  <Heading as="h4" size="md" mb={4} display="flex" alignItems="center">
                    <Icon as={FaHistory} mr={2} /> Recent Posts
                  </Heading>
                  
                  {stats.recentPosts && stats.recentPosts.length > 0 ? (
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Title</Th>
                          <Th>Type</Th>
                          <Th>Status</Th>
                          <Th>Date</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {stats.recentPosts.map((post) => (
                          <Tr key={post._id}>
                            <Td>
                              <Link as={RouterLink} to={`/posts/${post._id}`} color="brand.500">
                                {post.title}
                              </Link>
                            </Td>
                            <Td>{post.type}</Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(post.status)}>{post.status}</Badge>
                            </Td>
                            <Td>{formatDate(post.createdAt)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text color="gray.500">No recent posts yet.</Text>
                  )}
                  
                  <Button
                    as={RouterLink}
                    to="/posts/create"
                    size="sm"
                    colorScheme="green"
                    mt={4}
                    leftIcon={<FaPlus />}
                  >
                    Create New Post
                  </Button>
                </Box>
                
                {/* Recent Claims */}
                <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="white">
                  <Heading as="h4" size="md" mb={4} display="flex" alignItems="center">
                    <Icon as={FaStar} mr={2} /> Recent Claims
                  </Heading>
                  
                  {stats.recentClaims && stats.recentClaims.length > 0 ? (
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Title</Th>
                          <Th>Type</Th>
                          <Th>Status</Th>
                          <Th>Date Claimed</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {stats.recentClaims.map((post) => (
                          <Tr key={post._id}>
                            <Td>
                              <Link as={RouterLink} to={`/posts/${post._id}`} color="brand.500">
                                {post.title}
                              </Link>
                            </Td>
                            <Td>{post.type}</Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(post.status)}>{post.status}</Badge>
                            </Td>
                            <Td>{formatDate(post.claimedAt)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text color="gray.500">No claimed posts yet.</Text>
                  )}
                  
                  <Button
                    as={RouterLink}
                    to="/"
                    size="sm"
                    colorScheme="blue"
                    mt={4}
                  >
                    Browse Available Posts
                  </Button>
                </Box>
              </Grid>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading as="h3" size="lg">
                  My Posts
                </Heading>
                <Button
                  as={RouterLink}
                  to="/posts/create"
                  colorScheme="green"
                  size={{ base: "sm", md: "md" }}
                  leftIcon={<FaPlus />}
                >
                  Create Post
                </Button>
              </Flex>
              
              {isLoading ? (
                <LoadingSpinner size="md" message="Loading your posts..." />
              ) : getFilteredHistory().length > 0 ? (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Title</Th>
                        <Th>Type</Th>
                        <Th>Status</Th>
                        <Th>Created</Th>
                        <Th>Claimed By</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {getFilteredHistory().map((post) => (
                        <Tr key={post._id}>
                          <Td>
                            <Link as={RouterLink} to={`/posts/${post._id}`} color="brand.500" fontWeight="semibold">
                              {post.title}
                            </Link>
                          </Td>
                          <Td>{post.type}</Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(post.status)}>{post.status}</Badge>
                          </Td>
                          <Td>{formatDate(post.createdAt)}</Td>
                          <Td>
                            {post.claimedBy ? (
                              <Link as={RouterLink} to={`/users/${post.claimedBy._id}`}>
                                {post.claimedBy.name}
                              </Link>
                            ) : (
                              'Not claimed'
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Box p={10} textAlign="center" bg="gray.50" borderRadius="md">
                  <Text color="gray.500" mb={4}>You haven't created any posts yet.</Text>
                  <Button
                    as={RouterLink}
                    to="/posts/create"
                    colorScheme="green"
                    leftIcon={<FaPlus />}
                  >
                    Create Your First Post
                  </Button>
                </Box>
              )}
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading as="h3" size="lg">
                  My Claims
                </Heading>
                <Button
                  as={RouterLink}
                  to="/"
                  colorScheme="blue"
                  size={{ base: "sm", md: "md" }}
                >
                  Browse Posts
                </Button>
              </Flex>
              
              {isLoading ? (
                <LoadingSpinner size="md" message="Loading your claims..." />
              ) : getFilteredHistory().length > 0 ? (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Title</Th>
                        <Th>Type</Th>
                        <Th>Status</Th>
                        <Th>Date Claimed</Th>
                        <Th>Posted By</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {getFilteredHistory().map((post) => (
                        <Tr key={post._id}>
                          <Td>
                            <Link as={RouterLink} to={`/posts/${post._id}`} color="brand.500" fontWeight="semibold">
                              {post.title}
                            </Link>
                          </Td>
                          <Td>{post.type}</Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(post.status)}>{post.status}</Badge>
                          </Td>
                          <Td>{formatDate(post.claimedAt)}</Td>
                          <Td>
                            <Link as={RouterLink} to={`/users/${post.user._id}`}>
                              {post.user.name}
                            </Link>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Box p={10} textAlign="center" bg="gray.50" borderRadius="md">
                  <Text color="gray.500" mb={4}>You haven't claimed any posts yet.</Text>
                  <Button
                    as={RouterLink}
                    to="/"
                    colorScheme="blue"
                  >
                    Browse Available Posts
                  </Button>
                </Box>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default Dashboard; 
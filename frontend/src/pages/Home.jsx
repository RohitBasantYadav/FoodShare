import { useState, useEffect, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Flex, Spinner, Center, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { getPosts, getMapPosts, setFilters } from '../features/posts/postSlice';
import PostFilters from '../components/posts/PostFilters';
import PostList from '../components/posts/PostList';
import LoadingSpinner from '../components/layout/LoadingSpinner';

// Lazy load the MapView component
const MapView = lazy(() => import('../components/map/MapView'));

const Home = () => {
  const dispatch = useDispatch();
  const { posts, mapPosts, pagination, filters, isLoading, error } = useSelector((state) => state.posts);
  const [tabIndex, setTabIndex] = useState(0);
  const [loadMap, setLoadMap] = useState(false);

  // Fetch posts on initial load
  useEffect(() => {
    console.log('Initial load or filter changed, fetching posts with filters:', filters);
    dispatch(getPosts());
    
    // Only fetch map posts when map tab is active
    if (tabIndex === 1 || loadMap) {
      dispatch(getMapPosts(filters));
    }
  }, [dispatch, filters, tabIndex, loadMap]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    console.log('Filter change requested:', newFilters);
    dispatch(setFilters(newFilters));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    console.log('Page change requested:', page);
    dispatch(getPosts({ page }));
  };

  // Handle tab change
  const handleTabChange = (index) => {
    console.log('Tab changed to:', index);
    setTabIndex(index);
    // If switching to map tab, make sure we load map data
    if (index === 1) {
      setLoadMap(true);
      dispatch(getMapPosts(filters));
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="2xl" mb={2} color="brand.700">
          FoodShare
        </Heading>
        <Heading as="h2" size="md" fontWeight="normal" color="gray.600">
          Community Food Donation & Request Platform
        </Heading>
      </Box>

      <PostFilters filters={filters} onFilterChange={handleFilterChange} />
      
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <Tabs 
        isFitted 
        variant="enclosed" 
        mt={6}
        index={tabIndex} 
        onChange={handleTabChange}
        colorScheme="green"
        isLazy
      >
        <TabList mb="1em">
          <Tab fontWeight="semibold">List View</Tab>
          <Tab fontWeight="semibold">Map View</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel p={0} pt={4}>
            {isLoading ? (
              <LoadingSpinner />
            ) : posts.length > 0 ? (
              <PostList 
                posts={posts} 
                pagination={pagination} 
                onPageChange={handlePageChange} 
              />
            ) : (
              <Box p={10} textAlign="center" bg="gray.50" borderRadius="md">
                <Text fontSize="lg" mb={2}>No posts found</Text>
                <Text color="gray.600">
                  {filters.type || filters.status || filters.expiringSoon || (filters.lat && filters.lng)
                    ? "Try changing or resetting your filters"
                    : "There are no active posts yet"}
                </Text>
              </Box>
            )}
          </TabPanel>
          
          <TabPanel p={0} pt={4}>
            <Box 
              h={{ base: "60vh", md: "75vh", lg: "80vh" }} 
              w="100%" 
              borderRadius="md" 
              overflow="hidden"
              border="1px solid"
              borderColor="gray.200"
            >
              <Suspense fallback={
                <Center h="100%" w="100%">
                  <Spinner size="xl" color="green.500" />
                  <Text ml={3}>Loading map view...</Text>
                </Center>
              }>
                {loadMap && <MapView posts={mapPosts} />}
              </Suspense>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default Home; 
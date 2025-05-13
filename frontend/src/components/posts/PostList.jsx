import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Text,
  Badge,
  Link,
  Avatar,
  Stack,
  Divider,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { timeAgo, getExpiryTime } from '../../utils/helpers';

const PostCard = ({ post }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const expiryColor = new Date(post.expiryDate) < new Date() ? 'red.500' : 'green.500';

  return (
    <Box
      p={4}
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
    >
      <Flex justify="space-between" align="start" mb={3}>
        <Box>
          <Heading as="h3" size="md" mb={1}>
            <Link as={RouterLink} to={`/posts/${post._id}`} color="brand.600">
              {post.title}
            </Link>
          </Heading>
          <Flex gap={2} mb={2}>
            <Badge colorScheme={post.type === 'Donate' ? 'green' : 'orange'}>
              {post.type}
            </Badge>
            <Badge
              colorScheme={
                post.status === 'Posted' ? 'blue' :
                post.status === 'Claimed' ? 'yellow' :
                post.status === 'Picked Up' ? 'purple' :
                post.status === 'Completed' ? 'green' : 'red'
              }
            >
              {post.status}
            </Badge>
          </Flex>
          <Text fontSize="sm" color="gray.500">
            Posted {timeAgo(post.createdAt)}
          </Text>
        </Box>
        <Box>
          <Text fontSize="sm" color={expiryColor} fontWeight="medium">
            {getExpiryTime(post.expiryDate)}
          </Text>
        </Box>
      </Flex>

      <Text noOfLines={2} mb={3}>
        {post.description}
      </Text>

      <Divider my={3} />

      <Flex justify="space-between" align="center">
        <Flex align="center">
          <Avatar
            size="sm"
            name={post.user?.name}
            src={post.user?.profilePicture}
            mr={2}
          />
          <Box>
            <Text fontSize="sm" fontWeight="medium">
              {post.user?.name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {post.location?.address}
            </Text>
          </Box>
        </Flex>
        <Button
          as={RouterLink}
          to={`/posts/${post._id}`}
          size="sm"
          variant="outline"
          colorScheme="brand"
        >
          View Details
        </Button>
      </Flex>
    </Box>
  );
};

const PostList = ({ posts, pagination, onPageChange }) => {
  if (!posts || posts.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.600">
          No posts found matching your criteria.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        gap={4}
        mb={8}
      >
        {posts.map(post => (
          <PostCard key={post._id} post={post} />
        ))}
      </Grid>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Flex justify="center" mt={6}>
          <Stack direction="row" spacing={2} align="center">
            <IconButton
              icon={<ChevronLeftIcon />}
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              isDisabled={pagination.page === 1}
              aria-label="Previous page"
              size="sm"
            />
            
            <Text fontSize="sm" mx={2}>
              Page {pagination.page} of {pagination.pages}
            </Text>

            <IconButton
              icon={<ChevronRightIcon />}
              onClick={() => onPageChange(Math.min(pagination.pages, pagination.page + 1))}
              isDisabled={pagination.page === pagination.pages}
              aria-label="Next page"
              size="sm"
            />
          </Stack>
        </Flex>
      )}
    </Box>
  );
};

export default PostList; 
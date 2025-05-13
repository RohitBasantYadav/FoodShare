import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stack,
  Text,
  Tag,
  Badge,
  Avatar,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Select,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { getPostById, claimPost, updatePostStatus, deletePost } from '../features/posts/postSlice';
import { getPostRatings, rateUser } from '../features/users/userSlice';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import { formatDate, timeAgo, getExpiryTime, getStarRating } from '../utils/helpers';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { post, isLoading: postLoading } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);
  const { ratings, isLoading: ratingsLoading } = useSelector((state) => state.users);
  
  const [ratingData, setRatingData] = useState({ score: 5, comment: '' });
  const [recipientId, setRecipientId] = useState(null);
  
  const {
    isOpen: isRatingOpen,
    onOpen: onRatingOpen,
    onClose: onRatingClose
  } = useDisclosure();
  
  const {
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onClose: onStatusClose
  } = useDisclosure();
  
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure();
  
  useEffect(() => {
    if (id) {
      dispatch(getPostById(id));
      dispatch(getPostRatings(id));
    }
  }, [dispatch, id]);
  
  // Check if current user is the post owner
  const isOwner = user && post?.user?._id === user._id;
  
  // Check if current user is the claimer
  const isClaimer = user && post?.claimedBy?._id === user._id;
  
  // Determine if post can be edited
  const canEdit = isOwner && ['Posted', 'Expired'].includes(post?.status);
  
  // Determine if post can be deleted
  const canDelete = isOwner && ['Posted', 'Expired'].includes(post?.status);
  
  // Determine if post can be claimed
  const canClaim = user && !isOwner && post?.status === 'Posted';
  
  // Determine if ratings can be given
  const canRate = user && post?.status === 'Completed' && (isOwner || isClaimer);
  
  // Handle claim post
  const handleClaim = async () => {
    try {
      await dispatch(claimPost(id)).unwrap();
      toast({
        title: 'Post Claimed',
        description: 'You have successfully claimed this post',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to claim post',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle status update
  const handleStatusUpdate = async (status) => {
    try {
      await dispatch(updatePostStatus({ id, status })).unwrap();
      onStatusClose();
      toast({
        title: 'Status Updated',
        description: `Post status has been updated to ${status}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle post deletion
  const handleDelete = async () => {
    try {
      await dispatch(deletePost(id)).unwrap();
      onDeleteClose();
      navigate('/');
      toast({
        title: 'Post Deleted',
        description: 'Your post has been permanently deleted',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete post',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle rating submission
  const handleRateUser = async () => {
    if (!recipientId) {
      toast({
        title: 'Error',
        description: 'Please select who you want to rate',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      await dispatch(rateUser({
        postId: id,
        recipientId,
        score: ratingData.score,
        comment: ratingData.comment
      })).unwrap();
      
      onRatingClose();
      toast({
        title: 'Rating Submitted',
        description: 'Your rating has been submitted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit rating',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Open rating modal
  const openRatingModal = (userId) => {
    setRecipientId(userId);
    setRatingData({ score: 5, comment: '' });
    onRatingOpen();
  };
  
  if (postLoading || ratingsLoading || !post) {
    return <LoadingSpinner message="Loading post details..." />;
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8}>
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <Box bg="white" p={6} borderRadius="md" boxShadow="sm">
            <Flex justify="space-between" align="start" wrap="wrap" mb={4}>
              <Box>
                <Heading as="h1" size="xl" mb={2}>
                  {post.title}
                </Heading>
                <Flex align="center" mb={2}>
                  <Badge 
                    colorScheme={post.type === 'Donate' ? 'green' : 'orange'} 
                    mr={2}
                    fontSize="sm"
                  >
                    {post.type}
                  </Badge>
                  <Badge 
                    colorScheme={
                      post.status === 'Posted' ? 'blue' : 
                      post.status === 'Claimed' ? 'yellow' :
                      post.status === 'Picked Up' ? 'purple' :
                      post.status === 'Completed' ? 'green' : 'red'
                    }
                    fontSize="sm"
                  >
                    {post.status}
                  </Badge>
                </Flex>
                <Text fontSize="sm" color="gray.500">
                  Posted {timeAgo(post.createdAt)}
                </Text>
              </Box>
              
              {/* Action buttons */}
              <Flex gap={2} mt={{ base: 4, md: 0 }}>
                {canEdit && (
                  <Button 
                    as={RouterLink} 
                    to={`/posts/edit/${id}`}
                    size="sm" 
                    colorScheme="blue"
                  >
                    Edit
                  </Button>
                )}
                
                {canDelete && (
                  <Button size="sm" colorScheme="red" onClick={onDeleteOpen}>
                    Delete
                  </Button>
                )}
                
                {canClaim && (
                  <Button 
                    size="sm" 
                    colorScheme="green" 
                    onClick={handleClaim}
                  >
                    Claim
                  </Button>
                )}
                
                {(isOwner || isClaimer) && post.status !== 'Completed' && post.status !== 'Expired' && (
                  <Button 
                    size="sm" 
                    colorScheme="purple" 
                    onClick={onStatusOpen}
                  >
                    Update Status
                  </Button>
                )}
                
                {canRate && (
                  <Menu>
                    <MenuButton as={Button} size="sm" colorScheme="yellow" rightIcon={<ChevronDownIcon />}>
                      Rate User
                    </MenuButton>
                    <MenuList>
                      {isOwner && post.claimedBy && (
                        <MenuItem onClick={() => openRatingModal(post.claimedBy._id)}>
                          Rate {post.claimedBy.name}
                        </MenuItem>
                      )}
                      {isClaimer && post.user && (
                        <MenuItem onClick={() => openRatingModal(post.user._id)}>
                          Rate {post.user.name}
                        </MenuItem>
                      )}
                    </MenuList>
                  </Menu>
                )}
              </Flex>
            </Flex>
            
            <Divider my={4} />
            
            {/* Post details */}
            <Stack spacing={4}>
              <Box>
                <Heading as="h3" size="md" mb={2}>
                  Description
                </Heading>
                <Text>{post.description}</Text>
              </Box>
              
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <Box>
                  <Heading as="h3" size="sm" mb={1}>
                    Quantity
                  </Heading>
                  <Text>{post.quantity}</Text>
                </Box>
                
                <Box>
                  <Heading as="h3" size="sm" mb={1}>
                    Expiry
                  </Heading>
                  <Text>
                    {formatDate(post.expiryDate)}
                    {' '}
                    <Text as="span" color={
                      new Date(post.expiryDate) < new Date() ? 'red.500' : 'green.500'
                    }>
                      ({getExpiryTime(post.expiryDate)})
                    </Text>
                  </Text>
                </Box>
                
                <Box>
                  <Heading as="h3" size="sm" mb={1}>
                    Location
                  </Heading>
                  <Text>{post.location.address}</Text>
                </Box>
              </Grid>
              
              {post.images && post.images.length > 0 && (
                <Box mt={4}>
                  <Heading as="h3" size="md" mb={2}>
                    Images
                  </Heading>
                  <Flex gap={2} flexWrap="wrap">
                    {post.images.map((image, index) => (
                      <Image 
                        key={index}
                        src={image}
                        alt={`Post image ${index + 1}`}
                        boxSize="150px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    ))}
                  </Flex>
                </Box>
              )}
              
              {post.statusTimeline && post.statusTimeline.length > 0 && (
                <Box mt={4}>
                  <Heading as="h3" size="md" mb={2}>
                    Status Timeline
                  </Heading>
                  <Stack spacing={2}>
                    {post.statusTimeline.map((timeline, index) => (
                      <Flex key={index} align="center">
                        <Badge 
                          colorScheme={
                            timeline.status === 'Posted' ? 'blue' : 
                            timeline.status === 'Claimed' ? 'yellow' :
                            timeline.status === 'Picked Up' ? 'purple' :
                            timeline.status === 'Completed' ? 'green' : 'red'
                          }
                          mr={2}
                        >
                          {timeline.status}
                        </Badge>
                        <Text fontSize="sm">
                          {formatDate(timeline.timestamp)}
                          {timeline.updatedBy && ` by ${timeline.updatedBy.name}`}
                        </Text>
                      </Flex>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        </GridItem>
        
        <GridItem colSpan={1}>
          {/* User information */}
          <Box bg="white" p={6} borderRadius="md" boxShadow="sm" mb={6}>
            <Heading as="h3" size="md" mb={4}>
              {post.type === 'Donate' ? 'Donor' : 'Requester'}
            </Heading>
            <Flex direction="column" align="center">
              <Avatar 
                size="xl" 
                name={post.user?.name}
                src={post.user?.profilePicture}
                mb={3}
              />
              <Link 
                as={RouterLink} 
                to={`/users/${post.user?._id}`}
                fontWeight="bold"
                fontSize="lg"
                mb={1}
              >
                {post.user?.name}
              </Link>
              <Text fontSize="sm" mb={2}>
                Rating: {getStarRating(post.user?.averageRating)}
              </Text>
              <Button 
                as={RouterLink}
                to={`/users/${post.user?._id}`}
                size="sm"
                variant="outline"
                mt={2}
              >
                View Profile
              </Button>
            </Flex>
          </Box>
          
          {/* Claimer information if claimed */}
          {post.claimedBy && (
            <Box bg="white" p={6} borderRadius="md" boxShadow="sm" mb={6}>
              <Heading as="h3" size="md" mb={4}>
                Claimed By
              </Heading>
              <Flex direction="column" align="center">
                <Avatar 
                  size="xl" 
                  name={post.claimedBy?.name}
                  src={post.claimedBy?.profilePicture}
                  mb={3}
                />
                <Link 
                  as={RouterLink} 
                  to={`/users/${post.claimedBy?._id}`}
                  fontWeight="bold"
                  fontSize="lg"
                  mb={1}
                >
                  {post.claimedBy?.name}
                </Link>
                <Text fontSize="sm" mb={2}>
                  Rating: {getStarRating(post.claimedBy?.averageRating)}
                </Text>
                <Button 
                  as={RouterLink}
                  to={`/users/${post.claimedBy?._id}`}
                  size="sm"
                  variant="outline"
                  mt={2}
                >
                  View Profile
                </Button>
              </Flex>
            </Box>
          )}
          
          {/* Ratings */}
          <Box bg="white" p={6} borderRadius="md" boxShadow="sm">
            <Heading as="h3" size="md" mb={4}>
              Ratings
            </Heading>
            
            {ratings && ratings.length > 0 ? (
              <Stack spacing={4}>
                {ratings.map(rating => (
                  <Box key={rating._id} p={3} borderWidth="1px" borderRadius="md">
                    <Flex justify="space-between" mb={1}>
                      <Flex align="center">
                        <Avatar
                          size="xs"
                          name={rating.giver?.name}
                          src={rating.giver?.profilePicture}
                          mr={2}
                        />
                        <Link
                          as={RouterLink}
                          to={`/users/${rating.giver?._id}`}
                          fontWeight="bold"
                        >
                          {rating.giver?.name}
                        </Link>
                      </Flex>
                      <Text fontWeight="bold" color="orange.400">
                        {rating.score} ★
                      </Text>
                    </Flex>
                    
                    {rating.comment && (
                      <Text fontSize="sm" mt={1}>
                        "{rating.comment}"
                      </Text>
                    )}
                    
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {formatDate(rating.createdAt)}
                    </Text>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text color="gray.500">No ratings yet</Text>
            )}
          </Box>
        </GridItem>
      </Grid>
      
      {/* Update Status Modal */}
      <Modal isOpen={isStatusOpen} onClose={onStatusClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Post Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>Select the new status for this post:</Text>
            <Stack spacing={3}>
              {isOwner && post?.status === 'Posted' && (
                <Button onClick={() => handleStatusUpdate('Cancelled')}>
                  Cancel Post
                </Button>
              )}
              
              {isOwner && post?.status === 'Claimed' && (
                <Button onClick={() => handleStatusUpdate('Posted')}>
                  Revert to Posted (Unclaim)
                </Button>
              )}
              
              {isClaimer && post?.status === 'Claimed' && (
                <Button colorScheme="purple" onClick={() => handleStatusUpdate('Picked Up')}>
                  Mark as Picked Up
                </Button>
              )}
              
              {isOwner && post?.status === 'Picked Up' && (
                <Button colorScheme="green" onClick={() => handleStatusUpdate('Completed')}>
                  Mark as Completed
                </Button>
              )}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this post? This action cannot be undone.</Text>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Rating Modal */}
      <Modal isOpen={isRatingOpen} onClose={onRatingClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Submit Rating</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Rating</FormLabel>
                <Select 
                  value={ratingData.score}
                  onChange={(e) => setRatingData({...ratingData, score: Number(e.target.value)})}
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Below Average</option>
                  <option value={1}>1 Star - Poor</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Comment (Optional)</FormLabel>
                <Textarea 
                  value={ratingData.comment}
                  onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}
                  placeholder="Share your experience"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onRatingClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleRateUser}>
              Submit Rating
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default PostDetail; 
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Heading,
  Box,
  Text,
  Button,
  Flex,
  Stack,
  Divider,
  Badge,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaBell, FaCheck, FaTrash } from 'react-icons/fa';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../features/notifications/notificationSlice';
import LoadingSpinner from '../components/layout/LoadingSpinner';

const Notifications = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { notifications, unreadCount, pagination, isLoading, error } = useSelector(
    (state) => state.notifications
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getNotifications({ page }));
  }, [dispatch, page]);

  const handleMarkAsRead = async (id) => {
    try {
      await dispatch(markAsRead(id)).unwrap();
      toast({
        title: 'Notification marked as read',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error marking notification as read',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      toast({
        title: 'All notifications marked as read',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error marking all notifications as read',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await dispatch(deleteNotification(id)).unwrap();
      toast({
        title: 'Notification deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting notification',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Format the date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading && notifications.length === 0) {
    return <LoadingSpinner message="Loading notifications..." />;
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Box mb={6}>
        <Heading as="h1" size="xl" mb={2} display="flex" alignItems="center">
          <FaBell style={{ marginRight: '10px' }} /> Notifications
          {unreadCount > 0 && (
            <Badge colorScheme="red" ml={3} fontSize="md" borderRadius="full" px={2}>
              {unreadCount}
            </Badge>
          )}
        </Heading>
        <Text color="gray.600">Stay updated with your activity on FoodShare</Text>
      </Box>

      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {unreadCount > 0 && (
        <Flex justifyContent="flex-end" mb={4}>
          <Button
            leftIcon={<FaCheck />}
            colorScheme="green"
            size="sm"
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read
          </Button>
        </Flex>
      )}

      {notifications.length === 0 ? (
        <Box
          p={10}
          textAlign="center"
          borderWidth="1px"
          borderRadius="lg"
          bg="gray.50"
        >
          <Text fontSize="lg" color="gray.500">
            You don't have any notifications yet.
          </Text>
        </Box>
      ) : (
        <Stack spacing={0} borderWidth="1px" borderRadius="lg" overflow="hidden">
          {notifications.map((notification, index) => (
            <Box key={notification._id}>
              {index > 0 && <Divider />}
              <Flex
                p={4}
                alignItems="center"
                bg={notification.read ? 'white' : 'green.50'}
                transition="background-color 0.3s"
              >
                <Box flex="1">
                  <Flex justifyContent="space-between" alignItems="center" mb={1}>
                    <Text fontWeight={notification.read ? 'normal' : 'bold'}>
                      {notification.title}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {formatDate(notification.createdAt)}
                    </Text>
                  </Flex>
                  <Text color="gray.700">{notification.message}</Text>
                </Box>
                <Flex ml={4}>
                  {!notification.read && (
                    <IconButton
                      icon={<FaCheck />}
                      aria-label="Mark as read"
                      size="sm"
                      colorScheme="green"
                      variant="ghost"
                      onClick={() => handleMarkAsRead(notification._id)}
                      mr={2}
                    />
                  )}
                  <IconButton
                    icon={<FaTrash />}
                    aria-label="Delete notification"
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteNotification(notification._id)}
                  />
                </Flex>
              </Flex>
            </Box>
          ))}
        </Stack>
      )}

      {pagination.pages > 1 && (
        <Flex justifyContent="center" mt={6}>
          <Button
            onClick={() => setPage(page - 1)}
            isDisabled={page === 1}
            mr={2}
          >
            Previous
          </Button>
          <Text alignSelf="center" mx={2}>
            Page {page} of {pagination.pages}
          </Text>
          <Button
            onClick={() => setPage(page + 1)}
            isDisabled={page === pagination.pages}
            ml={2}
          >
            Next
          </Button>
        </Flex>
      )}
    </Container>
  );
};

export default Notifications; 
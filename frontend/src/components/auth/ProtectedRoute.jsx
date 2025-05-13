import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Outlet } from 'react-router-dom';
import { Box, Flex, Spinner, Text } from '@chakra-ui/react';
import { getCurrentUser } from '../../features/auth/authSlice';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // If we have a token but no user data, fetch current user
    if (isAuthenticated && !user) {
      dispatch(getCurrentUser());
    }
    
    // If not authenticated and not loading, redirect to login
    if (!isAuthenticated && !isLoading) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, user, dispatch, navigate]);

  // Show loading spinner while checking auth status
  if (isLoading || (isAuthenticated && !user)) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Box textAlign="center">
          <Spinner size="xl" color="brand.500" thickness="4px" speed="0.65s" />
          <Text mt={4} fontSize="lg">Loading...</Text>
        </Box>
      </Flex>
    );
  }

  // Render the protected child routes
  return isAuthenticated ? <Outlet /> : null;
};

export default ProtectedRoute;
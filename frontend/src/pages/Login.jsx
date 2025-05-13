import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { loginUser, resetAuthState } from '../features/auth/authSlice';

// Validation schema for login form
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
  const [loginError, setLoginError] = useState('');

  // Clear any auth errors when component mounts
  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  // Navigate to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Update local error state when redux error changes
  useEffect(() => {
    if (error) {
      setLoginError(error);
      
      // Show persistent toast for login errors
      if (!toast.isActive('login-error')) {
        toast({
          id: 'login-error',
          title: 'Login Failed',
          description: error,
          status: 'error',
          duration: 10000, // Longer duration (10 seconds)
          isClosable: true,
          position: 'top',
        });
      }
    } else {
      setLoginError('');
    }
  }, [error, toast]);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    // No need to access event object here
    try {
      const result = await dispatch(loginUser(values)).unwrap();
      // Only navigate on success (this won't execute if the dispatch rejects)
      if (result && result.token) {
        navigate('/dashboard');
      }
    } catch (err) {
      // Error is already set in state by the thunk
      console.error('Login failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <Box textAlign="center" mb={10}>
        <Heading as="h1" size="xl" color="brand.600">
          Login to FoodShare
        </Heading>
        <Text mt={2} color="gray.600">
          Connect with your community and share food resources
        </Text>
      </Box>

      <Box bg="white" p={8} rounded="lg" boxShadow="md">
        {loginError && (
          <Alert status="error" mb={4} rounded="md">
            <AlertIcon />
            {loginError}
          </Alert>
        )}

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, handleSubmit: formikSubmit }) => (
            <Form onSubmit={(event) => {
              event.preventDefault();
              formikSubmit(event);
            }}>
              <Stack spacing={4}>
                <Field name="email">
                  {({ field }) => (
                    <FormControl isInvalid={errors.email && touched.email}>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                      />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="password">
                  {({ field }) => (
                    <FormControl isInvalid={errors.password && touched.password}>
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <Input
                        {...field}
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                      />
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Button
                  type="submit"
                  colorScheme="green"
                  isLoading={isLoading || isSubmitting}
                  loadingText="Logging in"
                  size="lg"
                  w="100%"
                  mt={4}
                >
                  Login
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>

        <Text mt={6} textAlign="center">
          Don't have an account?{' '}
          <Link as={RouterLink} to="/register" color="brand.500" fontWeight="medium">
            Register here
          </Link>
        </Text>
      </Box>
    </Container>
  );
};

export default Login; 
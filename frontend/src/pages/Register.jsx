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
} from '@chakra-ui/react';
import { registerUser, resetAuthState } from '../features/auth/authSlice';

// Validation schema for registration form
const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  phone: Yup.string()
    .optional()
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
  const [showError, setShowError] = useState(false);

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

  // Show error toast when error occurs
  useEffect(() => {
    if (error && showError) {
      toast({
        title: 'Registration Failed',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setShowError(false);
    }
  }, [error, showError, toast]);

  // Handle form submission
  const handleSubmit = async (values) => {
    // Remove confirmPassword as it's not needed in the API call
    const { confirmPassword, ...userData } = values;
    setShowError(true);
    await dispatch(registerUser(userData));
  };

  return (
    <Container maxW="md" py={12}>
      <Box textAlign="center" mb={10}>
        <Heading as="h1" size="xl" color="brand.600">
          Join FoodShare
        </Heading>
        <Text mt={2} color="gray.600">
          Create an account to start donating or requesting food
        </Text>
      </Box>

      <Box bg="white" p={8} rounded="lg" boxShadow="md">
        <Formik
          initialValues={{ 
            name: '', 
            email: '', 
            password: '', 
            confirmPassword: '',
            phone: '' 
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
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

                <Field name="email">
                  {({ field }) => (
                    <FormControl isInvalid={errors.email && touched.email}>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                      />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="phone">
                  {({ field }) => (
                    <FormControl isInvalid={errors.phone && touched.phone}>
                      <FormLabel htmlFor="phone">Phone (Optional)</FormLabel>
                      <Input
                        {...field}
                        id="phone"
                        placeholder="Enter your phone number"
                      />
                      <FormErrorMessage>{errors.phone}</FormErrorMessage>
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
                      />
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="confirmPassword">
                  {({ field }) => (
                    <FormControl isInvalid={errors.confirmPassword && touched.confirmPassword}>
                      <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                      <Input
                        {...field}
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                      />
                      <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Button
                  type="submit"
                  colorScheme="green"
                  isLoading={isLoading}
                  loadingText="Registering"
                  size="lg"
                  w="100%"
                  mt={4}
                >
                  Register
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>

        <Text mt={6} textAlign="center">
          Already have an account?{' '}
          <Link as={RouterLink} to="/login" color="brand.500" fontWeight="medium">
            Login here
          </Link>
        </Text>
      </Box>
    </Container>
  );
};

export default Register; 
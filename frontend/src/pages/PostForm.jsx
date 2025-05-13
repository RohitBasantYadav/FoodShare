import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  Textarea,
  useToast,
  Alert,
  AlertIcon,
  Flex,
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createPost, getPostById, updatePost, resetPostState } from '../features/posts/postSlice';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import LocationPicker from '../components/map/LocationPicker';

// Function to get coordinates from address using OpenStreetMap Nominatim
const getCoordinatesFromAddress = async (address) => {
  try {
    // Skip geocoding for default placeholder values
    if (!address || address === 'Address not specified') {
      throw new Error('Please provide a valid address');
    }
    
    console.log('Geocoding address:', address);
    
    // Use Nominatim geocoding API (OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          'Accept-Language': 'en', // Get results in English
          'User-Agent': 'FoodShare App' // Required by Nominatim ToS
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Geocoding result:', data);
    
    if (data && data.length > 0) {
      // Return [longitude, latitude] for MongoDB
      const lng = parseFloat(data[0].lon);
      const lat = parseFloat(data[0].lat);
      return [lng, lat];
    } else {
      throw new Error('No results found for the address');
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    
    // For testing - return default coordinates
    console.log('Error in geocoding, using default coordinates for testing');
    // Return in [longitude, latitude] format for MongoDB (GeoJSON)
    return [77.5946, 12.9716]; // Default Bangalore coordinates in [lng, lat] format for MongoDB
  }
};

// Validation schema for post form
const PostSchema = Yup.object().shape({
  type: Yup.string().required('Type is required'),
  title: Yup.string()
    .required('Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: Yup.string()
    .required('Description is required')
    .max(500, 'Description cannot exceed 500 characters'),
  quantity: Yup.string().required('Quantity is required'),
  'location.address': Yup.string().nullable(),
  expiryDate: Yup.date()
    .required('Expiry date is required')
    .min(new Date(), 'Expiry date must be in the future'),
});

const PostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { post, isLoading: postLoading } = useSelector((state) => state.posts);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Local submitting state

  useEffect(() => {
    // Reset post state when component unmounts
    return () => {
      dispatch(resetPostState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      dispatch(getPostById(id));
    }
  }, [dispatch, id]);

  const initialValues = {
    type: post?.type || 'Donate',
    title: post?.title || '',
    description: post?.description || '',
    quantity: post?.quantity || '',
    'location.address': post?.location?.address || '',
    expiryDate: post?.expiryDate ? new Date(post.expiryDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
    images: post?.images || [],
  };

  const handleSubmit = async (values, { setSubmitting: setFormikSubmitting, setFieldError }) => {
    // Set our local submitting state
    setSubmitting(true);
    
    try {
      setFormikSubmitting(true);
      
      console.log('Form values:', values);
      
      // Manual validation for location address - if empty, use default value
      let locationAddress = values['location.address'];
      
      // Handle case where location fields were filled but not properly passed to form
      if (!locationAddress || locationAddress.trim() === '') {
        console.log('Location validation would fail - attempting to retrieve from fields');
        
        // Try to extract from the form display
        const streetField = document.querySelector('input[placeholder="Street Address"]');
        const cityField = document.querySelector('input[placeholder="City"]');
        const stateField = document.querySelector('input[placeholder="State/Province"]');
        
        if (streetField?.value || cityField?.value || stateField?.value) {
          const parts = [];
          if (streetField?.value) parts.push(streetField.value);
          if (cityField?.value) parts.push(cityField.value);
          if (stateField?.value) parts.push(stateField.value);
          
          locationAddress = parts.join(', ');
          console.log('Retrieved address from fields:', locationAddress);
          
          // Update form values
          values['location.address'] = locationAddress;
        } else {
          console.log('Location validation failed - empty or undefined');
          toast({
            title: 'Location Required',
            description: "Please provide a valid location address",
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          setFieldError('location.address', 'Please provide a valid address');
          setFormikSubmitting(false);
          setSubmitting(false);
          return;
        }
      }
      
      // Get coordinates from the provided address with a timeout
      let coordinates;
      try {
        console.log('Getting coordinates for address...');
        // Add a timeout to avoid hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Geocoding timed out')), 5000);
        });
        coordinates = await Promise.race([
          getCoordinatesFromAddress(values['location.address']),
          timeoutPromise
        ]);
        console.log('Coordinates from geocoding:', coordinates);
      } catch (geoError) {
        console.error('Error during geocoding:', geoError);
        // Use fallback coordinates for development
        // MongoDB expects [longitude, latitude] format
        coordinates = [77.5946, 12.9716]; // Bangalore coordinates in [lng, lat] format
      }
      
      if (!coordinates || coordinates.length !== 2) {
        toast({
          title: 'Location Error',
          description: "Couldn't find coordinates for the provided address. Using default coordinates.",
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        // Use fallback coordinates for development
        // MongoDB expects [longitude, latitude] format
        coordinates = [77.5946, 12.9716]; // Bangalore coordinates in [lng, lat] format
      }
      
      // Transform location data to match the expected format
      const postData = {
        ...values,
        location: {
          address: locationAddress, // Use our retrieved location address
          coordinates: coordinates
        }
      };
      
      // Remove the dot notation field from the data
      delete postData['location.address'];
      
      console.log('Sending post data to server:', postData);
      
      try {
        if (isEditMode) {
          await dispatch(updatePost({ id, postData })).unwrap();
          toast({
            title: 'Post Updated',
            description: 'Your post has been successfully updated',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } else {
          const result = await dispatch(createPost(postData)).unwrap();
          console.log('Create post result:', result);
          
          toast({
            title: 'Post Created',
            description: 'Your post has been successfully created',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
        // Navigate after successful submission
        navigate('/dashboard');
      } catch (apiError) {
        console.error('API error:', apiError);
        toast({
          title: 'Submission Error',
          description: apiError.message || 'Error saving post. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error in submit:', error);
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFormikSubmitting(false);
      setSubmitting(false); // Reset our local submitting state
    }
  };

  if (postLoading && isEditMode) {
    return <LoadingSpinner message="Loading post data..." />;
  }

  return (
    <Container maxW={{ base: "95%", md: "container.md", lg: "container.lg", xl: "container.xl" }} py={{ base: 4, md: 8 }}>
      <Box 
        mb={{ base: 4, md: 8 }}
        maxW={{ lg: "900px", xl: "1100px" }}
        mx="auto"
      >
        <Heading as="h1" size={{ base: "lg", md: "xl" }} mb={2}>
          {isEditMode ? 'Edit Post' : 'Create New Post'}
        </Heading>
        <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
          {isEditMode
            ? 'Update your donation or request details'
            : 'Share food with your community or request what you need'}
        </Text>
      </Box>

      <Box 
        bg="white" 
        p={{ base: 4, md: 6, lg: 8 }} 
        rounded="lg" 
        boxShadow="md"
        maxW={{ lg: "900px", xl: "1100px" }}
        mx="auto"
      >
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={PostSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => (
            <Form>
              <Stack spacing={{ base: 3, md: 5 }} width="100%">
                <Field name="type">
                  {({ field }) => (
                    <FormControl isInvalid={errors.type && touched.type}>
                      <FormLabel htmlFor="type" fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Post Type</FormLabel>
                      <RadioGroup
                        {...field}
                        id="type"
                        onChange={(val) => setFieldValue('type', val)}
                        value={values.type}
                      >
                        <Stack direction={{ base: "column", sm: "row" }} spacing={{ base: 2, md: 5 }}>
                          <Radio value="Donate" colorScheme="green">
                            I want to donate food
                          </Radio>
                          <Radio value="Request" colorScheme="orange">
                            I need food
                          </Radio>
                        </Stack>
                      </RadioGroup>
                      <FormErrorMessage fontSize={{ base: "xs", md: "sm" }}>{errors.type}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="title">
                  {({ field }) => (
                    <FormControl isInvalid={errors.title && touched.title} width="100%">
                      <FormLabel htmlFor="title" fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Title</FormLabel>
                      <Input
                        {...field}
                        id="title"
                        placeholder="Enter a descriptive title"
                        size={{ base: "sm", md: "md" }}
                      />
                      <FormErrorMessage fontSize={{ base: "xs", md: "sm" }}>{errors.title}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                <Field name="description">
                  {({ field }) => (
                    <FormControl isInvalid={errors.description && touched.description} width="100%">
                      <FormLabel htmlFor="description" fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Description</FormLabel>
                      <Textarea
                        {...field}
                        id="description"
                        placeholder="Describe the food items in detail"
                        size={{ base: "sm", md: "md" }}
                        rows={{ base: 3, md: 4 }}
                      />
                      <FormErrorMessage fontSize={{ base: "xs", md: "sm" }}>{errors.description}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                {/* Quantity and Location fields in a grid on larger screens */}
                <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 3, lg: 6 }}>
                  <Field name="quantity">
                    {({ field }) => (
                      <FormControl isInvalid={errors.quantity && touched.quantity} flex="1">
                        <FormLabel htmlFor="quantity" fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Quantity</FormLabel>
                        <Input
                          {...field}
                          id="quantity"
                          placeholder="E.g., 2 kg, 5 boxes, 3 meals"
                          size={{ base: "sm", md: "md" }}
                        />
                        <FormErrorMessage fontSize={{ base: "xs", md: "sm" }}>{errors.quantity}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  
                  <Field name="location.address">
                    {({ field, form }) => (
                      <Box flex="1">
                        <FormControl isInvalid={errors['location.address'] && touched['location.address']} isRequired>
                          <FormLabel htmlFor="location.address" fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Location</FormLabel>
                          <LocationPicker
                            value={field.value}
                            onChange={(value) => {
                              console.log("Setting location.address to:", value);
                              // Set the form value
                              form.setFieldValue('location.address', value);
                              // Mark as touched to trigger validation
                              form.setFieldTouched('location.address', true, true);
                              
                              // Force update the value after a short delay (for debugging)
                              setTimeout(() => {
                                console.log("Checking if location.address was set:", form.values['location.address']);
                                if (!form.values['location.address'] && value) {
                                  console.log("Value wasn't set correctly, trying again with:", value);
                                  form.setFieldValue('location.address', value);
                                }
                              }, 100);
                            }}
                            error={errors['location.address']}
                            touched={touched['location.address']}
                          />
                          {/* Show current value for debugging */}
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            Current value: "{values['location.address'] || 'empty'}"
                          </Text>
                          {errors['location.address'] && touched['location.address'] && (
                            <FormErrorMessage fontSize={{ base: "xs", md: "sm" }}>{errors['location.address']}</FormErrorMessage>
                          )}
                        </FormControl>
                      </Box>
                    )}
                  </Field>
                </Flex>

                <Field name="expiryDate">
                  {({ field }) => (
                    <FormControl isInvalid={errors.expiryDate && touched.expiryDate}>
                      <FormLabel htmlFor="expiryDate" fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Expiry Date</FormLabel>
                      <DatePicker
                        id="expiryDate"
                        selected={values.expiryDate}
                        onChange={(date) => setFieldValue('expiryDate', date)}
                        minDate={new Date()}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        showTimeSelect
                        customInput={<Input size={{ base: "sm", md: "md" }} />}
                      />
                      <FormErrorMessage fontSize={{ base: "xs", md: "sm" }}>{errors.expiryDate}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>

                {/* Image upload functionality would go here */}

                <Box textAlign={{ base: "center", md: "right" }} mt={{ base: 6, md: 8 }}>
                  <Button
                    colorScheme="green"
                    isLoading={isSubmitting || submitting}
                    loadingText="Submitting..."
                    type="submit"
                    size={{ base: "md", lg: "lg" }}
                    w={{ base: "100%", md: "auto" }}
                    px={{ md: 8 }}
                    py={{ md: 6 }}
                    fontSize={{ base: "md", md: "lg" }}
                    fontWeight="bold"
                    disabled={isSubmitting || submitting}
                  >
                    {isEditMode ? 'Update Post' : 'Create Post'}
                  </Button>
                </Box>
              </Stack>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default PostForm; 
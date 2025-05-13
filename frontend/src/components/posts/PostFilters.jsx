import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Button,
  Input,
  Stack,
  HStack,
  Text,
  useColorModeValue,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaFilter, FaUndo } from 'react-icons/fa';

const PostFilters = ({ filters, onFilterChange }) => {
  const toast = useToast();
  const [localFilters, setLocalFilters] = useState({
    type: '',
    status: '',
    expiringSoon: false,
    radius: 10,
    lat: null,
    lng: null
  });

  // Update local state when filters prop changes
  useEffect(() => {
    console.log('Filters prop changed:', filters);
    setLocalFilters(filters);
  }, [filters]);

  // Handle input changes
  const handleChange = (field, value) => {
    console.log(`Changing ${field} to:`, value);
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
  };

  // Apply filters when user clicks the button
  const applyFilters = () => {
    console.log('Applying filters:', localFilters);
    onFilterChange(localFilters);
    
    toast({
      title: "Filters applied",
      description: "The post list has been updated with your filters",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      type: '',
      status: '',
      expiringSoon: false,
      radius: 10,
      lat: null,
      lng: null
    };
    console.log('Resetting filters to:', defaultFilters);
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
    
    toast({
      title: "Filters reset",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      toast({
        title: "Getting your location",
        description: "Please allow location access if prompted",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const updatedFilters = {
            ...localFilters,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('Location set:', updatedFilters);
          setLocalFilters(updatedFilters);
          
          // Automatically apply filters when location is set
          setTimeout(() => {
            onFilterChange(updatedFilters);
            toast({
              title: "Location set",
              description: "Posts will now be filtered by your location",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          }, 300);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location error",
            description: error.message || "Could not get your location",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      toast({
        title: "Location not supported",
        description: "Your browser does not support geolocation",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const bg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box
      p={4}
      rounded="md"
      border="1px"
      borderColor={borderColor}
      bg={bg}
      mb={4}
    >
      <Stack spacing={4}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
          <FormControl>
            <FormLabel fontSize="sm">Post Type</FormLabel>
            <Select
              value={localFilters.type}
              onChange={(e) => handleChange('type', e.target.value)}
              placeholder="All Types"
              size="sm"
            >
              <option value="Donate">Donations</option>
              <option value="Request">Requests</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Status</FormLabel>
            <Select
              value={localFilters.status}
              onChange={(e) => handleChange('status', e.target.value)}
              placeholder="All Statuses"
              size="sm"
            >
              <option value="Available">Available</option>
              <option value="Claimed">Claimed</option>
              <option value="PickedUp">Picked Up</option>
              <option value="Completed">Completed</option>
              <option value="Expired">Expired</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Distance (km)</FormLabel>
            <NumberInput
              min={1}
              max={100}
              value={localFilters.radius}
              onChange={(value) => handleChange('radius', parseInt(value))}
              isDisabled={!localFilters.lat || !localFilters.lng}
              size="sm"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </Flex>

        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <HStack>
            <FormControl display="flex" alignItems="center">
              <Switch
                id="expiry"
                isChecked={localFilters.expiringSoon}
                onChange={(e) => handleChange('expiringSoon', e.target.checked)}
                colorScheme="orange"
              />
              <FormLabel htmlFor="expiry" mb="0" ml={2} fontSize="sm">
                Expiring Soon (24h)
              </FormLabel>
            </FormControl>
          </HStack>

          <HStack>
            <Button
              size="sm"
              onClick={getCurrentLocation}
              colorScheme="blue"
              variant="outline"
              leftIcon={<FaMapMarkerAlt />}
            >
              Use My Location
            </Button>
            {localFilters.lat && localFilters.lng && (
              <Badge colorScheme="green" variant="subtle" px={2} py={1} borderRadius="full">
                Location active
              </Badge>
            )}
          </HStack>

          <HStack>
            <Button size="sm" onClick={resetFilters} variant="outline" leftIcon={<FaUndo />}>
              Reset
            </Button>
            <Button size="sm" onClick={applyFilters} colorScheme="green" leftIcon={<FaFilter />}>
              Apply Filters
            </Button>
          </HStack>
        </Flex>
        
        {/* Active filters summary */}
        {(localFilters.type || localFilters.status || localFilters.expiringSoon || (localFilters.lat && localFilters.lng)) && (
          <Flex wrap="wrap" gap={2} mt={2}>
            <Text fontSize="xs" color="gray.500">Active filters:</Text>
            {localFilters.type && (
              <Badge colorScheme="blue" variant="subtle">
                Type: {localFilters.type}
              </Badge>
            )}
            {localFilters.status && (
              <Badge colorScheme="purple" variant="subtle">
                Status: {localFilters.status}
              </Badge>
            )}
            {localFilters.expiringSoon && (
              <Badge colorScheme="orange" variant="subtle">
                Expiring Soon
              </Badge>
            )}
            {localFilters.lat && localFilters.lng && (
              <Badge colorScheme="green" variant="subtle">
                Within {localFilters.radius}km
              </Badge>
            )}
          </Flex>
        )}
      </Stack>
    </Box>
  );
};

export default PostFilters; 
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Grid,
  GridItem,
  Text,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Divider,
} from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const customIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks and position updates
const MapMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click: (e) => {
      // When user clicks map, Leaflet returns [lat, lng]
      // Store as [lat, lng] for the map display
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position ? (
    <Marker position={position} icon={customIcon} />
  ) : null;
};

// Function to get address from coordinates using reverse geocoding
const getAddressFromCoordinates = async (lat, lng) => {
  console.log(`Getting address for coordinates: [${lat}, ${lng}]`);
  
  try {
    // Use Nominatim reverse geocoding API (OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en', // Get results in English
          'User-Agent': 'FoodShare App' // Required by Nominatim ToS
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Reverse geocoding failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Reverse geocoding result:', data);
    
    // Parse the response
    const address = data.address || {};
    
    // Extract street from various possible Nominatim fields
    const street = address.road || 
      address.street || 
      address.pedestrian || 
      address.footway || 
      address.path || 
      address.highway ||
      (address.house_number ? 
        `${address.house_number} ${address.road || address.street || ''}` : 
        '');

    // Extract city from various possible Nominatim fields
    const city = address.city || 
      address.town || 
      address.village || 
      address.hamlet || 
      address.suburb || 
      address.district || 
      address.neighbourhood ||
      address.county ||
      '';

    // Extract state from various possible Nominatim fields
    const state = address.state || 
      address.province || 
      address.region || 
      '';

    // Combine the most relevant fields for best address results
    return {
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: address.postcode || '',
      country: address.country || '',
      fullAddress: data.display_name || ''
    };
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    
    // Fallback to approximate location if possible
    return {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      fullAddress: `Location at coordinates [${lat}, ${lng}]`
    };
  }
};

// Function to get coordinates from address
const getCoordinatesFromAddress = async (addressObj) => {
  // Filter out empty values and join with commas
  const searchQuery = Object.values(addressObj)
    .filter(val => val && val.trim() !== '')
    .join(', ');
  
  console.log(`Getting coordinates for address: ${searchQuery}`);
  
  if (!searchQuery || searchQuery.trim() === '') {
    console.log('Empty search query, returning default coordinates');
    // Return [lng, lat] format for MongoDB (GeoJSON format)
    return [77.5946, 12.9716]; // Bangalore coordinates in [lng, lat] format
  }
  
  try {
    // Build a more structured query for better results
    const queryParams = new URLSearchParams();
    queryParams.append('format', 'json');
    queryParams.append('limit', '1');
    
    // Add specific address components if available for better results
    if (addressObj.street) queryParams.append('street', addressObj.street);
    if (addressObj.city) queryParams.append('city', addressObj.city);
    if (addressObj.state) queryParams.append('state', addressObj.state);
    if (addressObj.country) queryParams.append('country', addressObj.country);
    
    // If we have specific components, use structured search
    // Otherwise fall back to free-form search
    const url = (addressObj.street || addressObj.city) 
      ? `https://nominatim.openstreetmap.org/search?${queryParams.toString()}`
      : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`;
    
    console.log('Geocoding request URL:', url);
    
    // Use Nominatim geocoding API (OpenStreetMap)
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en', // Get results in English
        'User-Agent': 'FoodShare App' // Required by Nominatim ToS
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Geocoding result:', data);
    
    if (data && data.length > 0) {
      // Return [lng, lat] format for consistency
      const lng = parseFloat(data[0].lon);
      const lat = parseFloat(data[0].lat);
      console.log(`Found coordinates: [${lng}, ${lat}]`);
      return [lng, lat];
    } else {
      console.log('No geocoding results found, using default coordinates');
      throw new Error('No results found for the address');
    }
  } catch (error) {
    console.error('Error in geocoding:', error);
    // Return default coordinates on error
    // Return [lng, lat] format for MongoDB (GeoJSON format)
    return [77.5946, 12.9716]; // Bangalore coordinates in [lng, lat] format
  }
};

// Create a formatted address string from the address object
const formatAddress = (addressObj) => {
  const parts = [];
  
  // Only add non-empty fields to our address parts
  if (addressObj.street && addressObj.street.trim() !== '') 
    parts.push(addressObj.street.trim());
    
  if (addressObj.city && addressObj.city.trim() !== '') 
    parts.push(addressObj.city.trim());
    
  if (addressObj.state && addressObj.state.trim() !== '') {
    if (addressObj.zip && addressObj.zip.trim() !== '') {
      parts.push(`${addressObj.state.trim()} ${addressObj.zip.trim()}`);
    } else {
      parts.push(addressObj.state.trim());
    }
  } else if (addressObj.zip && addressObj.zip.trim() !== '') {
    parts.push(addressObj.zip.trim());
  }
  
  if (addressObj.country && addressObj.country.trim() !== '') 
    parts.push(addressObj.country.trim());
  
  // If we couldn't build a proper address, use whatever non-empty fields we have
  if (parts.length === 0) {
    Object.values(addressObj).forEach(value => {
      if (value && value.trim() !== '') parts.push(value.trim());
    });
  }
  
  // Return the formatted address, or a placeholder if no parts available
  return parts.length > 0 ? parts.join(', ') : 'Address not specified';
};

const LocationPicker = ({ 
  value, 
  onChange, 
  error, 
  touched,
  isRequired = true,
  labelSize = { base: "sm", md: "md" },
  inputSize = { base: "sm", md: "md" }
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [addressFields, setAddressFields] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });
  const [position, setPosition] = useState(null);
  const [initialCenter, setInitialCenter] = useState([40.7128, -74.0060]); // Default to New York
  
  // Debounce timer ref
  const debounceTimerRef = useRef(null);
  // Track if we're currently typing
  const [isTyping, setIsTyping] = useState(false);
  // Track if this is an initial render
  const isInitialRender = useRef(true);
  // Track if we should update the parent
  const shouldUpdateParent = useRef(true);

  // Debounced update function - using useCallback to prevent recreating on every render
  const debouncedUpdate = useCallback((addressObj) => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      // Only update if we have data
      const hasData = Object.values(addressObj).some(val => val && val.trim() !== '');
      
      if (hasData) {
        const formatted = formatAddress(addressObj);
        console.log("Debounced update with formatted address:", formatted);
        onChange(formatted);
      } else {
        console.log("No address data available");
        onChange('');
      }
    }, 800); // 800ms debounce for smooth typing
  }, [onChange]);

  // Initialize with existing value if provided
  useEffect(() => {
    // Only run this on initial mount
    if (isInitialRender.current) {
      isInitialRender.current = false;
      
      console.log('Initial render - parsing location value:', value);
      
      if (value && value !== 'Address not specified') {
        // Parse the address string into individual fields
        const parts = value.split(',').map(part => part.trim());
        console.log('Parsed address parts:', parts);
        
        // Create a new fields object
        const newFields = {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: '',
        };
        
        // Simple parsing logic - can be enhanced with regex for better accuracy
        if (parts.length >= 1) newFields.street = parts[0];
        if (parts.length >= 2) newFields.city = parts[1];
        if (parts.length >= 3) {
          // Handle "State ZIP" format
          const stateZip = parts[2].split(' ');
          if (stateZip.length > 1) {
            newFields.state = stateZip[0];
            newFields.zip = stateZip.slice(1).join(' ');
          } else {
            newFields.state = parts[2];
          }
        }
        if (parts.length >= 4) newFields.country = parts[3];
        
        console.log('Setting address fields to:', newFields);
        setAddressFields(newFields);
      }
    }
  }, [value]);

  // Initialize user's location for the map
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setInitialCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Handle address field changes
  const handleAddressChange = (field, value) => {
    setAddressFields(prev => {
      const updated = { ...prev, [field]: value };
      
      // Debounce the update to parent form
      debouncedUpdate(updated);
      
      return updated;
    });
  };

  // Search for location based on address fields
  const handleSearchLocation = async () => {
    // Check if we have any address data
    const hasData = Object.values(addressFields).some(val => val && val.trim() !== '');
    
    if (!hasData) {
      console.log('No address data to search');
      return;
    }
    
    console.log('Searching for coordinates based on address fields:', addressFields);
    
    // Get coordinates from address
    const coords = await getCoordinatesFromAddress(addressFields);
    if (coords) {
      console.log('Found coordinates:', coords);
      setPosition(coords);
    }
  };

  // Handle map location selection
  const handleSelectLocation = async () => {
    if (position) {
      // Position from map is [lat, lng] format
      // Need to get address from the position
      const address = await getAddressFromCoordinates(position[0], position[1]);
      if (address) {
        const newFields = {
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country,
        };
        
        console.log('Got address fields from map:', newFields);
        
        // Ensure we have at least some address information
        if (!newFields.street && !newFields.city && !newFields.state) {
          // If we have no useful address info, use the display name or coordinates
          if (address.fullAddress) {
            // Try to extract something useful from the full address
            const parts = address.fullAddress.split(',').map(part => part.trim());
            if (parts.length > 0) newFields.street = parts[0];
            if (parts.length > 1) newFields.city = parts[1];
            if (parts.length > 2) newFields.state = parts[2];
          } else {
            // Last resort: use the coordinates as the street address
            newFields.street = `Location at [${position[0].toFixed(6)}, ${position[1].toFixed(6)}]`;
          }
        }
        
        setAddressFields(newFields);
        
        // Map selection is immediate (no debounce)
        const formatted = formatAddress(newFields);
        console.log("Directly updating form with map selection:", formatted);
        onChange(formatted);
      }
      onClose();
    }
  };

  return (
    <>
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3} mb={3}>
        <GridItem>
          <Input
            placeholder="Street Address"
            value={addressFields.street}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            size={inputSize}
          />
        </GridItem>
        <GridItem>
          <Input
            placeholder="City"
            value={addressFields.city}
            onChange={(e) => handleAddressChange('city', e.target.value)}
            size={inputSize}
          />
        </GridItem>
        <GridItem>
          <Input
            placeholder="State/Province"
            value={addressFields.state}
            onChange={(e) => handleAddressChange('state', e.target.value)}
            size={inputSize}
          />
        </GridItem>
        <GridItem>
          <Input
            placeholder="ZIP/Postal Code"
            value={addressFields.zip}
            onChange={(e) => handleAddressChange('zip', e.target.value)}
            size={inputSize}
          />
        </GridItem>
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <Input
            placeholder="Country"
            value={addressFields.country}
            onChange={(e) => handleAddressChange('country', e.target.value)}
            size={inputSize}
          />
        </GridItem>
      </Grid>
      
      <Button 
        onClick={onOpen} 
        colorScheme="blue" 
        variant="outline" 
        size={inputSize} 
        width={{ base: "100%", md: "auto" }}
        mb={2}
      >
        Choose on Map
      </Button>
      
      <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" mt={1}>
        Enter your address details or use the map to select your location
      </Text>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Location on Map</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" gap={4}>
              <Text fontSize="sm">
                Click on the map to select your location or search using the address fields above.
              </Text>
              
              <Box>
                <Button 
                  size="sm" 
                  colorScheme="blue" 
                  onClick={handleSearchLocation}
                  mb={3}
                >
                  Search Address
                </Button>
                
                <Box height="400px" width="100%">
                  <MapContainer
                    center={position || initialCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    preferCanvas={true}
                    attributionControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      subdomains='abc'
                    />
                    <MapMarker position={position} setPosition={setPosition} />
                  </MapContainer>
                </Box>
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleSelectLocation} isDisabled={!position}>
              Confirm Location
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LocationPicker; 
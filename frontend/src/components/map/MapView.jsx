import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Box, Button, Text, Badge, Flex, useToast, Spinner } from '@chakra-ui/react';

// Custom marker icons
const createCustomIcon = (color) => {
  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const donateIcon = createCustomIcon('green');
const requestIcon = createCustomIcon('orange');

// Component to set the view of the map
const SetViewOnChange = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

const MapView = ({ posts }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Default center (can be a central location in your service area)
  const [center, setCenter] = useState([40.7128, -74.0060]); // New York by default
  
  // Try to get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Location Error',
            description: 'Unable to get your current location. Using default location.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      );
    }
  }, [toast]);
  
  // Handler for navigating to post detail view
  const handleViewPost = (postId) => {
    navigate(`/posts/${postId}`);
  };
  
  // Check if posts have valid coordinates - use useMemo to avoid recalculating on each render
  const validPosts = useMemo(() => {
    return posts?.filter(post => 
      post.location?.coordinates && 
      post.location.coordinates.length === 2 &&
      !isNaN(post.location.coordinates[0]) && 
      !isNaN(post.location.coordinates[1])
    ) || [];
  }, [posts]);
  
  // Debug the coordinates
  useEffect(() => {
    if (validPosts.length > 0) {
      console.log('Posts with coordinates:', validPosts.map(p => ({
        id: p._id,
        title: p.title,
        coords: p.location.coordinates,
      })));
    }
  }, [validPosts]);
  
  // Handle map load complete
  const handleMapLoad = () => {
    setMapLoaded(true);
  };
  
  return (
    <Box position="relative" height="100%" width="100%">
      {!mapLoaded && (
        <Flex 
          position="absolute" 
          top="0" 
          left="0" 
          right="0" 
          bottom="0" 
          align="center" 
          justify="center" 
          bg="rgba(255, 255, 255, 0.7)" 
          zIndex="500"
        >
          <Box textAlign="center">
            <Spinner size="xl" mb={3} color="green.500" />
            <Text>Loading map...</Text>
          </Box>
        </Flex>
      )}
      
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        whenReady={handleMapLoad}
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // Add a subdomains attribute to distribute requests across multiple servers
          subdomains='abc'
        />
        
        <SetViewOnChange center={center} />
        
        {validPosts.map(post => {
          // Get coordinates from post
          const coordinates = post.location.coordinates;
          
          // MongoDB uses [longitude, latitude] format
          // Leaflet expects [latitude, longitude] format
          // Always swap the coordinates to ensure correct positioning
          const position = [coordinates[1], coordinates[0]];
          
          return (
            <Marker
              key={post._id}
              position={position}
              icon={post.type === 'Donate' ? donateIcon : requestIcon}
            >
              <Popup>
                <Box p={1}>
                  <Text fontWeight="bold" mb={1}>{post.title}</Text>
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
                  <Text fontSize="sm" mb={2}>{post.location.address}</Text>
                  <Button 
                    size="xs" 
                    colorScheme="brand" 
                    onClick={() => handleViewPost(post._id)}
                    width="100%"
                  >
                    View Details
                  </Button>
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {mapLoaded && validPosts.length === 0 && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          bg="white"
          p={4}
          borderRadius="md"
          boxShadow="md"
          zIndex="500"
          textAlign="center"
        >
          <Text>No posts with location data available</Text>
        </Box>
      )}
    </Box>
  );
};

export default MapView; 
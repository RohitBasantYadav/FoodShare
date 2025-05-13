import { Box, Heading, Text, Button, Flex, Container } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container maxW="container.md">
      <Flex
        direction="column"
        align="center"
        justify="center"
        minHeight="80vh"
        textAlign="center"
        py={10}
      >
        <Heading as="h1" size="4xl" color="brand.600" mb={6}>
          404
        </Heading>
        
        <Heading as="h2" size="xl" mb={4}>
          Page Not Found
        </Heading>
        
        <Text fontSize="lg" mb={8} color="gray.600">
          The page you're looking for doesn't exist or has been moved.
        </Text>
        
        <Box>
          <Button
            as={RouterLink}
            to="/"
            colorScheme="green"
            size="lg"
            fontWeight="bold"
          >
            Return to Home
          </Button>
        </Box>
      </Flex>
    </Container>
  );
};

export default NotFound; 
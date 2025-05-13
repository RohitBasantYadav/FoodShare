import { Flex, Spinner, Text, Box } from '@chakra-ui/react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Flex justify="center" align="center" my={10} direction="column">
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="brand.500"
        size="xl"
      />
      <Box mt={4}>
        <Text fontSize="lg" color="gray.600">{message}</Text>
      </Box>
    </Flex>
  );
};

export default LoadingSpinner; 
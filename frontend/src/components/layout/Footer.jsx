import { Box, Container, Stack, Text, Link, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      bg={useColorModeValue('white', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      borderTopWidth={1}
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Container
        as={Stack}
        maxW="container.xl"
        py={4}
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        justify={{ base: 'center', md: 'space-between' }}
        align={{ base: 'center', md: 'center' }}
      >
        <Text>© {new Date().getFullYear()} FoodShare. All rights reserved</Text>
        <Stack direction="row" spacing={6}>
          <Link as={RouterLink} to="/">
            Home
          </Link>
          <Link as={RouterLink} to="/about">
            About
          </Link>
          <Link as={RouterLink} to="/privacy">
            Privacy
          </Link>
          <Link as={RouterLink} to="/terms">
            Terms
          </Link>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer; 
import { Box } from '@chakra-ui/react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <Box minH="100vh" width={'100%'} display="flex" flexDirection="column">
      <Navbar />
      <Box flex="1" bg="gray.50">
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout; 
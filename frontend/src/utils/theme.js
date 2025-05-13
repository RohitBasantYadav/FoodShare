import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f7ee',
      100: '#c3e8d3',
      200: '#9fdab7',
      300: '#7acc9c',
      400: '#56be80',
      500: '#3da567',
      600: '#2d8150',
      700: '#1e5d38',
      800: '#0e3a20',
      900: '#001705',
    },
    secondary: {
      50: '#fff5e5',
      100: '#fde5bf',
      200: '#fad497',
      300: '#f8c46f',
      400: '#f5b447',
      500: '#dc9a2d',
      600: '#ac7821',
      700: '#7c5616',
      800: '#4c340a',
      900: '#201300',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        primary: {
          bg: 'brand.500',
          color: 'white',
          _hover: { bg: 'brand.600' },
        },
        secondary: {
          bg: 'secondary.500',
          color: 'white',
          _hover: { bg: 'secondary.600' },
        },
        outline: {
          border: '1px solid',
          borderColor: 'brand.500',
          color: 'brand.500',
        },
      },
    },
    Card: {
      baseStyle: {
        borderRadius: 'lg',
        boxShadow: 'md',
        p: 6,
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
});

export default theme; 
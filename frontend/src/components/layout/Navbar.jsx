import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BellIcon,
} from '@chakra-ui/icons';
import { logoutUser } from '../../features/auth/authSlice';

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Generate avatar URL based on user's name
  useEffect(() => {
    if (user?.name) {
      // Format name for URL: replace spaces with + and remove special characters
      const formattedName = user.name
        .trim()
        .replace(/\s+/g, '+')
        .replace(/[^\w\s+]/g, '');
      
      setAvatarUrl(`https://avatar.iran.liara.run/username?username=${formattedName}`);
    } else {
      setAvatarUrl(null);
    }
  }, [user]);

  // Handle avatar load error
  const handleAvatarError = () => {
    setAvatarUrl(user?.profilePicture || null);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  return (
    <Box boxSizing='border-box' width={'100%'} position={'sticky'} top={0} zIndex={1000} >
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        boxShadow="sm"
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            as={RouterLink}
            to="/"
            textAlign={{ base: 'center', md: 'left' }}
            fontWeight="bold"
            color="brand.500"
            fontSize="xl"
          >
            FoodShare
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
          align="center"
        >
          {isAuthenticated ? (
            <>
              <Box position="relative">
                <IconButton
                  as={RouterLink}
                  to="/notifications"
                  aria-label={'Notifications'}
                  icon={<BellIcon />}
                  size="md"
                  variant="ghost"
                />
                {unreadCount > 0 && (
                  <Badge
                    position="absolute"
                    top="-5px"
                    right="-5px"
                    colorScheme="red"
                    borderRadius="full"
                    fontSize="xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Box>
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}
                >
                  <Avatar
                    size={'sm'}
                    name={user?.name}
                    src={avatarUrl || user?.profilePicture}
                    onError={handleAvatarError}
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem 
                    as={RouterLink} 
                    to="/profile"
                    fontSize="md"
                    fontWeight={window.location.pathname.startsWith('/profile') ? 700 : 500}
                    bg={window.location.pathname.startsWith('/profile') ? 'gray.100' : 'transparent'}
                    color={window.location.pathname.startsWith('/profile') ? 'brand.500' : 'inherit'}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem 
                    as={RouterLink} 
                    to="/dashboard"
                    fontSize="md"
                    fontWeight={window.location.pathname.startsWith('/dashboard') ? 700 : 500}
                    bg={window.location.pathname.startsWith('/dashboard') ? 'gray.100' : 'transparent'}
                    color={window.location.pathname.startsWith('/dashboard') ? 'brand.500' : 'inherit'}
                  >
                    Dashboard
                  </MenuItem>
                  <MenuItem 
                    as={RouterLink} 
                    to="/posts/create"
                    fontSize="md"
                    fontWeight={window.location.pathname.startsWith('/posts/create') ? 700 : 500}
                    bg={window.location.pathname.startsWith('/posts/create') ? 'gray.100' : 'transparent'}
                    color={window.location.pathname.startsWith('/posts/create') ? 'brand.500' : 'inherit'}
                  >
                    Create Post
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem 
                    onClick={handleLogout}
                    fontSize="md"
                  >
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <>
              <Button
                as={RouterLink}
                fontSize={'md'}
                fontWeight={400}
                variant={'link'}
                to={'/login'}
                color={window.location.pathname === '/login' ? 'brand.500' : 'gray.600'}
                _hover={{
                  color: 'brand.800',
                }}
              >
                Login
              </Button>
              <Button
                as={RouterLink}
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'md'}
                fontWeight={600}
                color={'white'}
                bg={'brand.500'}
                to={'/register'}
                _hover={{
                  bg: 'brand.600',
                }}
              >
                Register
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
};

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('brand.800', 'white');
  const activeColor = useColorModeValue('brand.500', 'brand.300');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = window.location.pathname;

  // Helper function to check if a link is active
  const isActive = (path) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  // Style for active links
  const getActiveLinkStyle = (path) => {
    return isActive(path) ? {
      color: activeColor,
      fontWeight: 700,
      borderBottom: '2px solid',
      borderColor: 'brand.500',
    } : {};
  };

  return (
    <Stack direction={'row'} spacing={4} alignItems={'center'} boxSizing='border-box'>
      <Link
        as={RouterLink}
        p={2}
        to={'/'}
        fontSize={'md'}
        fontWeight={500}
        color={isActive('/') ? activeColor : linkColor}
        _hover={{
          textDecoration: 'none',
          color: linkHoverColor,
        }}
        sx={getActiveLinkStyle('/')}
      >
        Home
      </Link>
      
      <Link
        as={RouterLink}
        p={2}
        to={isAuthenticated ? '/posts/create' : '/login'}
        fontSize={'md'}
        fontWeight={500}
        color={isActive('/posts/create') ? activeColor : linkColor}
        _hover={{
          textDecoration: 'none',
          color: linkHoverColor,
        }}
        sx={getActiveLinkStyle('/posts/create')}
      >
        Create Post
      </Link>
      
      <Link
        as={RouterLink}
        p={2}
        to={'/about'}
        fontSize={'md'}
        fontWeight={500}
        color={isActive('/about') ? activeColor : linkColor}
        _hover={{
          textDecoration: 'none',
          color: linkHoverColor,
        }}
        sx={getActiveLinkStyle('/about')}
      >
        About
      </Link>
    </Stack>
  );
};

const MobileNav = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      <MobileNavItem label="Home" href="/" />
      <MobileNavItem 
        label={isAuthenticated ? "Create Post" : "Browse Posts"} 
        href={isAuthenticated ? "/posts/create" : "/"} 
      />
      <MobileNavItem label="About" href="/about" />
      
      {isAuthenticated && (
        <>
          <MobileNavItem label="Dashboard" href="/dashboard" />
          <MobileNavItem label="Profile" href="/profile" />
          <MobileNavItem 
            label={
              <Flex align="center">
                Notifications
                {unreadCount > 0 && (
                  <Badge ml={2} colorScheme="red" borderRadius="full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Flex>
            } 
            href="/notifications" 
          />
        </>
      )}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();
  const location = window.location.pathname;
  const isActive = href === '/' 
    ? location === '/' 
    : href !== '/' && location.startsWith(href);
  
  const activeColor = useColorModeValue('brand.500', 'brand.300');
  const normalColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
        borderLeft={isActive ? '4px solid' : 'none'}
        borderColor={isActive ? 'brand.500' : 'transparent'}
        pl={isActive ? 2 : 0}
      >
        <Text
          fontSize={'md'}
          fontWeight={isActive ? 700 : 600}
          color={isActive ? activeColor : normalColor}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} py={2} href={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

export default Navbar; 
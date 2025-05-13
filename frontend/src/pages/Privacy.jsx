import {
  Container,
  Box,
  Heading,
  Text,
  ListItem,
  OrderedList,
  UnorderedList,
  Link,
  Divider,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Privacy = () => {
  return (
    <Container maxW="container.lg" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={4} color="brand.700">
          Privacy Policy
        </Heading>
        <Text color="gray.600" mb={4}>
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
        <Text>
          At FoodShare, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
        </Text>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          1. Information We Collect
        </Heading>
        <Text mb={4}>We may collect information about you in various ways, including:</Text>
        <UnorderedList mb={4} spacing={2}>
          <ListItem>
            <Text fontWeight="bold">Personal Information:</Text>
            <Text>Name, email address, phone number, profile picture, and location information you provide when creating an account or posting on our platform.</Text>
          </ListItem>
          <ListItem>
            <Text fontWeight="bold">Usage Information:</Text>
            <Text>Information about how you use our platform, including browsing history, search queries, and interactions with other users.</Text>
          </ListItem>
          <ListItem>
            <Text fontWeight="bold">Device Information:</Text>
            <Text>Information about your device, including IP address, browser type, and operating system.</Text>
          </ListItem>
          <ListItem>
            <Text fontWeight="bold">Location Information:</Text>
            <Text>With your consent, we collect precise location data to show nearby food donations and requests.</Text>
          </ListItem>
        </UnorderedList>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          2. How We Use Your Information
        </Heading>
        <Text mb={4}>We may use the information we collect for various purposes, including to:</Text>
        <UnorderedList mb={4} spacing={2}>
          <ListItem>Provide, maintain, and improve our services</ListItem>
          <ListItem>Process and complete transactions</ListItem>
          <ListItem>Send you technical notices, updates, and support messages</ListItem>
          <ListItem>Connect food donors with recipients based on location</ListItem>
          <ListItem>Respond to your comments, questions, and requests</ListItem>
          <ListItem>Monitor and analyze trends, usage, and activities</ListItem>
          <ListItem>Detect, investigate, and prevent fraudulent or unauthorized activities</ListItem>
          <ListItem>Personalize your experience on our platform</ListItem>
        </UnorderedList>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          3. Sharing Your Information
        </Heading>
        <Text mb={4}>We may share your information in the following situations:</Text>
        <UnorderedList mb={4} spacing={2}>
          <ListItem>
            <Text fontWeight="bold">With Other Users:</Text>
            <Text>When you create food donation or request posts, certain information (like your name, profile picture, and approximate location) will be visible to other users.</Text>
          </ListItem>
          <ListItem>
            <Text fontWeight="bold">Service Providers:</Text>
            <Text>We may share information with third-party vendors who provide services on our behalf.</Text>
          </ListItem>
          <ListItem>
            <Text fontWeight="bold">Legal Requirements:</Text>
            <Text>We may disclose information if required by law or in response to valid requests by public authorities.</Text>
          </ListItem>
          <ListItem>
            <Text fontWeight="bold">Business Transfers:</Text>
            <Text>If FoodShare is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</Text>
          </ListItem>
        </UnorderedList>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          4. Data Security
        </Heading>
        <Text mb={4}>
          We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
        </Text>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          5. Your Choices
        </Heading>
        <Text mb={4}>You have several choices regarding your information:</Text>
        <UnorderedList mb={4} spacing={2}>
          <ListItem>
            <Text fontWeight="bold">Account Information:</Text>
            <Text>You can update your account information at any time by accessing your profile settings.</Text>
          </ListItem>
          <ListItem>
            <Text fontWeight="bold">Location Information:</Text>
            <Text>You can control location permissions through your device settings.</Text>
          </ListItem>
          <ListItem>
            <Text fontWeight="bold">Cookies:</Text>
            <Text>You can set your browser to refuse all or some browser cookies or to alert you when cookies are being sent.</Text>
          </ListItem>
          <ListItem>
            <Text fontWeight="bold">Account Deletion:</Text>
            <Text>You can request to delete your account by contacting us at privacy@foodshare.org.</Text>
          </ListItem>
        </UnorderedList>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          6. Changes to This Privacy Policy
        </Heading>
        <Text mb={4}>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
        </Text>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          7. Contact Us
        </Heading>
        <Text mb={4}>
          If you have any questions about this Privacy Policy, please contact us at{' '}
          <Link href="mailto:privacy@foodshare.org" color="brand.500">
            privacy@foodshare.org
          </Link>
          .
        </Text>
      </Box>

      <Divider mb={8} />

      <Box textAlign="center">
        <Text mb={4}>
          By using FoodShare, you agree to the collection and use of information in accordance with this Privacy Policy.
        </Text>
        <Link as={RouterLink} to="/terms" color="brand.500">
          Terms of Service
        </Link>
      </Box>
    </Container>
  );
};

export default Privacy; 
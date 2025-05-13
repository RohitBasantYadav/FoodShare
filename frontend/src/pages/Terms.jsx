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

const Terms = () => {
  return (
    <Container maxW="container.lg" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={4} color="brand.700">
          Terms of Service
        </Heading>
        <Text color="gray.600" mb={4}>
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
        <Text>
          Welcome to FoodShare! These Terms of Service govern your use of our platform and provide important information about your rights and responsibilities.
        </Text>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          1. Acceptance of Terms
        </Heading>
        <Text mb={4}>
          By accessing or using FoodShare, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our platform.
        </Text>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          2. Account Registration
        </Heading>
        <Text mb={4}>
          To use certain features of our platform, you may need to create an account. When you register, you agree to:
        </Text>
        <UnorderedList mb={4} spacing={2}>
          <ListItem>Provide accurate and complete information</ListItem>
          <ListItem>Maintain the security of your account credentials</ListItem>
          <ListItem>Promptly update your information if it changes</ListItem>
          <ListItem>Be responsible for all activities that occur under your account</ListItem>
        </UnorderedList>
        <Text>
          We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent or illegal activities.
        </Text>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          3. Food Sharing Guidelines
        </Heading>
        <Text mb={4}>
          When donating or requesting food through our platform, you agree to:
        </Text>
        <UnorderedList mb={4} spacing={2}>
          <ListItem>Provide accurate descriptions of food items, including quantity and expiration dates</ListItem>
          <ListItem>Only offer food that is safe for consumption and properly stored</ListItem>
          <ListItem>Not offer or request food items that are prohibited by law</ListItem>
          <ListItem>Meet in safe, public locations for food exchanges when possible</ListItem>
          <ListItem>Respect other users' time by keeping your commitments for pickups and deliveries</ListItem>
        </UnorderedList>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          4. User Content
        </Heading>
        <Text mb={4}>
          You retain ownership of any content you post on FoodShare, but you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with our services.
        </Text>
        <Text mb={4}>
          You are responsible for ensuring that your content:
        </Text>
        <UnorderedList mb={4} spacing={2}>
          <ListItem>Does not violate any intellectual property rights</ListItem>
          <ListItem>Is not deceptive, fraudulent, or misleading</ListItem>
          <ListItem>Does not contain harmful or offensive material</ListItem>
          <ListItem>Complies with all applicable laws and regulations</ListItem>
        </UnorderedList>
        <Text>
          We reserve the right to remove any content that violates these terms or that we find objectionable.
        </Text>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          5. Food Safety Disclaimer
        </Heading>
        <Text mb={4}>
          FoodShare is a platform that connects food donors and recipients, but we do not inspect or verify the quality or safety of food exchanged through our platform. Users must:
        </Text>
        <UnorderedList mb={4} spacing={2}>
          <ListItem>Use their own judgment when offering or accepting food</ListItem>
          <ListItem>Follow proper food safety practices when handling, storing, and transferring food</ListItem>
          <ListItem>Clearly communicate any potential allergens or dietary restrictions</ListItem>
        </UnorderedList>
        <Text fontWeight="bold">
          FoodShare is not responsible for any illness, injury, or other damages resulting from the consumption of food exchanged through our platform.
        </Text>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          6. Prohibited Activities
        </Heading>
        <Text mb={4}>
          You agree not to engage in any of the following prohibited activities:
        </Text>
        <UnorderedList mb={4} spacing={2}>
          <ListItem>Using the platform for illegal purposes</ListItem>
          <ListItem>Attempting to circumvent security measures</ListItem>
          <ListItem>Impersonating another person or entity</ListItem>
          <ListItem>Harassing, threatening, or intimidating other users</ListItem>
          <ListItem>Selling food items (our platform is for free exchange only)</ListItem>
          <ListItem>Creating multiple accounts to circumvent restrictions</ListItem>
          <ListItem>Posting false, misleading, or deceptive content</ListItem>
        </UnorderedList>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          7. Limitation of Liability
        </Heading>
        <Text mb={4}>
          To the fullest extent permitted by law, FoodShare and its affiliates, officers, employees, agents, partners, and licensors will not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with:
        </Text>
        <UnorderedList mb={4} spacing={2}>
          <ListItem>Your use of or inability to use our services</ListItem>
          <ListItem>Any interactions with other FoodShare users</ListItem>
          <ListItem>Any food items exchanged through our platform</ListItem>
        </UnorderedList>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          8. Changes to Terms
        </Heading>
        <Text mb={4}>
          We may modify these Terms of Service at any time. We will notify you of significant changes by posting a notice on our platform or sending you an email. Your continued use of FoodShare after such modifications constitutes your acceptance of the revised terms.
        </Text>
      </Box>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4} color="brand.600">
          9. Contact Information
        </Heading>
        <Text mb={4}>
          If you have any questions about these Terms of Service, please contact us at{' '}
          <Link href="mailto:legal@foodshare.org" color="brand.500">
            legal@foodshare.org
          </Link>
          .
        </Text>
      </Box>

      <Divider mb={8} />

      <Box textAlign="center">
        <Text mb={4}>
          By using FoodShare, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </Text>
        <Link as={RouterLink} to="/privacy" color="brand.500">
          Privacy Policy
        </Link>
      </Box>
    </Container>
  );
};

export default Terms; 
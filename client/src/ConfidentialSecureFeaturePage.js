import { Box, Heading, Text, Flex, Icon } from '@chakra-ui/react';
import { FaLock } from 'react-icons/fa';

export default function ConfidentialSecureFeaturePage() {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" px={4}>
      <Box maxW="500px" w="100%" p={8} bg="white" borderRadius="lg" boxShadow="lg">
        <Heading size="lg" mb={4}>Confidential & Secure</Heading>
        <Text color="gray.600" mb={4}>Emphasize data protection and privacy.</Text>
        <Flex align="center" gap={2} mb={2}>
          <Icon as={FaLock} color="teal.600" boxSize={6} />
          <Text fontSize="sm" color="gray.700">Data is encrypted</Text>
        </Flex>
        <Text fontSize="sm" color="gray.500">• Complies with HIPAA/GDPR (if applicable)</Text>
        <Text fontSize="sm" color="gray.500">• No data is shared without consent</Text>
        <Text fontSize="sm" color="gray.500">• Option for users to delete their data</Text>
        <Text fontSize="sm" color="gray.500">• Local storage or encrypted backend</Text>
      </Box>
    </Flex>
  );
} 
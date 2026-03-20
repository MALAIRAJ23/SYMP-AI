import { Box, Heading, Text, Flex, Tag, Button } from '@chakra-ui/react';
import { FaInfoCircle } from 'react-icons/fa';

export default function InstantSuggestionsFeaturePage() {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" px={4}>
      <Box maxW="500px" w="100%" p={8} bg="white" borderRadius="lg" boxShadow="lg">
        <Heading size="lg" mb={4}>Instant Suggestions</Heading>
        <Text color="gray.600" mb={4}>Suggest possible conditions or actions based on input.</Text>
        <Flex justify="center" gap={2} mb={2}>
          <Tag colorScheme="green">Common Cold</Tag>
          <Tag colorScheme="orange">Migraine</Tag>
          <Tag colorScheme="red">See a Doctor</Tag>
        </Flex>
        <Flex justify="center" gap={2} mb={2}>
          <Tag colorScheme="green">Low Risk</Tag>
          <Tag colorScheme="red">High Risk</Tag>
        </Flex>
        <Button size="sm" colorScheme="teal" leftIcon={<FaInfoCircle />}>More Info</Button>
        <Text fontSize="sm" color="gray.500" mt={4}>• AI-generated suggestions (diagnostic possibilities)</Text>
        <Text fontSize="sm" color="gray.500">• Priority level (Low Risk / High Risk / See a Doctor)</Text>
        <Text fontSize="sm" color="gray.500">• Loading animation while AI processes</Text>
      </Box>
    </Flex>
  );
} 
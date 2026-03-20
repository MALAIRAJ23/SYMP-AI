import { Box, Heading, Text, Icon, Flex, SimpleGrid } from '@chakra-ui/react';
import { FaKeyboard, FaLeaf, FaShieldAlt, FaRobot, FaUserMd } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
// Add this import at the top if not present
// import MedicationReminderPage from '../MedicationReminderPage';

const features = [
  {
    key: 'symptom-input',
    icon: FaKeyboard,
    emoji: '💻',
    title: 'Talk-to-Text Health',
    desc: 'Describe how you feel in your own words — no dropdowns needed.',
    path: '/feature/symptom-input',
  },
  {
    key: 'yoga',
    icon: FaLeaf,
    emoji: '🧘',
    title: 'YogAura',
    desc: 'Elevate your well-being with curated yoga flows for every need.',
    path: '/yoga',
  },
  {
    key: 'medication-reminder',
    icon: FaRobot,
    emoji: '💊',
    title: 'Medication Reminder',
    desc: 'Never miss a dose! Set reminders and get info on your medications.',
    path: '/feature/medication-reminder',
  },
  {
    key: 'book-doctor-home',
    icon: FaUserMd,
    emoji: '🏥',
    title: 'Book Your Doctor Home',
    desc: 'Book a doctor to visit your home and get treated at your convenience.',
    path: '/feature/book-doctor-home',
  },
];

// Cloud clip-path SVG polygon
const cloudClipPath =
  'polygon(10% 20%, 20% 10%, 40% 5%, 60% 10%, 70% 20%, 80% 10%, 90% 20%, 95% 40%, 100% 60%, 95% 80%, 90% 90%, 80% 95%, 60% 90%, 40% 95%, 20% 90%, 10% 80%, 5% 60%, 10% 40%)';

export default function FeaturesSection() {
  const navigate = useNavigate();
  return (
    <Flex id="features" minH="100vh" align="center" justify="center" bg="white" px={4} py={12} direction="column">
      <Heading size="lg" mb={10} textAlign="center" color="teal.700">Features</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} maxW="900px" mx="auto">
        {/* Top row: first two features */}
        {features.slice(0, 2).map((f) => (
          <Box
            key={f.key}
            p={8}
            bg="teal.50"
            borderRadius="3xl"
            boxShadow="xl"
            textAlign="center"
            cursor="pointer"
            minW={{ base: '90vw', md: '350px' }}
            maxW={{ base: '90vw', md: '400px' }}
            style={{
              clipPath: cloudClipPath,
              WebkitClipPath: cloudClipPath,
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
            _hover={{ boxShadow: '2xl', transform: 'translateY(-6px) scale(1.04)', bg: 'teal.100' }}
            onClick={() => navigate(f.path)}
          >
            <Flex justify="center" align="center" mb={4} gap={2}>
              <Icon as={f.icon} w={8} h={8} color="teal.400" />
              <Text fontSize="2xl">{f.emoji}</Text>
            </Flex>
            <Heading size="md" mb={2}>{f.title}</Heading>
            <Text color="gray.600">{f.desc}</Text>
          </Box>
        ))}
      </SimpleGrid>
      {/* Bottom row: third and fourth features centered */}
      <Flex justify="center" mt={8} gap={8} flexWrap="wrap">
        {features.slice(2).map((f) => (
          <Box
            key={f.key}
            p={8}
            bg="teal.50"
            borderRadius="3xl"
            boxShadow="xl"
            textAlign="center"
            cursor="pointer"
            minW={{ base: '90vw', md: '350px' }}
            maxW={{ base: '90vw', md: '400px' }}
            style={{
              clipPath: cloudClipPath,
              WebkitClipPath: cloudClipPath,
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
            _hover={{ boxShadow: '2xl', transform: 'translateY(-6px) scale(1.04)', bg: 'teal.100' }}
            onClick={() => navigate(f.path)}
          >
            <Flex justify="center" align="center" mb={4} gap={2}>
              <Icon as={f.icon} w={8} h={8} color="teal.400" />
              <Text fontSize="2xl">{f.emoji}</Text>
            </Flex>
            <Heading size="md" mb={2}>{f.title}</Heading>
            <Text color="gray.600">{f.desc}</Text>
          </Box>
        ))}
      </Flex>
    </Flex>
  );
} 
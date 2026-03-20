import { Box, Heading, Button, Text, Flex, Icon, useBreakpointValue } from '@chakra-ui/react';
import { useState } from 'react';
import { FaStepForward, FaEnvelope, FaPhone, FaPhoneAlt } from 'react-icons/fa';
import { Player } from '@lottiefiles/react-lottie-player';

const contactMethods = [
  {
    label: 'Email Support',
    value: 'support@sympai.com',
    icon: FaEnvelope,
    link: 'mailto:support@sympai.com',
    display: 'support@sympai.com',
  },
  {
    label: 'Mobile',
    value: '+91 98765 43210',
    icon: FaPhone,
    link: 'tel:+919876543210',
    display: '+91 98765 43210',
  },
  {
    label: 'Toll-Free',
    value: '1800-123-4567',
    icon: FaPhoneAlt,
    link: 'tel:18001234567',
    display: '1800-123-4567',
  },
];

export default function ContactSection() {
  const [current, setCurrent] = useState(0);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % contactMethods.length);
  };

  const method = contactMethods[current];

  return (
    <>
      <Flex
        id="contact"
        minH="100vh"
        align="center"
        justify="center"
        bg="gray.50"
        px={{ base: 2, sm: 4, md: 8 }}
        py={{ base: 8, md: 0 }}
        direction="column"
        position="relative"
      >
        <Box w="100%" maxW={{ base: '100%', sm: '90%', md: '400px' }} mx="auto">
          <Heading size={{ base: 'md', md: 'lg' }} mb={4} textAlign="center" color="teal.700">
            Contact / Support
          </Heading>
          <Box display="flex" justifyContent="center" mb={2}>
            <Player
              autoplay
              loop
              src="https://assets2.lottiefiles.com/packages/lf20_jcikwtux.json"
              style={{ height: isMobile ? 120 : 180, width: isMobile ? 120 : 180 }}
            />
          </Box>
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="2xl"
            p={{ base: 4, md: 6 }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={4}
            mb={4}
          >
            {contactMethods.map((method) => (
              <Flex key={method.label} align="center" gap={3} w="100%" justify="flex-start">
                <Icon as={method.icon} boxSize={8} color="teal.500" />
                <Box>
                  <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} color="gray.700">
                    {method.label}
                  </Text>
                  <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
                    <a href={method.link} style={{ color: '#319795', textDecoration: 'underline' }}>{method.display}</a>
                  </Text>
                </Box>
              </Flex>
            ))}
          </Box>
        </Box>
      </Flex>
      <Box
        as="footer"
        w="100%"
        py={4}
        bg="gray.100"
        position="relative"
        textAlign="center"
        zIndex={1}
      >
        <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
          MALAI RAJ R © 2024 SympAI. All rights reserved.
        </Text>
      </Box>
    </>
  );
} 